"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles, ThumbsUp, ThumbsDown, Loader2, RefreshCw, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import type { TablesUpdate } from "@/types/database";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type IdeaStatus = "pending" | "approved" | "rejected" | "generated" | "posted" | "archived";
type IdeaFormat = "carrossel" | "reel" | "story" | "blog" | "email" | "post";

interface ContentIdea {
  id: string;
  brand_id: string;
  angle: string;
  topic: string;
  hook: string | null;
  detail: string | null;
  cta: string | null;
  format: IdeaFormat;
  pillar: string | null;
  rationale: string | null;
  contributes_to: string | null;
  scheduled_for: string | null;
  week_of: string | null;
  status: IdeaStatus;
  llm_model: string | null;
  created_at: string;
}

// ─── Helpers visuais ─────────────────────────────────────────────────────────

const FORMAT_COLORS: Record<IdeaFormat, string> = {
  carrossel: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  reel:      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  story:     "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  blog:      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  email:     "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  post:      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

const STATUS_LABELS: Record<IdeaStatus, string> = {
  pending:   "Pendente",
  approved:  "Aprovado",
  rejected:  "Rejeitado",
  generated: "Gerado",
  posted:    "Publicado",
  archived:  "Arquivado",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

// ─── Componente de card de ideia ─────────────────────────────────────────────

interface IdeaCardProps {
  idea: ContentIdea;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (idea: ContentIdea) => void;
}

function IdeaCard({ idea, onApprove, onReject, onEdit }: IdeaCardProps) {
  const isApproved = idea.status === "approved";
  const isRejected = idea.status === "rejected";

  return (
    <div className="rounded-lg border border-border bg-card flex flex-col shadow-sm">
      {/* Conteúdo */}
      <div className="flex flex-col gap-2 p-4">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${FORMAT_COLORS[idea.format]}`}>
              {idea.format}
            </span>
            {idea.pillar && (
              <Badge variant="outline" className="text-xs">
                {idea.pillar}
              </Badge>
            )}
            {idea.status !== "pending" && (
              <Badge variant="secondary" className="text-xs">
                {STATUS_LABELS[idea.status]}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(idea.scheduled_for)}
          </span>
        </div>

        {/* Ângulo */}
        {idea.angle && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide line-clamp-1">
            {idea.angle}
          </p>
        )}

        {/* Tópico */}
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
          {idea.topic}
        </p>

        {/* Hook */}
        {idea.hook && (
          <div className="rounded bg-muted/60 px-3 py-2 text-xs italic text-muted-foreground line-clamp-2">
            &quot;{idea.hook}&quot;
          </div>
        )}

        {/* Detail */}
        {idea.detail && (
          <p className="text-xs text-muted-foreground line-clamp-3">{idea.detail}</p>
        )}

        {/* CTA */}
        {idea.cta && (
          <p className="text-xs font-medium text-primary line-clamp-2">CTA: {idea.cta}</p>
        )}

        {/* Contribuição */}
        {idea.contributes_to && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            <span className="font-medium">Contribui: </span>{idea.contributes_to}
          </p>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-2 p-3 border-t border-border">
        <Button
          size="sm"
          variant={isApproved ? "default" : "outline"}
          className="flex-1 gap-1 text-xs"
          onClick={() => onApprove(idea.id)}
          disabled={isApproved}
        >
          <ThumbsUp className="h-3 w-3" />
          Aprovar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1 text-xs"
          onClick={() => onEdit(idea)}
        >
          <Pencil className="h-3 w-3" />
          Editar
        </Button>
        <Button
          size="sm"
          variant={isRejected ? "destructive" : "outline"}
          className="flex-1 gap-1 text-xs"
          onClick={() => onReject(idea.id)}
          disabled={isRejected}
        >
          <ThumbsDown className="h-3 w-3" />
          Rejeitar
        </Button>
      </div>
    </div>
  );
}

// ─── Dialog de edição ─────────────────────────────────────────────────────────

interface EditDialogProps {
  idea: ContentIdea | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, patch: TablesUpdate<"content_ideas">) => void;
}

function EditDialogInner({ idea, onClose, onSave }: Omit<EditDialogProps, "open">) {
  const [topic, setTopic] = useState(idea?.topic ?? "");
  const [hook, setHook] = useState(idea?.hook ?? "");
  const [detail, setDetail] = useState(idea?.detail ?? "");
  const [cta, setCta] = useState(idea?.cta ?? "");

  function handleSave() {
    if (!idea) return;
    onSave(idea.id, { topic, hook, detail, cta });
    onClose();
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-topic">Tópico</Label>
          <Input
            id="edit-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-hook">Hook</Label>
          <Input
            id="edit-hook"
            value={hook}
            onChange={(e) => setHook(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-detail">Detalhe</Label>
          <Textarea
            id="edit-detail"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={4}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-cta">CTA</Label>
          <Input
            id="edit-cta"
            value={cta}
            onChange={(e) => setCta(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave}>Salvar</Button>
      </DialogFooter>
    </>
  );
}

function EditDialog({ idea, open, onClose, onSave }: EditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar ideia</DialogTitle>
        </DialogHeader>
        {idea && (
          <EditDialogInner
            key={idea.id}
            idea={idea}
            onClose={onClose}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function IdeasPage() {
  const activeBrand = useAppStore((s) => s.activeBrand);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editingIdea, setEditingIdea] = useState<ContentIdea | null>(null);

  const supabase = createClient();

  const loadIdeas = useCallback(async () => {
    if (!activeBrand) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("content_ideas")
      .select("*")
      .eq("brand_id", activeBrand.id)
      .order("scheduled_for", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar ideias: " + error.message);
    } else {
      setIdeas((data as ContentIdea[]) ?? []);
    }
    setLoading(false);
  }, [activeBrand]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void loadIdeas();
  }, [loadIdeas]);

  async function handleGenerate() {
    if (!activeBrand) {
      toast.error("Selecione uma brand primeiro.");
      return;
    }
    setGenerating(true);
    toast.info("Gerando ideias com IA...");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada. Faça login novamente.");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/agent-1-strategist`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ brand_id: activeBrand.id }),
        }
      );

      const json = await res.json() as {
        results?: Array<{ status: string; ideas_count?: number; error?: string }>;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }

      const result = json.results?.[0];
      if (result?.status === "success") {
        toast.success(`${result.ideas_count ?? 7} ideias geradas com sucesso!`);
        await loadIdeas();
      } else if (result?.status === "skipped") {
        toast.warning("Brand sem plano ativo. Configure o plano base primeiro.");
      } else {
        throw new Error(result?.error ?? "Erro desconhecido no agente");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error("Erro ao gerar ideias: " + message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleApprove(id: string) {
    const { error } = await supabase
      .from("content_ideas")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao aprovar: " + error.message);
    } else {
      setIdeas((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "approved" as IdeaStatus } : i))
      );
      toast.success("Ideia aprovada!");
    }
  }

  async function handleReject(id: string) {
    const { error } = await supabase
      .from("content_ideas")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao rejeitar: " + error.message);
    } else {
      setIdeas((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "rejected" as IdeaStatus } : i))
      );
      toast.info("Ideia rejeitada.");
    }
  }

  async function handleSaveEdit(id: string, patch: TablesUpdate<"content_ideas">) {
    const { error } = await supabase
      .from("content_ideas")
      .update(patch)
      .eq("id", id);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      setIdeas((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...patch } : i))
      );
      toast.success("Ideia atualizada!");
    }
  }

  const pendingIdeas   = ideas.filter((i) => i.status === "pending");
  const approvedIdeas  = ideas.filter((i) => i.status === "approved");
  const otherIdeas     = ideas.filter((i) => !["pending", "approved"].includes(i.status));

  if (!activeBrand) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <Sparkles className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">Selecione uma brand na barra lateral para ver as ideias.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Ideias de Conteúdo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeBrand.name} — {ideas.length} ideia{ideas.length !== 1 ? "s" : ""} no banco
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadIdeas}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Gerar agora
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {!loading && ideas.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center border border-dashed border-border rounded-lg">
          <Sparkles className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Nenhuma ideia ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em &quot;Gerar agora&quot; para o Agente 1 criar 7 ideias para a próxima semana.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Gerar agora
          </Button>
        </div>
      )}

      {/* Seção: Pendentes */}
      {pendingIdeas.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Pendentes — {pendingIdeas.length}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pendingIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onApprove={handleApprove}
                onReject={handleReject}
                onEdit={setEditingIdea}
              />
            ))}
          </div>
        </section>
      )}

      {/* Seção: Aprovadas */}
      {approvedIdeas.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Aprovadas — {approvedIdeas.length}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {approvedIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onApprove={handleApprove}
                onReject={handleReject}
                onEdit={setEditingIdea}
              />
            ))}
          </div>
        </section>
      )}

      {/* Seção: Outras */}
      {otherIdeas.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Histórico — {otherIdeas.length}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {otherIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onApprove={handleApprove}
                onReject={handleReject}
                onEdit={setEditingIdea}
              />
            ))}
          </div>
        </section>
      )}

      {/* Dialog de edição */}
      <EditDialog
        idea={editingIdea}
        open={editingIdea !== null}
        onClose={() => setEditingIdea(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
