// ============================================================================
// worker/src/generation/generate-package.ts
// Orquestra a geração dos 5 assets em paralelo.
// Falha em 1 asset NÃO derruba os outros.
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import {
  ASSET_KINDS,
  type AssetKind,
  type SourceRecord,
} from "../../../types/sources";
import { generateAsset } from "./generate-asset";
import type { PromptContext } from "./prompts";

const supabase = createClient(
  (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BrandRow {
  id: string;
  name: string;
  voice: string | null;
  audience: string | null;
}

export async function generatePackageForSource(sourceId: string): Promise<{
  package_id: string;
  succeeded: AssetKind[];
  failed: AssetKind[];
}> {
  // 1. Carrega source + brand
  const { data: source, error: srcErr } = await supabase
    .from("sources")
    .select("*")
    .eq("id", sourceId)
    .single<SourceRecord>();

  if (srcErr || !source) throw new Error(`Source ${sourceId} não encontrada`);
  if (!source.extracted_text) {
    throw new Error("Source sem extracted_text — extraction precisa rodar antes");
  }

  const { data: brand, error: brErr } = await supabase
    .from("brands")
    .select("id, name, voice, audience")
    .eq("id", source.brand_id)
    .single<BrandRow>();

  if (brErr || !brand) throw new Error(`Brand ${source.brand_id} não encontrada`);

  // 2. Cria package
  const { data: pkg, error: pkgErr } = await supabase
    .from("content_packages")
    .insert({
      source_id: source.id,
      user_id: source.user_id,
      brand_id: source.brand_id,
      generation_config: {
        model: "claude-haiku-4-5-20251001",
        timestamp: new Date().toISOString(),
      },
    })
    .select("id")
    .single<{ id: string }>();

  if (pkgErr || !pkg) throw new Error(`Falha ao criar package: ${pkgErr?.message}`);

  // 3. Cria 5 placeholders de asset (status pending)
  const placeholders = ASSET_KINDS.map((kind) => ({
    package_id: pkg.id,
    source_id: source.id,
    user_id: source.user_id,
    brand_id: source.brand_id,
    kind,
    status: "pending" as const,
  }));

  await supabase.from("content_assets").insert(placeholders);

  // 4. Atualiza source para 'generating'
  await supabase
    .from("sources")
    .update({ status: "generating" })
    .eq("id", source.id);

  // 5. Monta contexto e dispara em paralelo
  const ctx: PromptContext = {
    source_text: source.extracted_text,
    brand_name: brand.name,
    brand_voice: brand.voice ?? undefined,
    brand_audience: brand.audience ?? undefined,
    language: "pt-BR",
  };

  const results = await Promise.allSettled(
    ASSET_KINDS.map(async (kind) => {
      // marca generating
      await supabase
        .from("content_assets")
        .update({ status: "generating" })
        .eq("package_id", pkg.id)
        .eq("kind", kind);

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
          .eq("package_id", pkg.id)
          .eq("kind", kind);
        return { kind, ok: true as const };
      } catch (err) {
        const msg = (err as Error).message.slice(0, 500);
        await supabase
          .from("content_assets")
          .update({ status: "failed", error_message: msg })
          .eq("package_id", pkg.id)
          .eq("kind", kind);
        return { kind, ok: false as const, error: msg };
      }
    })
  );

  // 6. Consolida e atualiza status final da source
  const succeeded: AssetKind[] = [];
  const failed: AssetKind[] = [];

  for (const r of results) {
    if (r.status === "fulfilled") {
      if (r.value.ok) succeeded.push(r.value.kind);
      else failed.push(r.value.kind);
    } else {
      // não deveria cair aqui (capturamos no try/catch interno), mas por segurança:
      console.error("allSettled rejected (inesperado):", r.reason);
    }
  }

  const finalStatus =
    failed.length === 0
      ? "ready"
      : succeeded.length === 0
      ? "failed"
      : "partial";

  await supabase
    .from("sources")
    .update({
      status: finalStatus,
      error_message: failed.length > 0 ? `Falhas: ${failed.join(", ")}` : null,
    })
    .eq("id", source.id);

  return { package_id: pkg.id, succeeded, failed };
}
