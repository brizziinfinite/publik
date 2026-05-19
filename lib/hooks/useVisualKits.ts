"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { VisualKit } from "@/types/visual-kits";

export function useVisualKits() {
  const [kits, setKits] = useState<VisualKit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("visual_kits")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data) {
        setKits(data as unknown as VisualKit[]);
      }
      setLoading(false);
    };
    void fetch();
  }, []);

  return { kits, loading };
}
