-- ============================================================================
-- Migration: 001_sources_and_assets
-- Feature: Fonte → Pacote (Publik)
-- Roda no SQL Editor do Supabase ou via supabase migration new
-- ============================================================================

-- 1. ENUMS
-- ----------------------------------------------------------------------------

alter table public.brands
  add column if not exists voice text,
  add column if not exists audience text;

create type source_type as enum ('text', 'audio', 'url', 'pdf');

create type source_status as enum (
  'queued',
  'extracting',
  'extracted',
  'generating',
  'ready',
  'partial',
  'failed'
);

create type asset_kind as enum (
  'carousel',
  'stories',
  'reel_script',
  'email',
  'blog'
);

create type asset_status as enum (
  'pending',
  'generating',
  'ready',
  'failed'
);

-- 2. TABELA: sources
-- ----------------------------------------------------------------------------
-- Fonte de input que vai virar um pacote de conteúdo.

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,

  type source_type not null,
  status source_status not null default 'queued',

  -- input bruto (depende do type)
  raw_text text,                    -- type=text: texto colado
  raw_url text,                     -- type=url
  storage_path text,                -- type=audio|pdf: caminho no Supabase Storage

  -- conteúdo extraído / normalizado (sempre vira texto)
  extracted_text text,
  extracted_metadata jsonb default '{}'::jsonb,
  -- ex: { duration_seconds: 612, language: "pt-BR", title: "...", author: "..." }

  -- erros de extração
  error_message text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint sources_payload_check check (
    (type = 'text' and raw_text is not null) or
    (type = 'url'  and raw_url is not null) or
    (type in ('audio', 'pdf') and storage_path is not null)
  )
);

create index sources_user_id_idx on public.sources(user_id);
create index sources_brand_id_idx on public.sources(brand_id);
create index sources_status_idx on public.sources(status);

-- 3. TABELA: content_packages
-- ----------------------------------------------------------------------------
-- Agrupa os 5 assets gerados a partir de uma source.
-- 1:1 com source no v1, mas modelado como 1:N pra permitir regenerar pacote
-- inteiro com prompt diferente no futuro.

create table public.content_packages (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,

  -- snapshot da config usada na geração (pra reproduzir/auditar)
  generation_config jsonb not null default '{}'::jsonb,
  -- ex: { model: "claude-haiku-4-5", temperature: 0.7, brand_voice_sample: "..." }

  created_at timestamptz not null default now()
);

create index content_packages_source_id_idx on public.content_packages(source_id);
create index content_packages_user_id_idx on public.content_packages(user_id);

-- 4. TABELA: content_assets
-- ----------------------------------------------------------------------------
-- Cada asset individual (carrossel, stories, reel_script, email, blog).

create table public.content_assets (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.content_packages(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,

  kind asset_kind not null,
  status asset_status not null default 'pending',

  -- payload estruturado do asset (formato depende do kind)
  -- carousel: { slides: [{ title, body, layout }] }
  -- stories: { stories: [{ text, visual_hint }] }
  -- reel_script: { hook, body, cta, broll_hints, voice_notes }
  -- email: { subject, preview, body_html, body_text, cta }
  -- blog: { title, slug, body_md, meta_description, tags }
  content jsonb,

  -- erro de geração
  error_message text,

  -- tokens consumidos (auditoria de custo)
  tokens_input int default 0,
  tokens_output int default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint content_assets_unique_kind_per_package unique (package_id, kind)
);

create index content_assets_package_id_idx on public.content_assets(package_id);
create index content_assets_source_id_idx on public.content_assets(source_id);
create index content_assets_user_id_idx on public.content_assets(user_id);
create index content_assets_status_idx on public.content_assets(status);

-- 5. ALTERAR posts pra ligar com source (opcional)
-- ----------------------------------------------------------------------------

alter table public.posts
  add column if not exists source_id uuid references public.sources(id) on delete set null,
  add column if not exists asset_id  uuid references public.content_assets(id) on delete set null;

create index if not exists posts_source_id_idx on public.posts(source_id);
create index if not exists posts_asset_id_idx  on public.posts(asset_id);

-- 6. TRIGGER: updated_at
-- ----------------------------------------------------------------------------

create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger sources_updated_at
  before update on public.sources
  for each row execute function public.tg_set_updated_at();

create trigger content_assets_updated_at
  before update on public.content_assets
  for each row execute function public.tg_set_updated_at();

-- 7. RLS
-- ----------------------------------------------------------------------------

alter table public.sources           enable row level security;
alter table public.content_packages  enable row level security;
alter table public.content_assets    enable row level security;

-- sources: dono vê/edita seus próprios
create policy "sources_select_own"
  on public.sources for select
  using (auth.uid() = user_id);

create policy "sources_insert_own"
  on public.sources for insert
  with check (auth.uid() = user_id);

create policy "sources_update_own"
  on public.sources for update
  using (auth.uid() = user_id);

create policy "sources_delete_own"
  on public.sources for delete
  using (auth.uid() = user_id);

-- content_packages: idem
create policy "content_packages_select_own"
  on public.content_packages for select
  using (auth.uid() = user_id);

create policy "content_packages_insert_own"
  on public.content_packages for insert
  with check (auth.uid() = user_id);

create policy "content_packages_delete_own"
  on public.content_packages for delete
  using (auth.uid() = user_id);

-- content_assets: idem
create policy "content_assets_select_own"
  on public.content_assets for select
  using (auth.uid() = user_id);

create policy "content_assets_insert_own"
  on public.content_assets for insert
  with check (auth.uid() = user_id);

create policy "content_assets_update_own"
  on public.content_assets for update
  using (auth.uid() = user_id);

create policy "content_assets_delete_own"
  on public.content_assets for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- IMPORTANTE: o worker (Express + BullMQ) usa SERVICE_ROLE_KEY, que bypassa RLS.
-- O frontend (Next.js) usa o token do user, então RLS protege normalmente.
-- ----------------------------------------------------------------------------

-- 8. STORAGE BUCKET
-- ----------------------------------------------------------------------------
-- Rodar no painel do Supabase ou via CLI:
--
-- insert into storage.buckets (id, name, public)
-- values ('sources', 'sources', false);
--
-- create policy "sources_storage_owner_only"
--   on storage.objects for all
--   using (bucket_id = 'sources' and auth.uid()::text = (storage.foldername(name))[1])
--   with check (bucket_id = 'sources' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- Padrão de path: sources/{user_id}/{source_id}.{ext}
