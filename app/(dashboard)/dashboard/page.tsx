"use client";

import { useMemo } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  CalendarDays,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAppStore } from "@/store/useAppStore";
import { usePosts } from "@/lib/hooks/usePosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PostStatus } from "@/types/database";

const STATUS_BADGE: Record<PostStatus, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "bg-zinc-700 text-zinc-300" },
  scheduled: { label: "Agendado", className: "bg-blue-500/20 text-blue-400" },
  published: { label: "Publicado", className: "bg-green-500/20 text-green-400" },
  failed: { label: "Falhado", className: "bg-red-500/20 text-red-400" },
};

export default function DashboardPage() {
  const activeBrand = useAppStore((s) => s.activeBrand);
  const user = useAppStore((s) => s.user);
  const { posts, loading } = usePosts(activeBrand?.id ?? null);

  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => p.status === "published").length;
    const scheduled = posts.filter((p) => p.status === "scheduled").length;
    const failed = posts.filter((p) => p.status === "failed").length;
    return { total, published, scheduled, failed };
  }, [posts]);

  const upcomingPosts = useMemo(
    () =>
      posts
        .filter((p) => p.status === "scheduled" && p.scheduled_at)
        .sort((a, b) => (a.scheduled_at! > b.scheduled_at! ? 1 : -1))
        .slice(0, 5),
    [posts]
  );

  const statCards = [
    { label: "Total Posts", value: stats.total, icon: FileText, color: "text-foreground" },
    { label: "Publicados", value: stats.published, icon: CheckCircle2, color: "text-green-500" },
    { label: "Agendados", value: stats.scheduled, icon: Clock, color: "text-blue-500" },
    { label: "Falhados", value: stats.failed, icon: AlertCircle, color: "text-red-500" },
  ];

  const firstName = user?.full_name?.split(" ")[0] ?? "por aqui";

  return (
    <div className="space-y-8">
      {/* Saudação */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Olá, {firstName}!
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeBrand
              ? `Brand ativa: ${activeBrand.name}`
              : "Selecione uma brand para ver as estatísticas."}
          </p>
        </div>
        {activeBrand && (
          <Button asChild className="gap-2">
            <Link href="/dashboard/posts">
              <Plus className="h-4 w-4" />
              Novo Post
            </Link>
          </Button>
        )}
      </div>

      {/* Cards de stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-muted p-2">
                {loading ? (
                  <div className="h-5 w-5 animate-pulse rounded bg-muted-foreground/20" />
                ) : (
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                )}
              </div>
              <div>
                {loading ? (
                  <div className="h-7 w-10 animate-pulse rounded bg-muted-foreground/20 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                )}
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Próximos posts agendados */}
      {activeBrand && (
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <CalendarDays className="h-4 w-4 text-blue-400" />
              Próximos Agendamentos
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/calendar">Ver calendário</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded bg-muted" />
                ))}
              </div>
            )}
            {!loading && upcomingPosts.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum post agendado. <Link href="/dashboard/posts" className="underline">Criar agendamento</Link>
              </p>
            )}
            {!loading && upcomingPosts.length > 0 && (
              <ul className="divide-y divide-border">
                {upcomingPosts.map((post) => (
                  <li key={post.id} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">
                        {(post.content ?? "").slice(0, 60)}{(post.content ?? "").length > 60 ? "…" : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                        {post.platform} ·{" "}
                        {post.scheduled_at
                          ? format(new Date(post.scheduled_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : ""}
                      </p>
                    </div>
                    <Badge className={`ml-4 shrink-0 text-xs ${STATUS_BADGE[post.status as PostStatus].className}`}>
                      {STATUS_BADGE[post.status as PostStatus].label}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Gate sem brand */}
      {!activeBrand && (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Palette className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground">Sem brand ativa</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecione ou crie uma brand para ver suas estatísticas.
            </p>
            <Button asChild className="mt-6">
              <Link href="/dashboard/brands">Gerenciar Brands</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
