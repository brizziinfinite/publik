// ============================================================================
// app/api/sources/route.ts (Next.js 15 App Router)
// POST: cria source + enfileira processamento
// ============================================================================

import { NextResponse } from "next/server";
import { getSourceQueue } from "@/lib/queue";
import { createClient } from "@/lib/supabase/server";
import { CreateSourceInputSchema } from "@/types/sources";

export async function POST(req: Request) {
  const supabase = await createClient();
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateSourceInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.format() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  // Confere que a brand pertence ao user (defesa em profundidade — RLS já cobre)
  const { data: brand } = await db
    .from("brands")
    .select("id")
    .eq("id", input.brand_id)
    .eq("user_id", user.id)
    .single();

  if (!brand) {
    return NextResponse.json({ error: "brand_not_found" }, { status: 404 });
  }

  // Insere source com status queued
  const insertData: Record<string, unknown> = {
    user_id: user.id,
    brand_id: input.brand_id,
    type: input.type,
    status: "queued",
  };

  if (input.type === "text") insertData.raw_text = input.raw_text;
  if (input.type === "url") insertData.raw_url = input.raw_url;
  if (input.type === "audio" || input.type === "pdf") {
    insertData.storage_path = input.storage_path;
  }

  const { data: source, error } = await db
    .from("sources")
    .insert(insertData)
    .select("id")
    .single();

  if (error || !source) {
    return NextResponse.json(
      { error: "insert_failed", details: error?.message },
      { status: 500 }
    );
  }

  // Enfileira (worker pega do Redis)
  await getSourceQueue().add(
    "extract",
    { kind: "extract", source_id: source.id },
    {
      jobId: `extract:${source.id}`,
      attempts: 2,
      backoff: { type: "exponential", delay: 5_000 },
      removeOnComplete: { age: 3600, count: 1000 },
      removeOnFail: { age: 24 * 3600 },
    }
  );

  return NextResponse.json({ source_id: source.id, status: "queued" });
}
