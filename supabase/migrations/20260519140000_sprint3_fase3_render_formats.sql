-- ============================================================
-- Sprint 3 — Fase 3 — Catálogo de Formatos de Renderização
-- ============================================================

CREATE TABLE IF NOT EXISTS public.render_formats (
  id text PRIMARY KEY,
  name text NOT NULL,
  platform text NOT NULL,
  surface text NOT NULL CHECK (surface IN ('feed','story','reel','post','cover')),
  width int NOT NULL,
  height int NOT NULL,
  aspect_ratio text NOT NULL,
  safe_zone jsonb DEFAULT '{}'::jsonb,
  description text,
  is_active boolean DEFAULT false,
  display_order int DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS render_formats_active_idx ON public.render_formats(is_active, display_order);

ALTER TABLE public.render_formats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS render_formats_public_read ON public.render_formats;
CREATE POLICY render_formats_public_read ON public.render_formats FOR SELECT USING (true);

-- Seed dos 8 formatos (APENAS 4:5 ativo agora)
INSERT INTO public.render_formats (id, name, platform, surface, width, height, aspect_ratio, safe_zone, description, is_active, display_order)
VALUES
  ('instagram_feed_4x5',   'Instagram Feed (4:5)',  'instagram', 'feed',  1080, 1350, '4:5',  '{"top":80,"right":80,"bottom":80,"left":80}'::jsonb,   'Padrão Instagram Feed vertical. Maior alcance.', true,  10),
  ('instagram_feed_1x1',   'Instagram Feed (1:1)',  'instagram', 'feed',  1080, 1080, '1:1',  '{"top":80,"right":80,"bottom":80,"left":80}'::jsonb,   'Instagram Feed quadrado.',                       false, 20),
  ('instagram_story_9x16', 'Instagram Story',       'instagram', 'story', 1080, 1920, '9:16', '{"top":250,"right":80,"bottom":300,"left":80}'::jsonb, 'Story vertical tela cheia.',                     false, 30),
  ('tiktok_9x16',          'TikTok',                'tiktok',    'feed',  1080, 1920, '9:16', '{"top":250,"right":120,"bottom":350,"left":80}'::jsonb,'TikTok vertical.',                               false, 40),
  ('linkedin_feed_1x1',    'LinkedIn Feed (1:1)',   'linkedin',  'feed',  1080, 1080, '1:1',  '{"top":80,"right":80,"bottom":80,"left":80}'::jsonb,   'LinkedIn carrossel B2B.',                        false, 50),
  ('facebook_feed_1x1',    'Facebook Feed (1:1)',   'facebook',  'feed',  1080, 1080, '1:1',  '{"top":80,"right":80,"bottom":80,"left":80}'::jsonb,   'Facebook Feed.',                                 false, 60),
  ('twitter_16x9',         'Twitter/X (16:9)',      'twitter',   'feed',  1200, 675,  '16:9', '{"top":60,"right":80,"bottom":60,"left":80}'::jsonb,   'Twitter/X horizontal.',                          false, 70),
  ('pinterest_2x3',        'Pinterest (2:3)',       'pinterest', 'feed',  1000, 1500, '2:3',  '{"top":80,"right":80,"bottom":80,"left":80}'::jsonb,   'Pinterest vertical.',                            false, 80)
ON CONFLICT (id) DO UPDATE SET
  name         = EXCLUDED.name,
  width        = EXCLUDED.width,
  height       = EXCLUDED.height,
  is_active    = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;
