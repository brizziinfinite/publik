-- ============================================================================
-- Migration: 20260520000001_sources_and_assets
-- Feature: Fonte → Pacote (Publik)
-- Renomeado: content_packages → source_packages (evita colisão com Sprint 2)
--            content_packages (Sprint 2) = pacotes do Agente 2 (ligados a content_ideas)
--            source_packages (este arquivo) = pacotes da feature Fontes (ligados a sources)
-- ============================================================================

-- 1. COLUNAS EXTRAS EM brands
-- ----------------------------------------------------------------------------

alter table public.brands
  add column if not exists voice text,
  add column if not exists audience text;

-- 2. ENUMS
-- ----------------------------------------------------------------------------

do $$ begin
  create type source_type as enum ('text', 'audio', 'url', 'pdf');
exception when duplicate_object then null; end $$;

do $$ begin
  create type source_status as enum (
    'queued',
    'extracting',
    'extracted',
    'generating',
    'ready',
    'partial',
    'failed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type asset_kind as enum (
    'carousel',
    'stories',
    'reel_script',
    'email',
    'blog'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type asset_status as enum (
    'pending',
    'generating',
    'ready',
    'failed'
  );
exception when duplicate_object then null; end $$;

-- 3. TABELA: sources
-- ----------------------------------------------------------------------------

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,

  type source_type not null,
  status source_status not null default 'queued',

  raw_text text,
  raw_url text,
  storage_path text,

  extracted_text text,
  extracted_metadata jsonb default '{}'::jsonb,

  error_message text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint sources_payload_check check (
    (type = 'text' and raw_text is not null) or
    (type = 'url'  and raw_url is not null) or
    (type in ('audio', 'pdf') and storage_path is not null)
  )
);

create index if not exists sources_user_id_idx  on public.sources(user_id);
create index if not exists sources_brand_id_idx on public.sources(brand_id);
create index if not exists sources_status_idx   on public.sources(status);

-- 4. TABELA: source_packages
-- ----------------------------------------------------------------------------
-- Agrupa os assets gerados a partir de uma source.
-- (NÃO confundir com content_packages do Sprint 2/Agente 2)

create table if not exists public.source_packages (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,

  generation_config jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists source_packages_source_id_idx on public.source_packages(source_id);
create index if not exists source_packages_user_id_idx   on public.source_packages(user_id);

-- 5. TABELA: content_assets
-- ----------------------------------------------------------------------------

create table if not exists public.content_assets (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.source_packages(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,

  kind asset_kind not null,
  status asset_status not null default 'pending',

  content jsonb,

  error_message text,

  tokens_input int default 0,
  tokens_output int default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint content_assets_unique_kind_per_package unique (package_id, kind)
);

create index if not exists content_assets_package_id_idx on public.content_assets(package_id);
create index if not exists content_assets_source_id_idx  on public.content_assets(source_id);
create index if not exists content_assets_user_id_idx    on public.content_assets(user_id);
create index if not exists content_assets_status_idx     on public.content_assets(status);

-- 6. COLUNAS EXTRAS EM posts
-- ----------------------------------------------------------------------------

alter table public.posts
  add column if not exists source_id uuid references public.sources(id) on delete set null,
  add column if not exists asset_id  uuid references public.content_assets(id) on delete set null;

create index if not exists posts_source_id_idx on public.posts(source_id);
create index if not exists posts_asset_id_idx  on public.posts(asset_id);

-- 7. TRIGGER: updated_at
-- ----------------------------------------------------------------------------

create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists sources_updated_at on public.sources;
create trigger sources_updated_at
  before update on public.sources
  for each row execute function public.tg_set_updated_at();

drop trigger if exists content_assets_updated_at on public.content_assets;
create trigger content_assets_updated_at
  before update on public.content_assets
  for each row execute function public.tg_set_updated_at();

-- 8. RLS
-- ----------------------------------------------------------------------------

alter table public.sources          enable row level security;
alter table public.source_packages  enable row level security;
alter table public.content_assets   enable row level security;

-- sources
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

-- source_packages
create policy "source_packages_select_own"
  on public.source_packages for select
  using (auth.uid() = user_id);

create policy "source_packages_insert_own"
  on public.source_packages for insert
  with check (auth.uid() = user_id);

create policy "source_packages_delete_own"
  on public.source_packages for delete
  using (auth.uid() = user_id);

-- content_assets
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
-- IMPORTANTE: worker (Express + BullMQ) usa SERVICE_ROLE_KEY → bypassa RLS.
-- Frontend (Next.js) usa token do user → RLS protege normalmente.
-- ----------------------------------------------------------------------------

-- 9. STORAGE BUCKET (rodar separado se CLI não suportar)
-- ----------------------------------------------------------------------------
-- insert into storage.buckets (id, name, public)
-- values ('sources', 'sources', false)
-- on conflict (id) do nothing;
--
-- create policy "sources_storage_owner_only"
--   on storage.objects for all
--   using (bucket_id = 'sources' and auth.uid()::text = (storage.foldername(name))[1])
--   with check (bucket_id = 'sources' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- Path padrão: sources/{user_id}/{source_id}.{ext}
