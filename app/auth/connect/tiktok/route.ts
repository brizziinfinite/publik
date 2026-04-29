import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildTikTokAuthUrl } from "@/lib/oauth/tiktok";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const brandId = req.nextUrl.searchParams.get("brand_id");
  if (!brandId) {
    return NextResponse.redirect(
      new URL("/dashboard/settings/integrations?error=missing_brand", req.url)
    );
  }

  const csrf = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

  try {
    const authUrl = buildTikTokAuthUrl(brandId, csrf);
    return NextResponse.redirect(authUrl);
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard/settings/integrations?error=tiktok_not_configured", req.url)
    );
  }
}
