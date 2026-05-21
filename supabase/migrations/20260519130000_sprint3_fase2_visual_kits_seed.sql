-- ============================================================
-- Sprint 3 — Fase 2 — Seed: 9 Kits Visuais
-- Idempotente: INSERT ... ON CONFLICT DO UPDATE
-- ============================================================

INSERT INTO public.visual_kits
  (id, name, description, segments, mood, palette, typography, layout_preferences, preview_image_url, is_active, display_order)
VALUES

-- ─── KIT 1 — Agro Sério ──────────────────────────────────────
(
  'agro_serio',
  'Agro Sério',
  'Pra quem vende no campo e precisa parecer sério. Tom editorial de Globo Rural, sem hype tech.',
  ARRAY['agro','agronegocio','fazenda','irrigacao','pecuaria','plantio','soja','milho'],
  'editorial',
  '{"primary":"#1B4332","accent":"#52B788","bg":"#FEFAE0","text":"#1A1A1A","muted":"#495057","support":"#B07D62"}'::jsonb,
  '{"display_font":"Bricolage Grotesque","body_font":"Crimson Pro","mono_font":"JetBrains Mono"}'::jsonb,
  '{"hook_style":"subtitled","cta_style":"price_focus","border_radius":"soft"}'::jsonb,
  null, true, 10
),

-- ─── KIT 2 — Oficina Industrial ──────────────────────────────
(
  'oficina_industrial',
  'Oficina Industrial',
  'Mecânica, autoelétrica, borracharia. Cores que comunicam força e confiabilidade.',
  ARRAY['oficina_mecanica','autoeletrica','borracharia','lavajato','auto_pecas'],
  'bold',
  '{"primary":"#1E3A8A","accent":"#F97316","bg":"#0F172A","text":"#FAFAFA","muted":"#94A3B8","support":"#FBBF24"}'::jsonb,
  '{"display_font":"Anton","body_font":"Inter","mono_font":"JetBrains Mono"}'::jsonb,
  '{"hook_style":"oversized","cta_style":"trust","border_radius":"sharp"}'::jsonb,
  null, true, 20
),

-- ─── KIT 3 — Boutique Feminina ───────────────────────────────
(
  'boutique_feminina',
  'Boutique Feminina',
  'Loja de roupas femininas, acessórios, lifestyle. Sofisticado sem ser frio.',
  ARRAY['moda','roupas_femininas','acessorios','loja_feminina','boutique'],
  'editorial',
  '{"primary":"#78350F","accent":"#D4A373","bg":"#FAEDCD","text":"#1F1F1F","muted":"#71717A","support":"#FECDD3"}'::jsonb,
  '{"display_font":"Cormorant Garamond","body_font":"Lora","mono_font":"JetBrains Mono"}'::jsonb,
  '{"hook_style":"subtitled","cta_style":"trust","border_radius":"soft"}'::jsonb,
  null, true, 30
),

-- ─── KIT 4 — Confeitaria Caseira ─────────────────────────────
(
  'confeitaria_caseira',
  'Confeitaria Caseira',
  'Bolos, doces, encomendas. Aconchego e qualidade artesanal.',
  ARRAY['confeitaria','doces','bolos','encomendas','padaria','cafe'],
  'editorial',
  '{"primary":"#7C2D12","accent":"#FBBF24","bg":"#FFF7ED","text":"#1F1F1F","muted":"#78716C","support":"#FCA5A5"}'::jsonb,
  '{"display_font":"Playfair Display","body_font":"Lora","mono_font":"JetBrains Mono"}'::jsonb,
  '{"hook_style":"subtitled","cta_style":"price_focus","border_radius":"round"}'::jsonb,
  null, true, 40
),

-- ─── KIT 5 — Personal Energético ─────────────────────────────
(
  'personal_energetico',
  'Personal Energético',
  'Personal trainer, coach fitness, crossfit. Energia, transformação, intensidade.',
  ARRAY['personal_trainer','fitness','crossfit','academia','nutricionista_esportivo'],
  'bold',
  '{"primary":"#0A0A0A","accent":"#DC2626","bg":"#FAFAFA","text":"#0A0A0A","muted":"#525252","support":"#FBBF24"}'::jsonb,
  '{"display_font":"Anton","body_font":"Inter","mono_font":"JetBrains Mono"}'::jsonb,
  '{"hook_style":"oversized","cta_style":"urgency","border_radius":"sharp"}'::jsonb,
  null, true, 50
),

-- ─── KIT 6 — Advocacia Institucional ─────────────────────────
(
  'advocacia_institucional',
  'Advocacia Institucional',
  'Advogados, contadores, consultores. Sério, confiável, sem ser entediante.',
  ARRAY['advocacia','contabilidade','consultoria','auditoria','juridico'],
  'editorial',
  '{"primary":"#0F172A","accent":"#B45309","bg":"#F8FAFC","text":"#0F172A","muted":"#475569","support":"#FBBF24"}'::jsonb,
  '{"display_font":"Cormorant Garamond","body_font":"Lora","mono_font":"JetBrains Mono"}'::jsonb,
  '{"hook_style":"subtitled","cta_style":"trust","border_radius":"sharp"}'::jsonb,
  null, true, 60
),

-- ─── KIT 7 — Pizzaria Calorosa ───────────────────────────────
(
  'pizzaria_calorosa',
  'Pizzaria Calorosa',
  'Pizzaria, hamburgueria, comida quente. Apetite, calor, ousadia.',
  ARRAY['pizzaria','hamburgueria','restaurante','delivery_comida','comida_italiana'],
  'bold',
  '{"primary":"#991B1B","accent":"#FBBF24","bg":"#1C1917","text":"#FAFAF9","muted":"#A8A29E","support":"#FB923C"}'::jsonb,
  '{"display_font":"Bebas Neue","body_font":"Inter","mono_font":"JetBrains Mono"}'::jsonb,
  '{"hook_style":"oversized","cta_style":"urgency","border_radius":"soft"}'::jsonb,
  null, true, 70
),

-- ─── KIT 8 — Tatuagem Underground ────────────────────────────
(
  'tatuagem_underground',
  'Tatuagem Underground',
  'Estúdio de tatuagem, piercing, barbearia alternativa. Preto, contraste, atitude.',
  ARRAY['tatuagem','piercing','barbearia','estudio_tattoo'],
  'bold',
  '{"primary":"#000000","accent":"#FAFAFA","bg":"#0A0A0A","text":"#FAFAFA","muted":"#737373","support":"#DC2626"}'::jsonb,
  '{"display_font":"Bebas Neue","body_font":"JetBrains Mono","mono_font":"JetBrains Mono"}'::jsonb,
  '{"hook_style":"oversized","cta_style":"urgency","border_radius":"sharp"}'::jsonb,
  null, true, 80
),

-- ─── KIT 9 — Imobiliária Premium ─────────────────────────────
(
  'imobiliaria_premium',
  'Imobiliária Premium',
  'Imóveis, corretor, construção. Sofisticação e confiança no investimento.',
  ARRAY['imobiliaria','corretor_imoveis','construcao','arquitetura','design_interiores'],
  'editorial',
  '{"primary":"#1C1917","accent":"#B45309","bg":"#F5F5F4","text":"#1C1917","muted":"#57534E","support":"#D6D3D1"}'::jsonb,
  '{"display_font":"Cormorant Garamond","body_font":"Lora","mono_font":"JetBrains Mono"}'::jsonb,
  '{"hook_style":"subtitled","cta_style":"trust","border_radius":"sharp"}'::jsonb,
  null, true, 90
)

ON CONFLICT (id) DO UPDATE SET
  name                = EXCLUDED.name,
  description         = EXCLUDED.description,
  segments            = EXCLUDED.segments,
  mood                = EXCLUDED.mood,
  palette             = EXCLUDED.palette,
  typography          = EXCLUDED.typography,
  layout_preferences  = EXCLUDED.layout_preferences,
  is_active           = EXCLUDED.is_active,
  display_order       = EXCLUDED.display_order;

-- ─── Vincular IrrigaAgro ao kit agro_serio ────────────────────

UPDATE public.brands
SET
  segment        = 'irrigacao',
  visual_kit_id  = 'agro_serio',
  visual_identity_v2 = (
    SELECT jsonb_build_object(
      'palette',             vk.palette,
      'typography',          vk.typography,
      'mood',                vk.mood,
      'layout_preferences',  vk.layout_preferences
    )
    FROM public.visual_kits vk
    WHERE vk.id = 'agro_serio'
  )
WHERE name = 'IrrigaAgro';
