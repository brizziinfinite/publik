"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, User, Settings, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
  { value: "America/Manaus", label: "Manaus (GMT-4)" },
  { value: "America/Belem", label: "Belém (GMT-3)" },
  { value: "America/Fortaleza", label: "Fortaleza (GMT-3)" },
  { value: "America/Recife", label: "Recife (GMT-3)" },
  { value: "America/Cuiaba", label: "Cuiabá (GMT-4)" },
  { value: "America/Porto_Velho", label: "Porto Velho (GMT-4)" },
  { value: "America/Rio_Branco", label: "Rio Branco (GMT-5)" },
  { value: "America/New_York", label: "New York (GMT-5/-4)" },
  { value: "America/Los_Angeles", label: "Los Angeles (GMT-8/-7)" },
  { value: "Europe/London", label: "London (GMT+0/+1)" },
  { value: "Europe/Lisbon", label: "Lisboa (GMT+0/+1)" },
  { value: "UTC", label: "UTC (GMT+0)" },
];

const profileSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

const preferencesSchema = z.object({
  timezone: z.string().min(1),
  notify_scheduled: z.boolean(),
  notify_published: z.boolean(),
  notify_failed: z.boolean(),
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
type PreferencesForm = z.infer<typeof preferencesSchema>;

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

  const preferencesForm = useForm<PreferencesForm>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      timezone: "America/Sao_Paulo",
      notify_scheduled: true,
      notify_published: true,
      notify_failed: true,
    },
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

  async function onPreferencesSubmit(data: PreferencesForm) {
    // Salva as preferências no metadata do usuário (Supabase Auth)
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        timezone: data.timezone,
        notify_scheduled: data.notify_scheduled,
        notify_published: data.notify_published,
        notify_failed: data.notify_failed,
      },
    });

    if (error) {
      toast.error("Erro ao salvar preferências", { description: error.message });
      return;
    }
    toast.success("Preferências salvas!");
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

      {/* Card de preferências gerais */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferências Gerais
          </CardTitle>
          <CardDescription>Configure seu fuso horário e notificações.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
            {/* Fuso horário */}
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Fuso horário</Label>
              <Select
                value={preferencesForm.watch("timezone")}
                onValueChange={(v) => preferencesForm.setValue("timezone", v)}
              >
                <SelectTrigger id="timezone" className="w-full">
                  <SelectValue placeholder="Selecione o fuso horário" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Usado para exibir as datas dos posts no horário correto.
              </p>
            </div>

            <Separator />

            {/* Notificações */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Notificações por email</Label>
              </div>

              {[
                { field: "notify_scheduled" as const, label: "Post agendado com sucesso", desc: "Quando um post for agendado" },
                { field: "notify_published" as const, label: "Post publicado", desc: "Quando um post for publicado automaticamente" },
                { field: "notify_failed" as const, label: "Falha na publicação", desc: "Quando um post falhar ao publicar" },
              ].map(({ field, label, desc }) => (
                <div key={field} className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferencesForm.watch(field)}
                    onClick={() => preferencesForm.setValue(field, !preferencesForm.watch(field))}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      preferencesForm.watch(field) ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                        preferencesForm.watch(field) ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <Button type="submit" disabled={preferencesForm.formState.isSubmitting} className="gap-2">
              {preferencesForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {preferencesForm.formState.isSubmitting ? "Salvando…" : "Salvar preferências"}
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
