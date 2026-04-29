import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeTikTokCode, getTikTokUserInfo } from "@/lib/oauth/tiktok";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const code = req.nextUrl.searchParams.get("code");
  const stateRaw = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  const redirectBase = new URL("/dashboard/settings/integrations", req.url);

  if (error || !code || !stateRaw) {
    redirectBase.searchParams.set("error", error ?? "oauth_cancelled");
    return NextResponse.redirect(redirectBase);
  }

  let brandId: string;
  try {
    const state = JSON.parse(stateRaw);
    brandId = state.brandId;
  } catch {
    redirectBase.searchParams.set("error", "invalid_state");
    return NextResponse.redirect(redirectBase);
  }

  try {
    // 1. Troca code por tokens
    const tokens = await exchangeTikTokCode(code);

    // 2. Busca perfil do usuário
    const profile = await getTikTokUserInfo(tokens.access_token, tokens.open_id);

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    const refreshExpiresAt = new Date(Date.now() + tokens.refresh_expires_in * 1000).toISOString();

    // 3. Salva conta TikTok
    await supabase.from("social_accounts").upsert(
      {
        user_id: user.id,
        brand_id: brandId,
        platform: "tiktok",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt,
        account_id: tokens.open_id,
        account_name: profile.display_name,
        account_avatar: profile.avatar_url,
        scopes: tokens.scope,
        is_active: true,
      },
      { onConflict: "brand_id,platform" }
    );

    // Guarda refresh_expires_at nos metadados (campo extra via update)
    await supabase
      .from("social_accounts")
      .update({ updated_at: refreshExpiresAt })
      .eq("brand_id", brandId)
      .eq("platform", "tiktok");

    redirectBase.searchParams.set("success", "tiktok");
    return NextResponse.redirect(redirectBase);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("TikTok OAuth error:", msg);
    redirectBase.searchParams.set("error", "tiktok_oauth_failed");
    return NextResponse.redirect(redirectBase);
  }
}
