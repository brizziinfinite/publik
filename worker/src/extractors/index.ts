// ============================================================================
// worker/src/extractors/index.ts
// Normaliza qualquer source.type em texto plano + metadata.
// Roda no worker Express, NÃO no Next.js.
// ============================================================================

import type { SourceType } from "../../../types/sources";
import { extractFromText } from "./text";
import { extractFromAudio } from "./audio";
import { extractFromUrl } from "./url";
import { extractFromPdf } from "./pdf";

export interface ExtractionResult {
  text: string;
  metadata: Record<string, unknown>;
}

export interface ExtractionInput {
  type: SourceType;
  raw_text?: string | null;
  raw_url?: string | null;
  storage_path?: string | null;
}

export async function extractSource(
  input: ExtractionInput
): Promise<ExtractionResult> {
  switch (input.type) {
    case "text":
      if (!input.raw_text) throw new Error("raw_text obrigatório");
      return extractFromText(input.raw_text);

    case "audio":
      if (!input.storage_path) throw new Error("storage_path obrigatório");
      return extractFromAudio(input.storage_path);

    case "url":
      if (!input.raw_url) throw new Error("raw_url obrigatório");
      return extractFromUrl(input.raw_url);

    case "pdf":
      if (!input.storage_path) throw new Error("storage_path obrigatório");
      return extractFromPdf(input.storage_path);

    default:
      throw new Error(`Tipo de fonte nao suportado: ${input.type satisfies never}`);
  }
}
