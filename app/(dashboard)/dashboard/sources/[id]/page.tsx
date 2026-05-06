"use client";

// ============================================================================
// app/dashboard/sources/[id]/page.tsx
// Tela de detalhe: cabeçalho da source + grid 5 cards (1 por asset).
// Polling a cada 3s enquanto status != ready/failed.
// ============================================================================

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  AssetKind,
  AssetStatus,
  SourceStatus,
} from "@/types/sources";

interface AssetView {
  id: string;
  kind: AssetKind;
  status: AssetStatus;
  content: unknown;
  error_message: string | null;
}

interface SourceView {
  id: string;
  status: SourceStatus;
  type: string;
  error_message: string | null;
  extracted_metadata: Record<string, unknown>;
}

interface ApiResponse {
  source: SourceView;
  package: { id: string } | null;
  assets: AssetView[];
}

const KIND_LABELS: Record<AssetKind, string> = {
  carousel: "Carrossel",
  stories: "Stories",
  reel_script: "Reel script",
  email: "E-mail",
  blog: "Blog post",
};

export default function SourceDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const res = await fetch(`/api/sources/${params.id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiResponse = await res.json();
        if (cancelled) return;
        setData(json);

        const isTerminal =
          json.source.status === "ready" ||
          json.source.status === "failed" ||
          json.source.status === "partial";
        if (!isTerminal) {
          timer = setTimeout(tick, 3000);
        }
      } catch {
        if (!cancelled) timer = setTimeout(tick, 5000);
      }
    };

    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [params.id]);

  if (!data) return <div className="p-10">Carregando…</div>;

  const { source, assets } = data;

  return (
    <div className="mx-auto max-w-6xl py-10 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pacote de conteúdo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tipo: {source.type} · Status: <StatusBadge status={source.status} />
          </p>
        </div>
      </header>

      {source.error_message && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {source.error_message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((a) => (
          <AssetCard key={a.id} asset={a} />
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SourceStatus | AssetStatus }) {
  const variants: Record<string, string> = {
    queued: "bg-gray-100 text-gray-700",
    extracting: "bg-blue-100 text-blue-700",
    extracted: "bg-blue-100 text-blue-700",
    generating: "bg-amber-100 text-amber-700",
    pending: "bg-gray-100 text-gray-700",
    ready: "bg-emerald-100 text-emerald-700",
    partial: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
        variants[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function AssetCard({ asset }: { asset: AssetView }) {
  async function regenerate() {
    await fetch(`/api/assets/${asset.id}/regenerate`, { method: "POST" });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{KIND_LABELS[asset.kind]}</CardTitle>
        <StatusBadge status={asset.status} />
      </CardHeader>
      <CardContent className="space-y-3">
        {asset.status === "ready" && (
          <pre className="text-xs bg-muted p-3 rounded max-h-64 overflow-auto">
            {JSON.stringify(asset.content, null, 2)}
          </pre>
        )}
        {asset.status === "failed" && (
          <p className="text-xs text-red-600">{asset.error_message}</p>
        )}
        {(asset.status === "pending" || asset.status === "generating") && (
          <p className="text-xs text-muted-foreground">Gerando…</p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={regenerate}
          disabled={asset.status === "generating" || asset.status === "pending"}
        >
          Regenerar
        </Button>
      </CardContent>
    </Card>
  );
}
