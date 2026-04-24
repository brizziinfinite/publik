"use client";

import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useRef } from "react";
import type { Profile } from "@/types/database";

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAppStore((s) => s.setUser);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({
          id: user.id,
          email: user.email ?? "",
          full_name: user.user_metadata?.full_name ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
          created_at: user.created_at,
          updated_at: user.updated_at ?? user.created_at,
        } satisfies Profile);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          full_name: session.user.user_metadata?.full_name ?? null,
          avatar_url: session.user.user_metadata?.avatar_url ?? null,
          created_at: session.user.created_at,
          updated_at: session.user.updated_at ?? session.user.created_at,
        } satisfies Profile);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  return <>{children}</>;
}
