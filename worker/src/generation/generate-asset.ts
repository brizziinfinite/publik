// ============================================================================
// worker/src/generation/generate-asset.ts
// Gera 1 asset chamando Claude Haiku, parseia e valida com Zod.
// Retorna conteúdo + métricas de tokens. Falhas viram erros estruturados.
// ============================================================================

import Anthropic from "@anthropic-ai/sdk";
import {
  ASSET_SCHEMA_BY_KIND,
  type AssetKind,
} from "../../../types/sources";
import { getPrompt, type PromptContext } from "./prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-haiku-4-5-20251001"; // custo-eficiente
const MAX_TOKENS = 4096;

export interface GenerateAssetResult {
  content: unknown; // já validado pelo schema do kind
  tokens_input: number;
  tokens_output: number;
}

export async function generateAsset(
  kind: AssetKind,
  ctx: PromptContext
): Promise<GenerateAssetResult> {
  const { system, user } = getPrompt(kind, ctx);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages: [{ role: "user", content: user }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Resposta da IA não contém bloco de texto");
  }

  const raw = textBlock.text.trim();
  const json = extractJson(raw);

  // Valida com o schema correspondente ao kind
  const schema = ASSET_SCHEMA_BY_KIND[kind];
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    throw new Error(
      `JSON gerado não bate com schema de ${kind}: ${parsed.error.message.slice(
        0,
        300
      )}`
    );
  }

  return {
    content: parsed.data,
    tokens_input: response.usage.input_tokens,
    tokens_output: response.usage.output_tokens,
  };
}

// ----------------------------------------------------------------------------
// Tolera resposta com cercas markdown ou prefácio.
// Tenta o caminho rápido (parse direto), depois o robusto (extrai entre {...}).
// ----------------------------------------------------------------------------

function extractJson(raw: string): unknown {
  // Caminho rápido
  try {
    return JSON.parse(raw);
  } catch {
    /* fallback */
  }

  // Remove cercas markdown se vieram
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(stripped);
  } catch {
    /* tenta extrair primeiro objeto */
  }

  const first = stripped.indexOf("{");
  const last = stripped.lastIndexOf("}");
  if (first !== -1 && last > first) {
    const candidate = stripped.slice(first, last + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {
      throw new Error(
        `Falha ao parsear JSON da resposta: ${(e as Error).message}`
      );
    }
  }

  throw new Error("Resposta da IA não contém JSON parseável");
}
