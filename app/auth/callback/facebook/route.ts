import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeMetaCode, getLongLivedToken, getMetaUserProfile, getMetaPages } from "@/lib/oauth/meta";

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
    // 1. Troca code por short-lived token
    const { access_token: shortToken } = await exchangeMetaCode(code);

    // 2. Troca por long-lived token (60 dias)
    const { access_token: longToken, expires_in } = await getLongLivedToken(shortToken);

    // 3. Busca perfil do usuário
    const profile = await getMetaUserProfile(longToken);

    // 4. Busca páginas (para Instagram)
    const pages = await getMetaPages(longToken);

    // Calcula expiração
    const expiresAt = expires_in
      ? new Date(Date.now() + expires_in * 1000).toISOString()
      : null;

    // 5. Salva conta Facebook
    await supabase.from("social_accounts").upsert(
      {
        user_id: user.id,
        brand_id: brandId,
        platform: "facebook",
        access_token: longToken,
        token_expires_at: expiresAt,
        account_id: profile.id,
        account_name: profile.name,
        account_avatar: profile.picture?.data?.url ?? null,
        scopes: process.env.META_SCOPES ?? null,
        is_active: true,
      },
      { onConflict: "brand_id,platform" }
    );

    // 6. Se tiver página com conta Instagram, salva também
    const pageWithInstagram = pages.find((p) => p.instagram_business_account?.id);
    if (pageWithInstagram?.instagram_business_account) {
      await supabase.from("social_accounts").upsert(
        {
          user_id: user.id,
          brand_id: brandId,
          platform: "instagram",
          access_token: pageWithInstagram.access_token,
          token_expires_at: expiresAt,
          account_id: pageWithInstagram.instagram_business_account.id,
          account_name: pageWithInstagram.name,
          account_avatar: null,
          scopes: null,
          is_active: true,
        },
        { onConflict: "brand_id,platform" }
      );
    }

    redirectBase.searchParams.set("success", "facebook");
    return NextResponse.redirect(redirectBase);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("Meta OAuth error:", msg);
    redirectBase.searchParams.set("error", "meta_oauth_failed");
    return NextResponse.redirect(redirectBase);
  }
}
