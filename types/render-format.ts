export type RenderPlatform = 'instagram' | 'tiktok' | 'linkedin' | 'facebook' | 'twitter' | 'pinterest' | 'youtube';
export type RenderSurface = 'feed' | 'story' | 'reel' | 'post' | 'cover';

export interface RenderFormatSafeZone {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface RenderFormat {
  id: string;
  name: string;
  platform: RenderPlatform;
  surface: RenderSurface;
  width: number;
  height: number;
  aspect_ratio: string;
  safe_zone: RenderFormatSafeZone;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

export interface RenderRequest {
  package_id: string;
  format_id?: string;   // default: 'instagram_feed_4x5'
  re_render?: boolean;  // default: false — idempotente
}

export interface RenderedSlide {
  slide_number: number;
  url: string;
  storage_path: string;
}

export interface RenderResponse {
  package_id: string;
  format_id: string;
  slides: RenderedSlide[];
  total_slides: number;
  duration_ms: number;
  cached?: boolean;
}
