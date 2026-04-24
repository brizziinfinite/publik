"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Palette } from "lucide-react";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { usePosts } from "@/lib/hooks/usePosts";
import { PostDialog } from "@/components/posts/PostDialog";
import { getCalendarDays, groupPostsByDay, getPostsForDay, isSameMonth } from "@/lib/calendar";
import { Button } from "@/components/ui/button";
import type { Post, PostStatus } from "@/types/database";

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const STATUS_COLOR: Record<PostStatus, string> = {
  draft: "bg-zinc-400",
  scheduled: "bg-blue-500",
  published: "bg-green-500",
  failed: "bg-red-500",
};

const STATUS_LABEL: Record<PostStatus, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  published: "Publicado",
  failed: "Falhado",
};

export default function CalendarPage() {
  const activeBrand = useAppStore((s) => s.activeBrand);
  const { posts, refetch } = usePosts(activeBrand?.id ?? null);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const days = useMemo(() => getCalendarDays(year, month), [year, month]);
  const postsByDay = useMemo(() => groupPostsByDay(posts), [posts]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function handlePostClick(post: Post) {
    setEditingPost(post);
    setDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open);
    if (!open) setEditingPost(null);
  }

  if (!activeBrand) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Palette className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">Nenhuma brand selecionada</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecione uma brand na barra lateral ou crie a sua primeira.
        </p>
        <Button asChild className="mt-6 gap-2">
          <Link href="/dashboard/brands">Criar Brand</Link>
        </Button>
      </div>
    );
  }

  const currentMonth = new Date(year, month);

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Calendário</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeBrand.name} — posts agendados por dia.
            </p>
          </div>

          {/* Navegação mês */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[160px] text-center font-semibold capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legenda de status */}
        <div className="flex flex-wrap gap-4">
          {(Object.entries(STATUS_COLOR) as [PostStatus, string][]).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
              {STATUS_LABEL[status]}
            </div>
          ))}
        </div>

        {/* Grid do calendário */}
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Cabeçalho dias da semana */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/40">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Células de dias */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dayPosts = getPostsForDay(postsByDay, day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] border-r border-b border-border p-1.5 ${
                    idx % 7 === 6 ? "border-r-0" : ""
                  } ${!isCurrentMonth ? "bg-muted/20" : "bg-background"}`}
                >
                  {/* Número do dia */}
                  <div className="mb-1 flex items-center justify-end">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        isCurrentDay
                          ? "bg-primary text-primary-foreground"
                          : isCurrentMonth
                          ? "text-foreground"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Posts do dia */}
                  <div className="space-y-0.5">
                    {dayPosts.slice(0, 3).map((post) => (
                      <button
                        key={post.id}
                        onClick={() => handlePostClick(post)}
                        className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-xs transition-opacity hover:opacity-80 hover:bg-muted"
                        title={post.content ?? ""}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_COLOR[post.status as PostStatus]}`}
                        />
                        <span className="truncate text-foreground">
                          {(post.content ?? "").slice(0, 22)}
                          {(post.content ?? "").length > 22 ? "…" : ""}
                        </span>
                      </button>
                    ))}
                    {dayPosts.length > 3 && (
                      <p className="px-1 text-xs text-muted-foreground">
                        +{dayPosts.length - 3} mais
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {activeBrand && (
        <PostDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          post={editingPost}
          brandId={activeBrand.id}
          onSuccess={refetch}
        />
      )}
    </>
  );
}
