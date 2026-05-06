// ============================================================================
// types/sources.ts
// Tipos compartilhados entre Next.js (web) e Express worker
// ============================================================================

import { z } from "zod";

// ----------------------------------------------------------------------------
// Enums (espelham o schema Supabase)
// ----------------------------------------------------------------------------

export const SourceTypeSchema = z.enum(["text", "audio", "url", "pdf"]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const SourceStatusSchema = z.enum([
  "queued",
  "extracting",
  "extracted",
  "generating",
  "ready",
  "partial",
  "failed",
]);
export type SourceStatus = z.infer<typeof SourceStatusSchema>;

export const AssetKindSchema = z.enum([
  "carousel",
  "stories",
  "reel_script",
  "email",
  "blog",
]);
export type AssetKind = z.infer<typeof AssetKindSchema>;

export const AssetStatusSchema = z.enum([
  "pending",
  "generating",
  "ready",
  "failed",
]);
export type AssetStatus = z.infer<typeof AssetStatusSchema>;

export const ASSET_KINDS: AssetKind[] = [
  "carousel",
  "stories",
  "reel_script",
  "email",
  "blog",
];

// ----------------------------------------------------------------------------
// Inputs da API
// ----------------------------------------------------------------------------

export const CreateSourceInputSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    brand_id: z.string().uuid(),
    raw_text: z.string().min(50).max(50_000),
  }),
  z.object({
    type: z.literal("url"),
    brand_id: z.string().uuid(),
    raw_url: z.string().url(),
  }),
  z.object({
    type: z.literal("audio"),
    brand_id: z.string().uuid(),
    storage_path: z.string().min(1),
  }),
  z.object({
    type: z.literal("pdf"),
    brand_id: z.string().uuid(),
    storage_path: z.string().min(1),
  }),
]);
export type CreateSourceInput = z.infer<typeof CreateSourceInputSchema>;

// ----------------------------------------------------------------------------
// Conteúdo de cada asset (payload do campo content jsonb)
// ----------------------------------------------------------------------------

export const CarouselAssetSchema = z.object({
  hook: z.string(),
  slides: z
    .array(
      z.object({
        title: z.string(),
        body: z.string(),
        layout: z
          .enum(["title", "text", "list", "quote", "stat", "cta"])
          .default("text"),
      })
    )
    .min(6)
    .max(10),
  cta_slide: z.string(),
});
export type CarouselAsset = z.infer<typeof CarouselAssetSchema>;

export const StoriesAssetSchema = z.object({
  stories: z
    .array(
      z.object({
        text: z.string().max(280),
        visual_hint: z.string(),
      })
    )
    .length(3),
});
export type StoriesAsset = z.infer<typeof StoriesAssetSchema>;

export const ReelScriptAssetSchema = z.object({
  hook: z.string(),
  body: z.string(),
  cta: z.string(),
  duration_seconds: z.number().min(15).max(90),
  broll_hints: z.array(z.string()),
  voice_notes: z.string(),
});
export type ReelScriptAsset = z.infer<typeof ReelScriptAssetSchema>;

export const EmailAssetSchema = z.object({
  subject: z.string().max(80),
  preview: z.string().max(140),
  body_html: z.string(),
  body_text: z.string(),
  cta: z.object({
    label: z.string(),
    url: z.string().optional(),
  }),
});
export type EmailAsset = z.infer<typeof EmailAssetSchema>;

export const BlogAssetSchema = z.object({
  title: z.string(),
  slug: z.string(),
  body_md: z.string(),
  meta_description: z.string().max(160),
  tags: z.array(z.string()).max(8),
});
export type BlogAsset = z.infer<typeof BlogAssetSchema>;

// Map kind → schema (útil pra validação dinâmica)
export const ASSET_SCHEMA_BY_KIND = {
  carousel: CarouselAssetSchema,
  stories: StoriesAssetSchema,
  reel_script: ReelScriptAssetSchema,
  email: EmailAssetSchema,
  blog: BlogAssetSchema,
} as const;

// ----------------------------------------------------------------------------
// Records lidos do banco
// ----------------------------------------------------------------------------

export interface SourceRecord {
  id: string;
  user_id: string;
  brand_id: string;
  type: SourceType;
  status: SourceStatus;
  raw_text: string | null;
  raw_url: string | null;
  storage_path: string | null;
  extracted_text: string | null;
  extracted_metadata: Record<string, unknown>;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentAssetRecord {
  id: string;
  package_id: string;
  source_id: string;
  user_id: string;
  brand_id: string;
  kind: AssetKind;
  status: AssetStatus;
  content: unknown; // valida com ASSET_SCHEMA_BY_KIND[kind]
  error_message: string | null;
  tokens_input: number;
  tokens_output: number;
  created_at: string;
  updated_at: string;
}
