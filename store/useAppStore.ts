import { create } from "zustand";
import type { Brand, Profile } from "@/types/database";

interface AppState {
  user: Profile | null;
  setUser: (user: Profile | null) => void;
  brand: Brand | null;
  setBrand: (brand: Brand | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  brand: null,
  setBrand: (brand) => set({ brand }),
}));
