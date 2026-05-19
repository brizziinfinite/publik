-- ============================================================================
-- Migration: 20260518000001_sprint1_agent_strategist
-- Sprint 1: Agente 1 Estrategista
-- Adiciona colunas em brands + cria brand_plans, content_ideas, agent_runs
-- ============================================================================

-- 1. ADICIONAR COLUNAS EM brands
-- ----------------------------------------------------------------------------

alter table public.brands
  add column if not exists niche             text,
  add column if not exists tone              text,
  add column if not exists target_persona    text,
  add column if not exists pillars           jsonb    not null default '[]'::jsonb,
  add column if not exists forbidden_topics  text[]   not null default '{}',
  add column if not exists is_active         boolean  not null default true;

-- 2. FUNÇÃO updated_at (cria apenas se não existir — já existe na 001)
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- 3. TABELA: brand_plans
-- ----------------------------------------------------------------------------

create table if not exists public.brand_plans (
  id                   uuid        primary key default gen_random_uuid(),
  brand_id             uuid        not null references public.brands(id) on delete cascade,
  user_id              uuid        not null references auth.users(id) on delete cascade,

  -- Goal
  goal_primary         text        not null,
  goal_metric          text        not null,
  goal_target_value    int         not null,
  goal_current_value   int         not null default 0,
  support_metrics      jsonb       not null default '[]'::jsonb,

  -- Timeline
  timeline_days        int         not null,
  started_at           date        not null default current_date,
  deadline             date        generated always as (started_at + (timeline_days * interval '1 day')) stored,

  -- Fase e contexto
  current_phase        text        not null check (current_phase in (
                                     'validate_message',
                                     'validate_offer',
                                     'predictable_sales',
                                     'scale_acquisition'
                                   )),
  current_blocker      text,

  -- Brand assets e estratégia
  brand_assets         jsonb       not null default '{}'::jsonb,
  weekly_priorities    jsonb       not null default '[]'::jsonb,
  pricing              jsonb       not null default '{}'::jsonb,
  main_offer           text,
  main_cta             text,

  is_active            boolean     not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Índices
create unique index if not exists brand_plans_one_active_per_brand
  on public.brand_plans (brand_id)
  where is_active = true;

create index if not exists brand_plans_brand_active_idx
  on public.brand_plans (brand_id, is_active);

-- Trigger updated_at
create trigger brand_plans_updated_at
  before update on public.brand_plans
  for each row execute function public.tg_set_updated_at();

-- RLS
alter table public.brand_plans enable row level security;

create policy "brand_plans_all_own"
  on public.brand_plans for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 4. TABELA: content_ideas
-- ----------------------------------------------------------------------------

create table if not exists public.content_ideas (
  id              uuid        primary key default gen_random_uuid(),
  brand_id        uuid        not null references public.brands(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  plan_id         uuid        references public.brand_plans(id) on delete set null,

  -- Conteúdo da ideia
  angle           text        not null,
  topic           text        not null,
  hook            text,
  detail          text,
  cta             text,
  format          text        not null check (format in (
                                'carrossel', 'reel', 'story',
                                'blog', 'email', 'post'
                              )),
  pillar          text,
  rationale       text,
  contributes_to  text,

  -- Agendamento
  scheduled_for   date,
  week_of         date,

  -- Status e workflow
  status          text        not null default 'pending' check (status in (
                                'pending', 'approved', 'rejected',
                                'generated', 'posted', 'archived'
                              )),
  post_id         uuid        references public.posts(id) on delete set null,

  -- Rastreabilidade do agente
  generated_by    text        not null default 'agent_1_estrategista',
  llm_model       text,
  llm_cost_usd    numeric(10,6) not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Índices
create index if not exists content_ideas_brand_status_idx
  on public.content_ideas (brand_id, status);

create index if not exists content_ideas_scheduled_pending_idx
  on public.content_ideas (scheduled_for)
  where status in ('pending', 'approved');

create index if not exists content_ideas_brand_week_idx
  on public.content_ideas (brand_id, week_of);

-- Trigger updated_at
create trigger content_ideas_updated_at
  before update on public.content_ideas
  for each row execute function public.tg_set_updated_at();

-- RLS
alter table public.content_ideas enable row level security;

create policy "content_ideas_all_own"
  on public.content_ideas for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 5. TABELA: agent_runs
-- ----------------------------------------------------------------------------

create table if not exists public.agent_runs (
  id              uuid        primary key default gen_random_uuid(),
  agent_name      text        not null,
  brand_id        uuid        references public.brands(id) on delete cascade,
  user_id         uuid        references auth.users(id) on delete cascade,

  status          text        not null check (status in (
                                'running', 'success', 'failed', 'partial'
                              )),
  input_payload   jsonb,
  output_payload  jsonb,
  error_message   text,

  -- LLM metadata
  llm_provider    text,
  llm_model       text,
  input_tokens    int,
  output_tokens   int,
  cost_usd        numeric(10,6) not null default 0,
  duration_ms     int,

  started_at      timestamptz not null default now(),
  finished_at     timestamptz
);

-- Índice
create index if not exists agent_runs_name_brand_started_idx
  on public.agent_runs (agent_name, brand_id, started_at desc);

-- RLS — somente SELECT por user_id (runs são inseridos pelo service_role)
alter table public.agent_runs enable row level security;

create policy "agent_runs_select_own"
  on public.agent_runs for select
  using (user_id = auth.uid());
