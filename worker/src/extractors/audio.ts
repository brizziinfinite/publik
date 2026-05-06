// ============================================================================
// worker/src/extractors/audio.ts
// Baixa áudio do Supabase Storage e transcreve com Whisper.
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import type { ExtractionResult } from "./index";

const supabase = createClient(
  (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // worker bypassa RLS
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB (limite Whisper)

export async function extractFromAudio(
  storagePath: string
): Promise<ExtractionResult> {
  // 1. Baixar do Storage
  const { data, error } = await supabase.storage
    .from("sources")
    .download(storagePath);

  if (error || !data) {
    throw new Error(`Falha ao baixar áudio: ${error?.message ?? "sem dados"}`);
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  if (buffer.length > MAX_BYTES) {
    throw new Error(
      `Áudio excede ${MAX_BYTES / 1024 / 1024} MB. Atual: ${(
        buffer.length /
        1024 /
        1024
      ).toFixed(1)} MB`
    );
  }

  // 2. Transcrever com Whisper
  // OpenAI SDK aceita File-like; em Node 20+ temos File global.
  const filename = storagePath.split("/").pop() ?? "audio.mp3";
  const file = new File([buffer], filename, {
    type: data.type || "audio/mpeg",
  });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "pt", // hint pra PT-BR; remover se quiser auto-detect
    response_format: "verbose_json",
  });

  return {
    text: transcription.text,
    metadata: {
      language: transcription.language,
      duration_seconds: transcription.duration,
      filename,
      size_bytes: buffer.length,
    },
  };
}
