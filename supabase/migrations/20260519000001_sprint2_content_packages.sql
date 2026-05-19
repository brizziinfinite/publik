-- ============================================================================
-- Migration: 20260519000001_sprint2_content_packages
-- Sprint 2: Agente 2 Roteirista — content_packages
-- ============================================================================

-- 1. TABELA: content_packages
-- ----------------------------------------------------------------------------

create table if not exists public.content_packages (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  idea_id uuid not null references public.content_ideas(id) on delete cascade,

  format text not null check (format in ('carrossel','reel','story','blog','email','post')),

  -- Conteúdo por formato (apenas um preenchido por pacote)
  carousel_slides  jsonb,
  reel_script      jsonb,
  story_frames     jsonb,
  blog_content     jsonb,
  email_content    jsonb,
  post_content     jsonb,

  -- Comum
  visual_prompt          text,
  estimated_post_length  int,

  -- Status
  status text not null default 'pending_review' check (status in (
    'generating','pending_review','approved','converted_to_post','rejected','failed'
  )),

  -- Link com post real quando convertido
  post_id uuid references public.posts(id) on delete set null,

  -- Metadados do agente
  generated_by         text    not null default 'agent_2_roteirista',
  llm_provider         text,
  llm_model            text,
  llm_cost_usd         numeric(10,6) not null default 0,
  generation_attempts  int     not null default 1,
  error_message        text,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Índices
create index if not exists content_packages_brand_status_idx
  on public.content_packages (brand_id, status);

create index if not exists content_packages_idea_idx
  on public.content_packages (idea_id);

-- 1 pacote ativo por ideia (exclui rejected e failed)
create unique index if not exists content_packages_idea_active_idx
  on public.content_packages (idea_id)
  where status not in ('rejected', 'failed');

create index if not exists content_packages_pending_review_idx
  on public.content_packages (status)
  where status = 'pending_review';

-- Trigger updated_at
create trigger content_packages_updated_at
  before update on public.content_packages
  for each row execute function public.tg_set_updated_at();

-- RLS
alter table public.content_packages enable row level security;

create policy "content_packages_all_own"
  on public.content_packages for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 2. ADICIONAR package_id em content_ideas
-- ----------------------------------------------------------------------------

alter table public.content_ideas
  add column if not exists package_id uuid references public.content_packages(id) on delete set null;
