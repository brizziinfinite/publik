// worker/src/extractors/text.ts
import type { ExtractionResult } from "./index";

export async function extractFromText(raw: string): Promise<ExtractionResult> {
  const text = raw.trim().replace(/\r\n/g, "\n");

  return {
    text,
    metadata: {
      char_count: text.length,
      word_count: text.split(/\s+/).filter(Boolean).length,
    },
  };
}
