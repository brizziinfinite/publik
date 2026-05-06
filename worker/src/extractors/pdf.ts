// ============================================================================
// worker/src/extractors/pdf.ts
// Baixa PDF do Storage e extrai texto com pdf-parse.
// ============================================================================

import { createClient } from "@supabase/supabase-js";
// @ts-expect-error pdf-parse não tem types oficiais
import pdfParse from "pdf-parse";
import type { ExtractionResult } from "./index";

const supabase = createClient(
  (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_PAGES = 50;

export async function extractFromPdf(
  storagePath: string
): Promise<ExtractionResult> {
  const { data, error } = await supabase.storage
    .from("sources")
    .download(storagePath);

  if (error || !data) {
    throw new Error(`Falha ao baixar PDF: ${error?.message ?? "sem dados"}`);
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  if (buffer.length > MAX_BYTES) {
    throw new Error(`PDF excede ${MAX_BYTES / 1024 / 1024} MB`);
  }

  const parsed = await pdfParse(buffer, { max: MAX_PAGES });

  if (!parsed.text || parsed.text.trim().length < 50) {
    throw new Error(
      "PDF parece ser escaneado ou vazio (pouco texto extraível). " +
        "OCR ainda não implementado no v1."
    );
  }

  return {
    text: parsed.text.trim(),
    metadata: {
      pages: parsed.numpages,
      info: parsed.info ?? null,
      size_bytes: buffer.length,
    },
  };
}
