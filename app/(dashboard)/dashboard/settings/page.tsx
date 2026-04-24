"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

const passwordSchema = z
  .object({
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: "" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ full_name: user.full_name ?? "" });
      setAvatarUrl(user.avatar_url ?? null);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "?";

  async function onProfileSubmit(data: ProfileForm) {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: data.full_name })
      .eq("id", user!.id);

    if (error) {
      toast.error("Erro ao atualizar perfil", { description: error.message });
      return;
    }
    // Atualiza store local
    setUser({ ...user!, full_name: data.full_name });
    toast.success("Perfil atualizado com sucesso!");
  }

  async function onPasswordSubmit(data: PasswordForm) {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.password });

    if (error) {
      toast.error("Erro ao alterar senha", { description: error.message });
      return;
    }
    toast.success("Senha alterada com sucesso!");
    passwordForm.reset();
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `avatars/${user.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
      const newUrl = urlData.publicUrl + `?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: newUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(newUrl);
      setUser({ ...user, avatar_url: newUrl });
      toast.success("Avatar atualizado!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Erro ao fazer upload", { description: msg });
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie seu perfil e preferências.
        </p>
      </div>

      {/* Card de perfil */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Atualize suas informações pessoais.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label
                htmlFor="avatar-upload"
                className="cursor-pointer inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {uploadingAvatar ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando…</>
                ) : (
                  "Alterar foto"
                )}
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG ou WebP. Máx 2MB.</p>
            </div>
          </div>

          <Separator />

          {/* Email (somente leitura) */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Email</Label>
            <Input value={user?.email ?? ""} disabled className="bg-muted/30" />
          </div>

          {/* Nome */}
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input
                id="full_name"
                placeholder="Seu nome"
                {...profileForm.register("full_name")}
              />
              {profileForm.formState.errors.full_name && (
                <p className="text-xs text-destructive">
                  {profileForm.formState.errors.full_name.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={profileForm.formState.isSubmitting}
              className="gap-2"
            >
              {profileForm.formState.isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {profileForm.formState.isSubmitting ? "Salvando…" : "Salvar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Card de senha */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Escolha uma senha segura com pelo menos 6 caracteres.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                {...passwordForm.register("password")}
              />
              {passwordForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••"
                {...passwordForm.register("confirm")}
              />
              {passwordForm.formState.errors.confirm && (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.confirm.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
              variant="secondary"
              className="gap-2"
            >
              {passwordForm.formState.isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {passwordForm.formState.isSubmitting ? "Salvando…" : "Alterar senha"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Informações da conta */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Informações da Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">ID: </span>
            <span className="font-mono text-xs">{user?.id}</span>
          </p>
          <p>
            <span className="font-medium text-foreground">Membro desde: </span>
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
