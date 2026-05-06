// ============================================================================
// worker/src/queue/source-queue.ts
// BullMQ: fila única "source-processing" com 2 estágios:
//   1. job 'extract' → normaliza fonte em texto
//   2. job 'generate' → gera os 5 assets
// O 'extract' enfileira o 'generate' ao terminar com sucesso.
// ============================================================================

import { Queue, Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { createClient } from "@supabase/supabase-js";
import { extractSource } from "../extractors";
import { generateAsset } from "../generation/generate-asset";
import { generatePackageForSource } from "../generation/generate-package";
import type { AssetKind, SourceRecord } from "../../../types/sources";
import type { PromptContext } from "../generation/prompts";

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

const supabase = createClient(
  (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const QUEUE_NAME = "source-processing";

type JobData =
  | { kind: "extract"; source_id: string }
  | { kind: "generate"; source_id: string }
  | {
      kind: "regenerate-asset";
      asset_id: string;
      asset_kind: AssetKind;
      source_id: string;
    };

export const sourceQueue = new Queue<JobData>(QUEUE_NAME, { connection });

// ----------------------------------------------------------------------------
// API pública: enfileirar uma source nova
// ----------------------------------------------------------------------------

export async function enqueueSource(sourceId: string) {
  await sourceQueue.add(
    "extract",
    { kind: "extract", source_id: sourceId },
    {
      jobId: `extract:${sourceId}`,
      attempts: 2,
      backoff: { type: "exponential", delay: 5_000 },
      removeOnComplete: { age: 3600, count: 1000 },
      removeOnFail: { age: 24 * 3600 },
    }
  );
}

// ----------------------------------------------------------------------------
// Worker
// ----------------------------------------------------------------------------

export function startWorker() {
  const worker = new Worker<JobData>(
    QUEUE_NAME,
    async (job: Job<JobData>) => {
      if (job.data.kind === "extract") {
        return handleExtract(job.data.source_id);
      }
      if (job.data.kind === "generate") {
        return handleGenerate(job.data.source_id);
      }
      if (job.data.kind === "regenerate-asset") {
        return handleRegenerateAsset(
          job.data.asset_id,
          job.data.asset_kind,
          job.data.source_id
        );
      }
    },
    {
      connection,
      concurrency: 4, // 4 sources em paralelo
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} falhou:`, err.message);
  });

  return worker;
}

// ----------------------------------------------------------------------------
// Estágio 1: extração
// ----------------------------------------------------------------------------

async function handleExtract(sourceId: string) {
  // marca extracting
  await supabase
    .from("sources")
    .update({ status: "extracting", error_message: null })
    .eq("id", sourceId);

  const { data: source, error } = await supabase
    .from("sources")
    .select("*")
    .eq("id", sourceId)
    .single<SourceRecord>();

  if (error || !source) throw new Error(`Source ${sourceId} não encontrada`);

  try {
    const result = await extractSource({
      type: source.type,
      raw_text: source.raw_text,
      raw_url: source.raw_url,
      storage_path: source.storage_path,
    });

    if (!result.text || result.text.trim().length < 30) {
      throw new Error("Texto extraído é muito curto pra gerar conteúdo (<30 chars)");
    }

    await supabase
      .from("sources")
      .update({
        status: "extracted",
        extracted_text: result.text,
        extracted_metadata: result.metadata,
      })
      .eq("id", sourceId);

    // dispara estágio 2
    await sourceQueue.add(
      "generate",
      { kind: "generate", source_id: sourceId },
      {
        jobId: `generate:${sourceId}`,
        attempts: 1,
        removeOnComplete: { age: 3600, count: 1000 },
        removeOnFail: { age: 24 * 3600 },
      }
    );
  } catch (err) {
    const msg = (err as Error).message.slice(0, 500);
    await supabase
      .from("sources")
      .update({ status: "failed", error_message: msg })
      .eq("id", sourceId);
    throw err; // BullMQ marca o job como failed
  }
}

// ----------------------------------------------------------------------------
// Estágio 2: geração
// ----------------------------------------------------------------------------

async function handleGenerate(sourceId: string) {
  await generatePackageForSource(sourceId);
  // generatePackageForSource já atualiza source.status (ready|partial|failed)
}

// ----------------------------------------------------------------------------
// Regeneração de asset individual
// ----------------------------------------------------------------------------

async function handleRegenerateAsset(
  assetId: string,
  kind: AssetKind,
  sourceId: string
) {
  await supabase
    .from("content_assets")
    .update({ status: "generating", error_message: null })
    .eq("id", assetId);

  const { data: source, error: srcErr } = await supabase
    .from("sources")
    .select("*")
    .eq("id", sourceId)
    .single<SourceRecord>();

  if (srcErr || !source || !source.extracted_text) {
    await supabase
      .from("content_assets")
      .update({
        status: "failed",
        error_message: "Source ou extracted_text indisponivel pra regeneracao",
      })
      .eq("id", assetId);
    return;
  }

  const { data: brand } = await supabase
    .from("brands")
    .select("name, voice, audience")
    .eq("id", source.brand_id)
    .single<{ name: string; voice: string | null; audience: string | null }>();

  if (!brand) {
    await supabase
      .from("content_assets")
      .update({ status: "failed", error_message: "Brand nao encontrada" })
      .eq("id", assetId);
    return;
  }

  const ctx: PromptContext = {
    source_text: source.extracted_text,
    brand_name: brand.name,
    brand_voice: brand.voice ?? undefined,
    brand_audience: brand.audience ?? undefined,
    language: "pt-BR",
  };

  try {
    const out = await generateAsset(kind, ctx);
    await supabase
      .from("content_assets")
      .update({
        status: "ready",
        content: out.content,
        tokens_input: out.tokens_input,
        tokens_output: out.tokens_output,
        error_message: null,
      })
      .eq("id", assetId);
  } catch (err) {
    await supabase
      .from("content_assets")
      .update({
        status: "failed",
        error_message: (err as Error).message.slice(0, 500),
      })
      .eq("id", assetId);
  }
}
