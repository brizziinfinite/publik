/**
 * Helpers para o OAuth flow do Meta (Facebook + Instagram)
 * Docs: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
 */

const META_AUTH_URL = "https://www.facebook.com/v19.0/dialog/oauth";
const META_TOKEN_URL = "https://graph.facebook.com/v19.0/oauth/access_token";
const META_LONG_TOKEN_URL = "https://graph.facebook.com/v19.0/oauth/access_token";

// Escopos necessários para Instagram + Facebook publishing
export const META_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_basic",
  "instagram_content_publish",
  "instagram_manage_insights",
  "public_profile",
  "email",
].join(",");

export function buildMetaAuthUrl(brandId: string, state: string): string {
  const appId = process.env.META_APP_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appId) throw new Error("META_APP_ID não configurado");

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: `${appUrl}/auth/callback/facebook`,
    scope: META_SCOPES,
    response_type: "code",
    state: JSON.stringify({ brandId, csrf: state }),
  });

  return `${META_AUTH_URL}?${params.toString()}`;
}

export async function exchangeMetaCode(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in?: number;
}> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appId || !appSecret) throw new Error("Credenciais Meta não configuradas");

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: `${appUrl}/auth/callback/facebook`,
    code,
  });

  const res = await fetch(`${META_TOKEN_URL}?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message ?? "Erro ao trocar código Meta");
  }
  return res.json();
}

export async function getLongLivedToken(shortToken: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) throw new Error("Credenciais Meta não configuradas");

  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken,
  });

  const res = await fetch(`${META_LONG_TOKEN_URL}?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message ?? "Erro ao obter long-lived token");
  }
  return res.json();
}

export async function getMetaUserProfile(accessToken: string): Promise<{
  id: string;
  name: string;
  picture?: { data: { url: string } };
}> {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/me?fields=id,name,picture&access_token=${accessToken}`
  );
  if (!res.ok) throw new Error("Erro ao buscar perfil Meta");
  return res.json();
}

export async function getMetaPages(accessToken: string): Promise<Array<{
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
}>> {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${accessToken}`
  );
  if (!res.ok) throw new Error("Erro ao buscar páginas Meta");
  const data = await res.json();
  return data.data ?? [];
}
