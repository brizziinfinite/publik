"use client";

// ============================================================================
// app/dashboard/sources/new/NewSourceClient.tsx
// Tela de criação de source com 4 abas (texto / áudio / URL / PDF).
// Usa Shadcn (Tabs, Input, Textarea, Button, Card) — assume que já estão instalados.
// ============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Brand {
  id: string;
  name: string;
}

export default function NewSourceClient({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // tab states
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  async function submitText() {
    return submit({ type: "text", brand_id: brandId, raw_text: text });
  }
  async function submitUrl() {
    return submit({ type: "url", brand_id: brandId, raw_url: url });
  }

  async function submitFile(kind: "audio" | "pdf", file: File) {
    setBusy(true);
    setError(null);
    try {
      // 1. Pega user.id
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // 2. Faz upload pro Storage (bucket 'sources')
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("sources")
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;

      // 3. Cria source apontando pro storage_path
      await submit({ type: kind, brand_id: brandId, storage_path: path });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  async function submit(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const { source_id } = await res.json();
      router.push(`/dashboard/sources/${source_id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold mb-6">
        Nova fonte de conteúdo
      </h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <Label htmlFor="brand">Marca</Label>
          <select
            id="brand"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="mt-2 w-full rounded-md border px-3 py-2"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <Tabs defaultValue="text">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="text">Texto</TabsTrigger>
          <TabsTrigger value="audio">Áudio</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="pdf">PDF</TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>Cole um texto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                rows={12}
                placeholder="Briefing, transcrição, ideia solta…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button
                onClick={submitText}
                disabled={busy || text.length < 50}
              >
                {busy ? "Processando…" : "Gerar pacote"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audio">
          <Card>
            <CardHeader>
              <CardTitle>Envie um áudio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="file"
                accept=".mp3,.m4a,.ogg,.wav,audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-sm text-muted-foreground">
                Máx 25 MB / 60 minutos. Será transcrito automaticamente.
              </p>
              <Button
                onClick={() => audioFile && submitFile("audio", audioFile)}
                disabled={busy || !audioFile}
              >
                {busy ? "Enviando…" : "Gerar pacote"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url">
          <Card>
            <CardHeader>
              <CardTitle>Cole uma URL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                YouTube, TikTok, Instagram ou artigo de blog.
              </p>
              <Button onClick={submitUrl} disabled={busy || !url}>
                {busy ? "Processando…" : "Gerar pacote"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdf">
          <Card>
            <CardHeader>
              <CardTitle>Envie um PDF</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-sm text-muted-foreground">
                Máx 10 MB / 50 páginas. PDFs escaneados não são suportados no v1.
              </p>
              <Button
                onClick={() => pdfFile && submitFile("pdf", pdfFile)}
                disabled={busy || !pdfFile}
              >
                {busy ? "Enviando…" : "Gerar pacote"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <p className="mt-4 text-sm text-red-600">Erro: {error}</p>
      )}
    </div>
  );
}
