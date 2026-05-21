-- ============================================================
-- Sprint 3 — Fase 1 — Design System: Schema + Storage
-- ============================================================

-- ─── 1. Estender brands com design tokens ────────────────────

ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS visual_identity_v2 jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS segment text,
  ADD COLUMN IF NOT EXISTS visual_kit_id text;

COMMENT ON COLUMN public.brands.visual_identity_v2 IS
'Tokens completos: { palette: {primary, accent, bg, text, muted, support}, typography: {display_font, body_font, mono_font}, mood: editorial|bold|playful, layout_preferences: {hook_style, cta_style} }';

COMMENT ON COLUMN public.brands.segment IS
'Segmento de negócio livre: "agro", "oficina_mecanica", "confeitaria", "advocacia", etc';

COMMENT ON COLUMN public.brands.visual_kit_id IS
'Referência ao kit visual escolhido como ponto de partida (ex: agro_serio, oficina_industrial)';

-- ─── 2. Tabela brand_photos ───────────────────────────────────

CREATE TABLE IF NOT EXISTS public.brand_photos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id     uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  public_url   text NOT NULL,
  width        int,
  height       int,
  size_bytes   int,
  alt_text     text,
  tags         text[] DEFAULT '{}',
  uploaded_by  text DEFAULT 'user',
  used_count   int DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS brand_photos_brand_idx
  ON public.brand_photos(brand_id);

CREATE INDEX IF NOT EXISTS brand_photos_tags_idx
  ON public.brand_photos USING gin(tags);

ALTER TABLE public.brand_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS brand_photos_owner_all ON public.brand_photos;
CREATE POLICY brand_photos_owner_all ON public.brand_photos
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── 3. Tabela visual_kits (catálogo público) ────────────────

CREATE TABLE IF NOT EXISTS public.visual_kits (
  id                  text PRIMARY KEY,
  name                text NOT NULL,
  description         text,
  segments            text[] DEFAULT '{}',
  mood                text NOT NULL CHECK (mood IN ('editorial','bold','playful')),
  palette             jsonb NOT NULL,
  typography          jsonb NOT NULL,
  layout_preferences  jsonb DEFAULT '{}'::jsonb,
  preview_image_url   text,
  is_active           boolean DEFAULT true,
  display_order       int DEFAULT 100,
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visual_kits_active_idx
  ON public.visual_kits(is_active, display_order);

ALTER TABLE public.visual_kits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS visual_kits_public_read ON public.visual_kits;
CREATE POLICY visual_kits_public_read ON public.visual_kits
  FOR SELECT USING (true);

-- ─── 4. Estender content_packages com campos de renderização ──

ALTER TABLE public.content_packages
  ADD COLUMN IF NOT EXISTS rendered_image_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rendered_at          timestamptz,
  ADD COLUMN IF NOT EXISTS render_error         text,
  ADD COLUMN IF NOT EXISTS layout_plan          jsonb;

COMMENT ON COLUMN public.content_packages.rendered_image_urls IS
'URLs públicas dos PNGs renderizados na ordem dos slides';

COMMENT ON COLUMN public.content_packages.layout_plan IS
'Plano de layout do Agente 3 Designer: [{slide_n, layout_template, use_photo, photo_url}]';

-- ─── 5. Buckets de Storage ────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
  VALUES ('brand-photos', 'brand-photos', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('rendered-carousels', 'rendered-carousels', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

-- ─── 6. Storage policies — brand-photos ──────────────────────

DROP POLICY IF EXISTS "brand_photos_authenticated_insert" ON storage.objects;
CREATE POLICY "brand_photos_authenticated_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'brand-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "brand_photos_public_select" ON storage.objects;
CREATE POLICY "brand_photos_public_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'brand-photos');

DROP POLICY IF EXISTS "brand_photos_owner_delete" ON storage.objects;
CREATE POLICY "brand_photos_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'brand-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── 7. Storage policies — rendered-carousels ────────────────

DROP POLICY IF EXISTS "rendered_carousels_public_select" ON storage.objects;
CREATE POLICY "rendered_carousels_public_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'rendered-carousels');

-- INSERT/DELETE em rendered-carousels: apenas service_role (Edge Function)
-- Sem policy explícita = apenas service_role tem acesso de escrita
