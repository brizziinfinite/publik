import { z } from "zod";

export const postSchema = z.object({
  content: z.string().min(1, "O conteúdo não pode estar vazio"),
  platform: z.enum(["instagram", "tiktok", "facebook", "twitter"]),
  status: z.enum(["draft", "scheduled", "published"]),
  scheduled_at: z.string().nullable().optional(),
});

export type PostFormData = z.infer<typeof postSchema>;
