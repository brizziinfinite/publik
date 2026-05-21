export type VisualKitMood = "editorial" | "bold" | "playful";
export type HookStyle = "oversized" | "subtitled" | "photo_overlay";
export type CtaStyle = "price_focus" | "urgency" | "trust";
export type BorderRadius = "sharp" | "soft" | "round";

export interface VisualKitPalette {
  primary: string;
  accent: string;
  bg: string;
  text: string;
  muted: string;
  support: string;
}

export interface VisualKitTypography {
  display_font: string;
  body_font: string;
  mono_font: string;
}

export interface VisualKitLayoutPreferences {
  hook_style: HookStyle;
  cta_style: CtaStyle;
  border_radius: BorderRadius;
}

export interface VisualKit {
  id: string;
  name: string;
  description: string;
  segments: string[];
  mood: VisualKitMood;
  palette: VisualKitPalette;
  typography: VisualKitTypography;
  layout_preferences: VisualKitLayoutPreferences;
  preview_image_url: string | null;
  is_active: boolean;
  display_order: number;
}

export interface BrandVisualIdentityV2 {
  palette: VisualKitPalette;
  typography: VisualKitTypography;
  mood: VisualKitMood;
  layout_preferences: VisualKitLayoutPreferences;
}
