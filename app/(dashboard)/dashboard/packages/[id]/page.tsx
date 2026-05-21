"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Layers, ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { convertToPost } from "@/lib/packages/convertToPost";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type PackageStatus = "generating" | "pending_review" | "approved" | "converted_to_post" | "rejected" | "failed";
type PackageFormat = "carrossel" | "reel" | "story" | "blog" | "email" | "post";

interface CarouselSlide {
  title?: string;
  body?: string;
  cta?: string;
}

interface StoryFrame {
  text?: string;
  sticker?: string;
}

interface ContentPackage {
  id: string;
  brand_id: string;
  idea_id: string;
  format: PackageFormat;
  status: PackageStatus;
  visual_prompt: string | null;
  estimated_post_length: number | null;
  llm_model: string | null;
  llm_cost_usd: number;
  post_id: string | null;
  error_message: string | null;
  created_at: string;
  carousel_slides: CarouselSlide[] | null;
  reel_script: {
    hook_3s?: string;
    duration_seconds?: number;
    scenes?: Array<{
      scene?: number;
      voiceover?: string;
      onscreen_text?: string;
      visual_description?: string;
      duration_s?: number;
    }>;
    cta_final?: string;
    music_mood?: string;
  } | null;
  story_frames: StoryFrame[] | null;
  blog_content: { title?: string; intro?: string; conclusion?: string } | null;
  email_content: { subject?: string; preview_text?: string; body_html?: string } | null;
  post_content: { caption?: string; first_comment?: string } | null;
}

// ─── Helpers visuais ─────────────────────────────────────────────────────────

const FORMAT_COLORS: Record<PackageFormat, string> = {
  carrossel: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  reel:      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  story:     "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  blog:      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  email:     "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  post:      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

const STATUS_LABELS: Record<PackageStatus, string> = {
  generating:         "Gerando",
  pending_review:     "Aguardando revisão",
  approved:           "Aprovado",
  converted_to_post:  "Convertido em post",
  rejected:           "Rejeitado",
  failed:             "Falhou",
};

// ─── Renderizadores por formato ───────────────────────────────────────────────

function CarouselContent({ slides }: { slides: CarouselSlide[] }) {
  return (
    <div className="flex flex-col gap-4">
      {slides.map((slide, i) => (
        <div key={i} className="rounded-lg border border-border p-4 flex flex-col gap-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Slide {i + 1}</p>
          {slide.title && <p className="font-semibold text-sm">{slide.title}</p>}
          {slide.body && <p className="text-sm text-muted-foreground">{slide.body}</p>}
          {slide.cta && (
            <p className="text-xs font-medium text-primary mt-1">CTA: {slide.cta}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ReelContent({ script }: { script: NonNullable<ContentPackage["reel_script"]> }) {
  return (
    <div className="flex flex-col gap-4">
      {script.hook_3s && (
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Hook (3s)</p>
          <p className="text-sm font-semibold">&quot;{script.hook_3s}&quot;</p>
        </div>
      )}
      {script.duration_seconds && (
        <p className="text-xs text-muted-foreground">Duração estimada: {script.duration_seconds}s</p>
      )}
      {script.scenes && script.scenes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Cenas</p>
          {script.scenes.map((scene, i) => (
            <div key={i} className="rounded-lg border border-border p-4 flex flex-col gap-1">
              <p className="text-xs font-semibold text-muted-foreground">Cena {scene.scene ?? i + 1} {scene.duration_s ? `· ${scene.duration_s}s` : ""}</p>
              {scene.voiceover && <p className="text-sm"><span className="font-medium">Voiceover:</span> {scene.voiceover}</p>}
              {scene.onscreen_text && <p className="text-sm"><span className="font-medium">Tela:</span> {scene.onscreen_text}</p>}
              {scene.visual_description && <p className="text-xs text-muted-foreground">{scene.visual_description}</p>}
            </div>
          ))}
        </div>
      )}
      {script.cta_final && (
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">CTA Final</p>
          <p className="text-sm font-medium text-primary">{script.cta_final}</p>
        </div>
      )}
      {script.music_mood && (
        <p className="text-xs text-muted-foreground">Música sugerida: {script.music_mood}</p>
      )}
    </div>
  );
}

function StoryContent({ frames }: { frames: StoryFrame[] }) {
  return (
    <div className="flex flex-col gap-4">
      {frames.map((frame, i) => (
        <div key={i} className="rounded-lg border border-border p-4 flex flex-col gap-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Frame {i + 1}</p>
          {frame.text && <p className="text-sm">{frame.text}</p>}
          {frame.sticker && (
            <p className="text-xs text-muted-foreground">Sticker: {frame.sticker}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function BlogContent({ content }: { content: NonNullable<ContentPackage["blog_content"]> }) {
  return (
    <div className="flex flex-col gap-4">
      {content.title && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Título</p>
          <p className="text-lg font-bold">{content.title}</p>
        </div>
      )}
      {content.intro && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Introdução</p>
          <p className="text-sm whitespace-pre-wrap">{content.intro}</p>
        </div>
      )}
      {content.conclusion && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Conclusão</p>
          <p className="text-sm whitespace-pre-wrap">{content.conclusion}</p>
        </div>
      )}
    </div>
  );
}

function EmailContent({ content }: { content: NonNullable<ContentPackage["email_content"]> }) {
  return (
    <div className="flex flex-col gap-4">
      {content.subject && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Assunto</p>
          <p className="font-semibold">{content.subject}</p>
        </div>
      )}
      {content.preview_text && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Preview</p>
          <p className="text-sm text-muted-foreground italic">{content.preview_text}</p>
        </div>
      )}
      {content.body_html && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Corpo</p>
          <div className="rounded-lg border border-border p-4 text-sm whitespace-pre-wrap">
            {content.body_html}
          </div>
        </div>
      )}
    </div>
  );
}

function PostContent({ content }: { content: NonNullable<ContentPackage["post_content"]> }) {
  return (
    <div className="flex flex-col gap-4">
      {content.caption && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Caption</p>
          <p className="text-sm whitespace-pre-wrap">{content.caption}</p>
        </div>
      )}
      {content.first_comment && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Primeiro comentário</p>
          <p className="text-sm text-muted-foreground">{content.first_comment}</p>
        </div>
      )}
    </div>
  );
}

function PackageContent({ pkg }: { pkg: ContentPackage }) {
  switch (pkg.format) {
    case "carrossel":
      return pkg.carousel_slides ? <CarouselContent slides={pkg.carousel_slides} /> : null;
    case "reel":
      return pkg.reel_script ? <ReelContent script={pkg.reel_script} /> : null;
    case "story":
      return pkg.story_frames ? <StoryContent frames={pkg.story_frames} /> : null;
    case "blog":
      return pkg.blog_content ? <BlogContent content={pkg.blog_content} /> : null;
    case "email":
      return pkg.email_content ? <EmailContent content={pkg.email_content} /> : null;
    case "post":
      return pkg.post_content ? <PostContent content={pkg.post_content} /> : null;
  }
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function PackageDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [pkg, setPkg] = useState<ContentPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("content_packages")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        toast.error("Pacote não encontrado.");
        router.push("/dashboard/packages");
      } else {
        setPkg(data as ContentPackage);
      }
      setLoading(false);
    }
    void load();
  }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleApprove() {
    if (!pkg) return;
    setApproving(true);
    const { error } = await supabase
      .from("content_packages")
      .update({ status: "approved" })
      .eq("id", pkg.id);

    if (error) {
      toast.error("Erro ao aprovar: " + error.message);
    } else {
      setPkg({ ...pkg, status: "approved" });
      toast.success("Pacote aprovado!");
    }
    setApproving(false);
  }

  async function handleReject() {
    if (!pkg) return;
    setRejecting(true);
    const { error } = await supabase
      .from("content_packages")
      .update({ status: "rejected" })
      .eq("id", pkg.id);

    if (error) {
      toast.error("Erro ao rejeitar: " + error.message);
    } else {
      setPkg({ ...pkg, status: "rejected" });
      toast.info("Pacote rejeitado.");
    }
    setRejecting(false);
  }

  async function handleConvert() {
    if (!pkg) return;
    setConverting(true);
    try {
      const { post_id } = await convertToPost(pkg.id);
      setPkg({ ...pkg, status: "converted_to_post", post_id });
      toast.success("Post criado com sucesso!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error("Erro ao converter: " + message);
    } finally {
      setConverting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!pkg) return null;

  const isPendingReview = pkg.status === "pending_review";
  const isApproved = pkg.status === "approved";
  const isConverted = pkg.status === "converted_to_post";

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/packages")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 flex items-center gap-3">
          <Layers className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Pacote de Conteúdo</h1>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${FORMAT_COLORS[pkg.format]}`}>
            {pkg.format}
          </span>
          <Badge variant="outline" className="text-xs">
            {STATUS_LABELS[pkg.status]}
          </Badge>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="rounded-lg border border-border bg-card p-6">
        <PackageContent pkg={pkg} />
      </div>

      {/* Visual prompt */}
      {pkg.visual_prompt && (
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Prompt visual</p>
          <p className="text-sm">{pkg.visual_prompt}</p>
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {pkg.llm_model && <span>Modelo: {pkg.llm_model}</span>}
        {pkg.llm_cost_usd > 0 && <span>Custo: ${pkg.llm_cost_usd.toFixed(6)}</span>}
        {pkg.estimated_post_length && <span>~{pkg.estimated_post_length} palavras</span>}
        <span>Criado: {new Date(pkg.created_at).toLocaleString("pt-BR")}</span>
      </div>

      {/* Erro */}
      {pkg.error_message && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {pkg.error_message}
        </div>
      )}

      {/* Ações */}
      {isConverted ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-green-500" />
          Post criado com sucesso.
          {pkg.post_id && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/dashboard/posts`)}
            >
              Ver post
            </Button>
          )}
        </div>
      ) : (
        <div className="flex gap-3">
          {isPendingReview && (
            <>
              <Button
                onClick={handleApprove}
                disabled={approving}
                className="gap-2"
              >
                {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Aprovar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={rejecting}
                className="gap-2"
              >
                {rejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Rejeitar
              </Button>
            </>
          )}
          {isApproved && (
            <Button
              onClick={handleConvert}
              disabled={converting}
              className="gap-2"
            >
              {converting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
              Converter em post
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
