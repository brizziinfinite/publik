"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, MessageCircle, Repeat2, Share2, Bookmark, MoreHorizontal, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Post } from "@/types/database";
import type { Brand } from "@/types/database";

interface PostPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  brand: Brand | null;
}

function isVideo(url: string) {
  return /\.(mp4|mov|webm|avi)$/i.test(url);
}

export function PostPreviewDialog({ open, onOpenChange, post, brand }: PostPreviewDialogProps) {
  if (!post) return null;

  const platform = post.platform;
  const brandName = brand?.name ?? "Sua Brand";
  const brandInitial = brandName[0].toUpperCase();
  const brandColor = brand?.primary_color ?? "#6C5CE7";
  const scheduledDate = post.scheduled_at
    ? format(new Date(post.scheduled_at), "dd 'de' MMMM", { locale: ptBR })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-sm font-medium text-muted-foreground">
            Preview — {PLATFORM_LABEL[platform]}
          </DialogTitle>
        </DialogHeader>

        <div className="pb-4">
          {platform === "instagram" && (
            <InstagramPreview
              content={post.content ?? ""}
              mediaUrls={post.media_urls}
              brandName={brandName}
              brandInitial={brandInitial}
              brandColor={brandColor}
              scheduledDate={scheduledDate}
            />
          )}
          {platform === "twitter" && (
            <TwitterPreview
              content={post.content ?? ""}
              mediaUrls={post.media_urls}
              brandName={brandName}
              brandInitial={brandInitial}
              brandColor={brandColor}
              scheduledDate={scheduledDate}
            />
          )}
          {(platform === "tiktok" || platform === "facebook") && (
            <GenericPreview
              platform={platform}
              content={post.content ?? ""}
              mediaUrls={post.media_urls}
              brandName={brandName}
              brandInitial={brandInitial}
              brandColor={brandColor}
              scheduledDate={scheduledDate}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  twitter: "Twitter / X",
};

interface PreviewProps {
  content: string;
  mediaUrls: string[];
  brandName: string;
  brandInitial: string;
  brandColor: string;
  scheduledDate: string | null;
}

function InstagramPreview({ content, mediaUrls, brandName, brandInitial, brandColor, scheduledDate }: PreviewProps) {
  const firstMedia = mediaUrls[0];
  const isVid = firstMedia ? isVideo(firstMedia) : false;

  return (
    <div className="border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 ring-2 ring-offset-1" style={{ "--tw-ring-color": brandColor } as React.CSSProperties}>
            <AvatarFallback style={{ backgroundColor: brandColor }} className="text-xs font-bold text-white">
              {brandInitial}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold text-foreground">{brandName}</span>
        </div>
        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Mídia */}
      {firstMedia ? (
        <div className="relative aspect-square w-full bg-muted">
          {isVid ? (
            <div className="flex h-full items-center justify-center">
              <Play className="h-12 w-12 text-white/80" />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={firstMedia} alt="Preview" className="h-full w-full object-cover" />
          )}
          {mediaUrls.length > 1 && (
            <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
              1/{mediaUrls.length}
            </div>
          )}
        </div>
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-muted">
          <span className="text-sm text-muted-foreground">Sem mídia</span>
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-foreground" />
          <MessageCircle className="h-6 w-6 text-foreground" />
          <Share2 className="h-6 w-6 text-foreground" />
        </div>
        <Bookmark className="h-6 w-6 text-foreground" />
      </div>

      {/* Conteúdo */}
      <div className="px-3 pb-1">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{brandName}</span>{" "}
          <span className="line-clamp-3">{content}</span>
        </p>
        {scheduledDate && (
          <p className="mt-1 text-xs text-muted-foreground">Agendado para {scheduledDate}</p>
        )}
      </div>
    </div>
  );
}

function TwitterPreview({ content, mediaUrls, brandName, brandInitial, brandColor, scheduledDate }: PreviewProps) {
  const firstMedia = mediaUrls[0];

  return (
    <div className="border-t border-border px-4 py-3">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback style={{ backgroundColor: brandColor }} className="text-sm font-bold text-white">
            {brandInitial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-foreground">{brandName}</span>
            <span className="text-xs text-muted-foreground">@{brandName.toLowerCase().replace(/\s+/g, "")}</span>
          </div>
          <p className="mt-1 text-sm text-foreground leading-snug">{content}</p>

          {firstMedia && !isVideo(firstMedia) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={firstMedia}
              alt="Preview"
              className="mt-2 rounded-xl w-full object-cover max-h-48"
            />
          )}
          {firstMedia && isVideo(firstMedia) && (
            <div className="mt-2 flex h-32 items-center justify-center rounded-xl bg-muted">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          {scheduledDate && (
            <p className="mt-2 text-xs text-muted-foreground">Agendado para {scheduledDate}</p>
          )}

          <div className="mt-3 flex items-center gap-6 text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <Repeat2 className="h-4 w-4" />
            <Heart className="h-4 w-4" />
            <Share2 className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

function GenericPreview({ platform, content, mediaUrls, brandName, brandInitial, brandColor, scheduledDate }: PreviewProps & { platform: string }) {
  const firstMedia = mediaUrls[0];

  return (
    <div className="border-t border-border">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback style={{ backgroundColor: brandColor }} className="text-sm font-bold text-white">
            {brandInitial}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{brandName}</p>
          <p className="text-xs text-muted-foreground capitalize">{platform}</p>
        </div>
      </div>

      <p className="px-4 pb-2 text-sm text-foreground line-clamp-4">{content}</p>

      {firstMedia && !isVideo(firstMedia) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={firstMedia} alt="Preview" className="w-full object-cover max-h-52" />
      )}
      {firstMedia && isVideo(firstMedia) && (
        <div className="mx-4 mb-2 flex h-36 items-center justify-center rounded-xl bg-muted">
          <Play className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {scheduledDate && (
        <p className="px-4 pb-3 text-xs text-muted-foreground">Agendado para {scheduledDate}</p>
      )}

      <div className="flex gap-4 border-t border-border px-4 py-2 text-muted-foreground">
        <Heart className="h-4 w-4" />
        <MessageCircle className="h-4 w-4" />
        <Share2 className="h-4 w-4" />
      </div>
    </div>
  );
}
