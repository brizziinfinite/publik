"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Brand, Profile } from "@/types/database";

interface AppState {
  user: Profile | null;
  setUser: (user: Profile | null) => void;
  activeBrand: Brand | null;
  setActiveBrand: (brand: Brand | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      activeBrand: null,
      setActiveBrand: (brand) => set({ activeBrand: brand }),
    }),
    {
      name: "publik-store",
      // Persiste apenas a brand ativa, não o user (sessão do Supabase cuida disso)
      partialize: (state) => ({ activeBrand: state.activeBrand }),
    }
  )
);
