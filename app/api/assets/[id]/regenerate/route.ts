// ============================================================================
// app/api/assets/[id]/regenerate/route.ts
// POST: regenera 1 asset específico (não mexe nos outros 4)
// ============================================================================

import { NextResponse } from "next/server";
import { getSourceQueue } from "@/lib/queue";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const db = supabase as any;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Confirma posse + pega kind e source_id
  const { data: asset } = await db
    .from("content_assets")
    .select("id, kind, source_id, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!asset) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Marca pending pra UI refletir loading
  await db
    .from("content_assets")
    .update({ status: "pending", error_message: null })
    .eq("id", id);

  // Enfileira job de regeneração single-asset
  // (vamos criar esse handler no worker — ver source-queue.ts seção
  //  "regenerate-asset" no incremento abaixo)
  await getSourceQueue().add(
    "regenerate-asset",
    {
      kind: "regenerate-asset",
      asset_id: id,
      asset_kind: asset.kind,
      source_id: asset.source_id,
    } as any,
    {
      jobId: `regen:${id}:${Date.now()}`,
      attempts: 1,
      removeOnComplete: { age: 3600 },
      removeOnFail: { age: 24 * 3600 },
    }
  );

  return NextResponse.json({ ok: true, asset_id: id });
}
