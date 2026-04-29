"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SocialAccount } from "@/types/database";

export function useSocialAccounts(brandId: string | null) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!brandId) { setAccounts([]); return; }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("brand_id", brandId)
      .eq("is_active", true);
    setAccounts(data ?? []);
    setLoading(false);
  }, [brandId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function disconnect(platform: SocialAccount["platform"]) {
    if (!brandId) return;
    const supabase = createClient();
    await supabase
      .from("social_accounts")
      .update({ is_active: false })
      .eq("brand_id", brandId)
      .eq("platform", platform);
    await fetch();
  }

  return { accounts, loading, refetch: fetch, disconnect };
}
