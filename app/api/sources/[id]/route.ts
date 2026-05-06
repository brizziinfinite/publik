// ============================================================================
// app/api/sources/[id]/route.ts
// GET: retorna source + package + assets (pra polling do frontend)
// ============================================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

  // RLS garante isolamento, mas filtramos explicitamente também
  const { data: source, error } = await db
    .from("sources")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !source) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: pkg } = await db
    .from("content_packages")
    .select("id, generation_config, created_at")
    .eq("source_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: assets } = pkg
    ? await db
        .from("content_assets")
        .select(
          "id, kind, status, content, error_message, tokens_input, tokens_output, updated_at"
        )
        .eq("package_id", pkg.id)
        .order("kind")
    : { data: [] };

  return NextResponse.json({
    source,
    package: pkg ?? null,
    assets: assets ?? [],
  });
}
