import { createClient } from "@/lib/supabase/client";
import type { TablesInsert } from "@/types/database";

type IdeaFormat = "carrossel" | "reel" | "story" | "blog" | "email" | "post";

interface PackageRow {
  id: string;
  brand_id: string;
  user_id: string;
  idea_id: string;
  format: IdeaFormat;
  post_id: string | null;
  post_content: { caption?: string; first_comment?: string } | null;
  blog_content: { title?: string; intro?: string; conclusion?: string } | null;
  email_content: { subject?: string; body_html?: string } | null;
  carousel_slides: Array<{ body?: string }> | null;
  reel_script: { hook_3s?: string; cta_final?: string } | null;
  story_frames: Array<{ text?: string }> | null;
}

interface IdeaRow {
  scheduled_for: string | null;
}

function inferPlatform(format: IdeaFormat): TablesInsert<"posts">["platform"] {
  if (["carrossel", "reel", "story", "post", "blog"].includes(format)) return "instagram";
  return "instagram";
}

function extractContent(pkg: PackageRow): string {
  switch (pkg.format) {
    case "post":
      return pkg.post_content?.caption ?? "";
    case "carrossel":
      return pkg.carousel_slides?.map((s, i) => `Slide ${i + 1}: ${s.body ?? ""}`).join("\n") ?? "";
    case "reel":
      return pkg.reel_script?.hook_3s ?? "";
    case "story":
      return pkg.story_frames?.map((f, i) => `Frame ${i + 1}: ${f.text ?? ""}`).join("\n") ?? "";
    case "blog":
      return [pkg.blog_content?.title, pkg.blog_content?.intro, pkg.blog_content?.conclusion]
        .filter(Boolean)
        .join("\n\n");
    case "email":
      return `Assunto: ${pkg.email_content?.subject ?? ""}\n\n${pkg.email_content?.body_html ?? ""}`;
  }
}

function scheduledAtFromIdea(scheduledFor: string | null): string {
  if (!scheduledFor) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `${tomorrow.toISOString().slice(0, 10)}T09:00:00-03:00`;
  }
  return `${scheduledFor}T09:00:00-03:00`;
}

export async function convertToPost(packageId: string): Promise<{ post_id: string }> {
  const supabase = createClient();

  const { data: pkg, error: pkgErr } = await supabase
    .from("content_packages")
    .select("*")
    .eq("id", packageId)
    .single();

  if (pkgErr || !pkg) throw new Error("Pacote não encontrado");
  const p = pkg as unknown as PackageRow;

  if (p.post_id) return { post_id: p.post_id };

  const { data: idea } = await supabase
    .from("content_ideas")
    .select("scheduled_for")
    .eq("id", p.idea_id)
    .single();

  const i = idea as unknown as IdeaRow | null;

  const content     = extractContent(p);
  const platform    = inferPlatform(p.format);
  const scheduledAt = scheduledAtFromIdea(i?.scheduled_for ?? null);

  const newPost: TablesInsert<"posts"> = {
    brand_id:     p.brand_id,
    user_id:      p.user_id,
    content,
    media_urls:   [],
    platform,
    scheduled_at: scheduledAt,
    status:       "scheduled",
  };

  const { data: post, error: postErr } = await supabase
    .from("posts")
    .insert(newPost)
    .select("id")
    .single();

  if (postErr || !post) throw new Error("Erro ao criar post: " + postErr?.message);
  const postId = (post as { id: string }).id;

  await supabase
    .from("content_packages")
    .update({ status: "converted_to_post", post_id: postId })
    .eq("id", packageId);

  return { post_id: postId };
}
