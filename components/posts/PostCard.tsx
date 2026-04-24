"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, Pencil, Trash2, Calendar, Image as ImageIcon } from "lucide-react";
import type { Post } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG = {
  draft: { label: "Rascunho", className: "bg-muted text-muted-foreground" },
  scheduled: { label: "Agendado", className: "bg-yellow-500/15 text-yellow-500" },
  published: { label: "Publicado", className: "bg-green-500/15 text-green-500" },
  failed: { label: "Falhado", className: "bg-red-500/15 text-red-500" },
} as const;

const PLATFORM_LABEL = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  twitter: "Twitter / X",
} as const;

interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const status = STATUS_CONFIG[post.status];

  return (
    <Card className="group border-border bg-card transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge className={status.className}>{status.label}</Badge>
            <span className="text-xs text-muted-foreground">
              {PLATFORM_LABEL[post.platform]}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(post)} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(post)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Conteúdo */}
        <p className="mt-3 line-clamp-3 text-sm text-foreground">
          {post.content ?? <span className="italic text-muted-foreground">Sem conteúdo</span>}
        </p>

        {/* Mídia */}
        {post.media_urls.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ImageIcon className="h-3.5 w-3.5" />
            {post.media_urls.length} {post.media_urls.length === 1 ? "arquivo" : "arquivos"}
          </div>
        )}

        {/* Data agendada */}
        {post.scheduled_at && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(post.scheduled_at), "dd/MM/yyyy", { locale: ptBR })}
          </div>
        )}

        <p className="mt-3 text-[11px] text-muted-foreground/60">
          Criado em {format(new Date(post.created_at), "dd/MM/yyyy", { locale: ptBR })}
        </p>
      </CardContent>
    </Card>
  );
}
