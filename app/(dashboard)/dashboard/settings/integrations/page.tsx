"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Unlink,
  Link2,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { useSocialAccounts } from "@/lib/hooks/useSocialAccounts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SocialPlatform } from "@/types/database";

// ─── Ícones das plataformas (SVG inline — Lucide não os inclui) ──────────────
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  );
}

// ─── Configuração das plataformas ────────────────────────────────────────────
const PLATFORMS: Array<{
  id: SocialPlatform;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  connectPath: string;
}> = [
  {
    id: "instagram",
    label: "Instagram",
    description: "Publique fotos, reels e carrosseis no Instagram Business.",
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-950/20",
    icon: <InstagramIcon className="h-6 w-6" />,
    connectPath: "/auth/connect/facebook", // Instagram usa OAuth do Meta
  },
  {
    id: "facebook",
    label: "Facebook",
    description: "Publique posts e fotos em páginas do Facebook.",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    icon: <FacebookIcon className="h-6 w-6" />,
    connectPath: "/auth/connect/facebook",
  },
  {
    id: "tiktok",
    label: "TikTok",
    description: "Publique vídeos diretamente na sua conta TikTok.",
    color: "text-foreground",
    bgColor: "bg-muted/50",
    icon: <TikTokIcon className="h-6 w-6" />,
    connectPath: "/auth/connect/tiktok",
  },
];

// ─── Card de plataforma ───────────────────────────────────────────────────────
function PlatformCard({
  platform,
  brandId,
  connectedAccount,
  onDisconnect,
  disconnecting,
}: {
  platform: (typeof PLATFORMS)[number];
  brandId: string;
  connectedAccount?: { account_name: string | null; account_avatar: string | null; token_expires_at: string | null } | null;
  onDisconnect: (p: SocialPlatform) => void;
  disconnecting: boolean;
}) {
  const isConnected = !!connectedAccount;
  const connectUrl = `${platform.connectPath}?brand_id=${brandId}`;

  const isExpired = connectedAccount?.token_expires_at
    ? new Date(connectedAccount.token_expires_at) < new Date()
    : false;

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
      <div className="flex items-start gap-3">
        {/* Ícone da plataforma */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${platform.bgColor} ${platform.color}`}>
          {platform.icon}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{platform.label}</p>
            {isConnected && !isExpired && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Conectado
              </span>
            )}
            {isConnected && isExpired && (
              <span className="flex items-center gap-1 text-xs text-amber-500">
                <XCircle className="h-3.5 w-3.5" /> Token expirado
              </span>
            )}
          </div>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                {connectedAccount.account_avatar && (
                  <AvatarImage src={connectedAccount.account_avatar} />
                )}
                <AvatarFallback className="text-[10px]">
                  {connectedAccount.account_name?.slice(0, 2).toUpperCase() ?? "??"}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">
                {connectedAccount.account_name ?? "Conta conectada"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{platform.description}</p>
          )}
        </div>
      </div>

      {/* Ação */}
      <div className="shrink-0">
        {isConnected ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={() => onDisconnect(platform.id)}
            disabled={disconnecting}
          >
            {disconnecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Unlink className="h-3.5 w-3.5" />
            )}
            Desconectar
          </Button>
        ) : (
          <Button asChild size="sm" className="gap-2">
            <Link href={connectUrl}>
              <Link2 className="h-3.5 w-3.5" />
              Conectar
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Lê search params e dispara toasts após OAuth ────────────────────────────
function OAuthToastHandler({ refetch }: { refetch: () => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "facebook") {
      toast.success("Meta conectado!", { description: "Instagram e Facebook vinculados com sucesso." });
      refetch();
    } else if (success === "tiktok") {
      toast.success("TikTok conectado!");
      refetch();
    } else if (error) {
      const msgs: Record<string, string> = {
        oauth_cancelled: "Conexão cancelada.",
        meta_not_configured: "Credenciais Meta não configuradas no servidor.",
        tiktok_not_configured: "Credenciais TikTok não configuradas no servidor.",
        meta_oauth_failed: "Falha na autenticação com o Meta.",
        tiktok_oauth_failed: "Falha na autenticação com o TikTok.",
        missing_brand: "Nenhuma brand selecionada.",
        invalid_state: "Estado inválido. Tente novamente.",
      };
      toast.error("Erro ao conectar", { description: msgs[error] ?? error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// ─── Página ────────────────────────────────────────────────────────────────
export default function IntegrationsPage() {
  const activeBrand = useAppStore((s) => s.activeBrand);
  const { accounts, loading, refetch, disconnect } = useSocialAccounts(activeBrand?.id ?? null);

  if (!activeBrand) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Palette className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Nenhuma brand selecionada</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecione uma brand para gerenciar suas integrações.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/brands">Ir para Brands</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Handler de toasts pós-OAuth — isolado em Suspense por causa do useSearchParams */}
      <Suspense fallback={null}>
        <OAuthToastHandler refetch={refetch} />
      </Suspense>

      <div>
        <h2 className="text-2xl font-bold text-foreground">Integrações</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Conecte as redes sociais da brand <strong>{activeBrand.name}</strong> para publicar automaticamente.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Redes Sociais</CardTitle>
          <CardDescription>
            Conecte uma conta por plataforma. Os posts agendados serão publicados automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            PLATFORMS.map((platform) => {
              const connected = accounts.find((a) => a.platform === platform.id);
              return (
                <PlatformCard
                  key={platform.id}
                  platform={platform}
                  brandId={activeBrand.id}
                  connectedAccount={connected ?? null}
                  onDisconnect={disconnect}
                  disconnecting={false}
                />
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Aviso sobre aprovação */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-400">
        <p className="font-medium">Antes de conectar</p>
        <p className="mt-1 text-xs">
          As integrações requerem apps aprovados no{" "}
          <strong>Meta for Developers</strong> e <strong>TikTok for Developers</strong>.
          Configure as credenciais <code className="font-mono">META_APP_ID</code>,{" "}
          <code className="font-mono">META_APP_SECRET</code>,{" "}
          <code className="font-mono">TIKTOK_CLIENT_KEY</code> e{" "}
          <code className="font-mono">TIKTOK_CLIENT_SECRET</code> no arquivo <code>.env.local</code>.
        </p>
      </div>
    </div>
  );
}
