/**
 * Helpers para o OAuth flow do TikTok
 * Docs: https://developers.tiktok.com/doc/login-kit-web
 */

const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";

export const TIKTOK_SCOPES = [
  "user.info.basic",
  "video.publish",
  "video.upload",
].join(",");

export function buildTikTokAuthUrl(brandId: string, state: string): string {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!clientKey) throw new Error("TIKTOK_CLIENT_KEY não configurado");

  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: TIKTOK_SCOPES,
    redirect_uri: `${appUrl}/auth/callback/tiktok`,
    state: JSON.stringify({ brandId, csrf: state }),
  });

  return `${TIKTOK_AUTH_URL}?${params.toString()}`;
}

export async function exchangeTikTokCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  open_id: string;
  scope: string;
  expires_in: number;
  refresh_expires_in: number;
}> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!clientKey || !clientSecret) throw new Error("Credenciais TikTok não configuradas");

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: `${appUrl}/auth/callback/tiktok`,
  });

  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error_description ?? "Erro ao trocar código TikTok");
  }

  const data = await res.json();
  return data.data ?? data;
}

export async function getTikTokUserInfo(accessToken: string, openId: string): Promise<{
  open_id: string;
  display_name: string;
  avatar_url: string;
}> {
  const res = await fetch(
    `https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) throw new Error("Erro ao buscar perfil TikTok");
  const data = await res.json();
  return data.data?.user ?? { open_id: openId, display_name: "TikTok User", avatar_url: "" };
}

export async function refreshTikTokToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
}> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientKey || !clientSecret) throw new Error("Credenciais TikTok não configuradas");

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) throw new Error("Erro ao renovar token TikTok");
  const data = await res.json();
  return data.data ?? data;
}
