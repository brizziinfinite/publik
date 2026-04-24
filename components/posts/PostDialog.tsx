"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { postSchema, type PostFormData } from "@/lib/validations/post";
import type { Post } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import Image from "next/image";

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter / X" },
] as const;

const STATUSES = [
  { value: "draft", label: "Rascunho" },
  { value: "scheduled", label: "Agendado" },
  { value: "published", label: "Publicado" },
] as const;

interface PostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: Post | null;
  brandId: string;
  onSuccess: () => void;
}

export function PostDialog({
  open,
  onOpenChange,
  post,
  brandId,
  onSuccess,
}: PostDialogProps) {
  const isEditing = !!post;
  const [submitting, setSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      platform: "instagram",
      status: "draft",
      scheduled_at: null,
    },
  });

  const statusValue = watch("status");

  useEffect(() => {
    if (open && post) {
      reset({
        content: post.content ?? "",
        platform: post.platform,
        status: post.status === "failed" ? "draft" : post.status,
        scheduled_at: post.scheduled_at,
      });
      setMediaPreviews(post.media_urls ?? []);
      setMediaFiles([]);
      setScheduledDate(
        post.scheduled_at ? new Date(post.scheduled_at) : undefined
      );
    } else if (open && !post) {
      reset({ content: "", platform: "instagram", status: "draft", scheduled_at: null });
      setMediaPreviews([]);
      setMediaFiles([]);
      setScheduledDate(undefined);
    }
  }, [open, post, reset]);

  // Sincroniza data selecionada no campo hidden
  useEffect(() => {
    if (scheduledDate) {
      setValue("scheduled_at", scheduledDate.toISOString());
    } else {
      setValue("scheduled_at", null);
    }
  }, [scheduledDate, setValue]);

  function handleMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setMediaFiles((prev) => [...prev, ...files]);
    files.forEach((f) => {
      setMediaPreviews((prev) => [...prev, URL.createObjectURL(f)]);
    });
  }

  function removeMedia(index: number) {
    // Só permite remover mídias novas (arquivos ainda não enviados)
    const existingCount = (post?.media_urls ?? []).length;
    if (index < existingCount) {
      // Remover URL existente
      setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Remover arquivo novo
      const newIndex = index - existingCount;
      setMediaFiles((prev) => prev.filter((_, i) => i !== newIndex));
      setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  }

  async function onSubmit(data: PostFormData) {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Upload de novas mídias
      const uploadedUrls: string[] = [];
      for (const file of mediaFiles) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
        uploadedUrls.push(urlData.publicUrl);
      }

      // Mídias existentes que não foram removidas + novas
      const existingCount = (post?.media_urls ?? []).length;
      const keptExisting = mediaPreviews
        .slice(0, existingCount)
        .filter((url) => !url.startsWith("blob:"));
      const media_urls = [...keptExisting, ...uploadedUrls];

      const scheduled_at =
        data.status === "scheduled" && scheduledDate
          ? scheduledDate.toISOString()
          : null;

      if (isEditing && post) {
        const { error } = await supabase
          .from("posts")
          .update({
            content: data.content,
            platform: data.platform,
            status: data.status,
            media_urls,
            scheduled_at,
          })
          .eq("id", post.id);
        if (error) throw error;
        toast.success("Post atualizado!");
      } else {
        const { error } = await supabase.from("posts").insert({
          brand_id: brandId,
          user_id: user.id,
          content: data.content,
          platform: data.platform,
          status: data.status,
          media_urls,
          scheduled_at,
        });
        if (error) throw error;
        toast.success("Post criado!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar post. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Post" : "Novo Post"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Conteúdo */}
          <div className="space-y-1.5">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              placeholder="Escreva a legenda do post..."
              rows={4}
              {...register("content")}
            />
            {errors.content && (
              <p className="text-xs text-destructive">{errors.content.message}</p>
            )}
          </div>

          {/* Plataforma + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Plataforma</Label>
              <Select
                defaultValue="instagram"
                value={watch("platform")}
                onValueChange={(v) =>
                  setValue("platform", v as PostFormData["platform"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.platform && (
                <p className="text-xs text-destructive">{errors.platform.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                defaultValue="draft"
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as PostFormData["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Data de agendamento (só aparece quando status = scheduled) */}
          {statusValue === "scheduled" && (
            <div className="space-y-1.5">
              <Label>Data de publicação</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate
                      ? format(scheduledDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Mídia */}
          <div className="space-y-2">
            <Label>Mídia</Label>
            <div className="flex flex-wrap gap-2">
              {mediaPreviews.map((src, i) => (
                <div key={i} className="relative h-20 w-20">
                  <Image
                    src={src}
                    alt={`mídia ${i + 1}`}
                    fill
                    className="rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedia(i)}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {mediaPreviews.length < 10 && (
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                    multiple
                    className="sr-only"
                    onChange={handleMediaChange}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar" : "Criar Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
