# Melhorias — Publik

Checklist de tudo que precisa ser feito para deixar o app top.
Marque com ✅ conforme for concluindo.

---

## 🏗️ Fundação / Banco de Dados

- [x] Criar tabelas no Supabase: `profiles`, `brands`, `posts`
- [x] Configurar RLS em todas as tabelas
- [x] Criar trigger para popular `profiles` ao criar usuário
- [x] Gerar tipos TypeScript a partir do Supabase (`supabase gen types`)

---

## 🏷️ Brands

- [x] Listagem de brands do usuário
- [x] Formulário de criação (nome, slug, cor primária, logo)
- [x] Upload de logo para Supabase Storage
- [x] Edição de brand existente
- [x] Exclusão de brand (com confirmação)
- [x] Seletor de brand ativo na Sidebar (contexto global via Zustand)

---

## 📝 Posts

- [x] Listagem de posts com filtros (status, brand, data)
- [x] Formulário de criação de post (conteúdo, mídia, plataforma, data agendada)
- [x] Upload de mídia (imagens/vídeos) para Supabase Storage
- [x] Preview do post antes de publicar
- [x] Edição de post existente
- [x] Exclusão de post (com confirmação)
- [x] Status de post: Rascunho / Agendado / Publicado / Falhado
- [x] Publicação manual imediata
- [x] Agendamento de publicação com data/hora

---

## 🧠 Fonte → Pacote

- [x] Integrar pacote base no app Next.js (`/dashboard/sources/new`, detalhe e APIs)
- [x] Criar worker BullMQ em `worker/` para extração e geração em segundo plano
- [x] Criar migration `001_sources_and_assets.sql`
- [x] Adicionar item **Fontes** na sidebar
- [x] Validar build do Next e TypeScript do worker
- [ ] Aplicar migration no Supabase
- [ ] Criar bucket privado `sources` no Supabase Storage
- [ ] Configurar `REDIS_URL`, `OPENAI_API_KEY` e `ANTHROPIC_API_KEY`
- [ ] Subir Redis/Upstash para a fila `source-processing`
- [ ] Rodar app + worker localmente e fazer smoke test com fonte de texto
- [ ] Validar upload/processamento de áudio, PDF e URL

---

## 📅 Calendário

- [x] Visualização mensal dos posts agendados
- [x] Drag & drop para reagendar posts
- [x] Clique no post para ver detalhes/editar
- [x] Filtro por brand no calendário (usa brand ativa do contexto)
- [x] Indicador visual de status (cor por status)

---

## 🔐 Autenticação

- [x] Proteção real de rotas (proxy.ts com Supabase SSR)
- [x] Logout funcionando
- [x] Página de perfil do usuário
- [x] Atualização de nome e avatar
- [x] Troca de senha
- [x] Reset de senha por email

---

## ⚙️ Configurações

- [x] Configurações gerais da conta (timezone + notificações)
- [ ] Gerenciamento de plano/assinatura (futuro)
- [x] Notificações por email (toggles na página de settings)
- [x] Integrações com redes sociais (OAuth Meta + TikTok — aguarda credenciais)
- [ ] Tokens de API / webhooks

---

## 🎨 UI / UX

- [x] Toast notifications (sucesso, erro, aviso)
- [x] Loading skeletons nas listagens
- [x] Empty states com CTAs em todas as páginas
- [x] Sidebar colapsável no mobile (Sheet)
- [x] Responsividade completa (mobile-first)
- [x] Animações de transição entre páginas (framer-motion fade+slide)
- [x] Dark/Light mode toggle
- [x] Favicon e meta tags (OG image)

---

## 🔗 Integrações

- [x] Instagram (Graph API — OAuth + publicação via Edge Function)
- [x] TikTok (OAuth + Content Posting API)
- [x] Facebook / Meta (OAuth + Graph API)
- [ ] Twitter / X
- [ ] LinkedIn
- [x] Fila de publicação via Edge Functions (cron — pg_cron a cada minuto)

---

## 🚀 Infra / Deploy

- [x] Deploy na Vercel (https://publik-sigma.vercel.app)
- [x] Variáveis de ambiente configuradas em produção
- [ ] Domínio customizado
- [x] Edge Functions para publicação agendada (publish-scheduled-posts)
- [ ] Monitoramento de erros (Sentry ou similar)

---

## 🤖 Sprint 1 — Agente 1 (Estrategista)

### O que foi implementado

- Edge Function `agent-1-strategist` que lê o Plano Base de cada brand ativa e gera 7 ideias de conteúdo via Gemini Flash 2.5 (ou Claude Haiku como fallback)
- Página `/dashboard/ideas` com listagem, aprovação, rejeição e edição de ideias
- Item "Ideias" adicionado na Sidebar

### Tabelas criadas

- `public.brand_plans` — Plano Base com objetivos, fase, prioridades semanais, pricing e brand assets
- `public.content_ideas` — Backlog de ideias geradas pelo Agente 1 (7 por semana, distribuídas seg-dom)
- `public.agent_runs` — Log de execuções dos agentes (tokens, custo, duração, status)

### Colunas adicionadas em `brands`

- `niche` — nicho do negócio
- `tone` — tom de voz detalhado (texto)
- `target_persona` — persona-alvo
- `pillars` — pilares de conteúdo (JSONB array)
- `forbidden_topics` — tópicos proibidos (text[])
- `is_active` — flag de ativação

### Variáveis de ambiente necessárias

```
GEMINI_API_KEY=AIzaSy...        # obrigatório (free tier em aistudio.google.com)
ANTHROPIC_API_KEY=sk-ant-...    # opcional (fallback via LLM_PROVIDER=anthropic)
LLM_PROVIDER=gemini             # padrão: gemini | alternativa: anthropic
```

### Como testar

1. Cadastrar brand **IrrigaAgro** via UI em `/dashboard/brands`
2. Aplicar migrations:
   ```bash
   supabase db push
   ```
3. Configurar secret no Supabase:
   ```bash
   supabase secrets set GEMINI_API_KEY=AIzaSy...
   ```
4. Deploy da Edge Function:
   ```bash
   supabase functions deploy agent-1-strategist
   ```
5. Acessar `/dashboard/ideas` e clicar **"Gerar agora"**

Ou via curl:
```bash
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/functions/v1/agent-1-strategist" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"brand_id": "<uuid-da-brand>"}'
```

### Limitações conhecidas

- Sem UI para criar/editar o Plano Base — configuração é via seed SQL
- Sem agendamento automático do agente (pg_cron) — execução manual por enquanto

---

## 🤖 Sprint 2 — Agente 2 (Roteirista)

### O que foi implementado

- Edge Function `agent-2-roteirista`: recebe `idea_id` (aprovada) e gera pacote de conteúdo completo via Gemini Flash 2.5
- 6 prompts específicos por formato: carrossel (slides com title/body/cta), reel (hook + cenas + CTA), story (frames com texto + sticker), blog (título + intro + conclusão), email (assunto + preview + corpo HTML), post (caption + primeiro comentário)
- Idempotência: retorna pacote existente se ideia já tiver pacote ativo
- Página `/dashboard/packages`: listagem de todos os pacotes com filtro por status
- Página `/dashboard/packages/[id]`: detalhe com render por formato, visual prompt, metadados de custo, ações Aprovar / Rejeitar / Converter em post
- Botão "Gerar pacote" / "Ver pacote" nos cards de ideias aprovadas
- Utilitário `lib/packages/convertToPost.ts`: converte pacote aprovado em post agendado (reutiliza `scheduled_for` da ideia)
- Item "Pacotes" adicionado na Sidebar

### Tabelas criadas

- `public.content_packages` — Pacotes gerados pelo Agente 2, um por ideia ativa, com colunas JSONB por formato
- Coluna `package_id` adicionada em `content_ideas`

### Variáveis de ambiente

Mesmas do Sprint 1 (`GEMINI_API_KEY`, `LLM_PROVIDER`).

### Fluxo completo

```
/dashboard/ideas
  → Aprovar ideia
  → Gerar pacote (chama agent-2-roteirista)
  → /dashboard/packages/[id]
  → Aprovar pacote
  → Converter em post → /dashboard/posts
```

### Limitações conhecidas

- Sem revisão de texto in-line no pacote (edição de caption, slides etc.) — só aprova/rejeita
- Sem geração de imagem (visual_prompt gerado mas não executado)
- Sem agendamento automático do Agente 2 — execução manual por ideia

---

## 🔁 Hotfix — LLM Retry com Backoff Exponencial

### O que muda

- Helper compartilhado `supabase/functions/_shared/llm-retry.ts` com `withRetry<T>()`
- `agent-1-strategist` e `agent-2-roteirista` envolvem todas as chamadas Gemini e Anthropic com retry automático

### Erros retryable (fazem retry)

| Código | Motivo |
|--------|--------|
| 503 | Service Unavailable (Gemini sobrecarregado) |
| 429 | Too Many Requests |
| 529 | Overloaded (padrão Anthropic) |
| Network errors | fetch failed, timeout, ECONNRESET |

Outros erros (4xx exceto 429, 500, 502) falham direto — sem retry.

### Backoff

3 tentativas total: delays 2s → 8s → 30s + jitter aleatório 0-500ms por tentativa.

### Onde ver as tentativas

```sql
SELECT
  status,
  input_payload->'attempts' as attempts,
  llm_cost_usd,
  duration_ms
FROM public.agent_runs
WHERE agent_name = 'agent_2_roteirista'
ORDER BY started_at DESC LIMIT 1;
```

`attempts` é array JSONB em `input_payload` — cada elemento tem `attempt`, `status`, `error_message`, `duration_ms`, `timestamp`.

---

## 🧙 Sprint 3 Fase 4 — Brand Wizard (em andamento)

Rota: `/dashboard/brands/[id]/setup`

Wizard multi-step para configurar tudo de uma brand antes de rodar os agentes.
**Fora do escopo:** sugestão de kit por IA, CRUD posterior de brand_plans.

### Step 1 — Identidade
Campos em `brands`:
- `name` — nome da brand
- `slug` — identificador URL
- `primary_color` — cor hex
- `logo` — upload para Supabase Storage
- `niche` — nicho do negócio
- `segment` — segmento (B2B / B2C / ambos) ← **nova coluna**
- `visual_kit_id` — FK para `visual_kits` (botão "Pular por agora" → default kit)

### Step 2 — Voz
Campos em `brands`:
- `tone` — tom de voz (textarea)
- `target_persona` — persona-alvo (textarea)
- `pillars` — até 5 pilares, cada um com `{ name, description, weight }` (JSONB[])
- `forbidden_topics` — tópicos proibidos (text[], chips input)

### Step 3 — Oferta
Campos em `brand_plans` (`pricing` JSONB + `brand_assets` JSONB):
- `pricing.anchor_phrases` — frases âncora de preço (text[])
- `pricing.price_brl_per_hectare_month` — preço por hectare/mês (number) OU campo livre
- `brand_assets.content_formats_priority` — prioridade de formatos (reorder drag)
- `brand_assets.hashtags_core` — hashtags principais (chips input)

### Step 4 — Plano
Campos em `brand_plans`:
- `goal_primary` — objetivo principal (textarea curto)
- `current_phase` — fase atual (select: validate_message / validate_offer / predictable_sales / scale_acquisition)
- `current_blocker` — bloqueio atual (textarea)
- `main_offer` — oferta principal (input)
- `main_cta` — CTA principal (input)
- `timeline_days` — prazo em dias (number)
- `weekly_priorities` — 4 textareas curtos, um por prioridade semanal

### Checklist de implementação

- [ ] `app/(dashboard)/dashboard/brands/[id]/setup/page.tsx` — shell da rota
- [ ] `components/brands/wizard/BrandWizard.tsx` — orquestrador de steps + estado global
- [ ] `components/brands/wizard/StepIdentidade.tsx`
- [ ] `components/brands/wizard/StepVoz.tsx`
- [ ] `components/brands/wizard/StepOferta.tsx`
- [ ] `components/brands/wizard/StepPlano.tsx`
- [ ] `components/brands/wizard/WizardProgress.tsx` — barra de progresso (4 steps)
- [ ] `app/api/brands/[id]/setup/route.ts` — PATCH brands + upsert brand_plans
- [ ] Migration: adicionar `segment` em `brands` + `visual_kit_id` em `brands`
- [ ] Atualizar `types/database.ts` com novos campos

---

## 🤖 Hermes Agent + Obsidian (futuro — pós Sprint 3)

> Fazer depois que Agente 1, 2 e 3 estiverem estáveis. Hermes é camada de orquestração por cima dos agentes existentes.

### O que é

Hermes Agent (Nous Research, MIT) = agente autônomo auto-hospedado com:
- Memória persistente entre sessões
- Skills reutilizáveis (receitas aprendidas)
- Controle via Telegram ou Discord
- Execução real: shell, Docker, GitHub, APIs

### Arquitetura no Publik

```
Telegram/Discord
      │
      ▼
┌─────────────────────────────────┐
│        Hermes Agent (VPS)        │
│  ┌──────────┐  ┌──────────────┐ │
│  │ Memória  │  │    Skills    │ │
│  │ Obsidian │  │ (receitas)   │ │
│  └──────────┘  └──────────────┘ │
└──────────┬──────────────────────┘
           │ chama via HTTP
           ▼
┌──────────────────────────────────┐
│        Supabase Edge Functions   │
│  agent-1-strategist              │
│  agent-2-roteirista              │
│  agent-3-designer (futuro)       │
│  render-carousel (futuro)        │
└──────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│        Supabase DB               │
│  brand_plans, content_ideas,     │
│  content_packages, posts         │
└──────────────────────────────────┘
```

### Fluxos que Hermes habilitaria

| Comando no Telegram | Ação |
|---------------------|------|
| "gera ideias da semana" | dispara agent-1 para todas brands ativas |
| "aprova ideia 3" | atualiza `content_ideas.status = approved` |
| "gera pacote da ideia aprovada" | dispara agent-2 |
| "mostra pacotes pendentes" | retorna lista com links |
| "agenda post para sexta" | atualiza `posts.scheduled_for` |
| "como estão os agentes?" | retorna últimos `agent_runs` |
| "qual ideia performou melhor?" | futura query de analytics |

### Como o Obsidian entra

Obsidian funciona como **vault de memória estruturada** do Hermes:

```
obsidian-vault/
├── brands/
│   └── irrigaagro.md        ← persona, tom, pillars, CTA, pricing
├── decisoes/
│   └── 2026-05-19.md        ← por que escolhemos Gemini, formato carrossel etc.
├── skills/
│   └── gerar-semana.md      ← receita: como disparar agente 1 + aprovar ideias
├── contexto/
│   └── sprint-atual.md      ← o que está sendo construído agora
└── preferencias/
    └── brizzi.md            ← tom preferido, horários, plataformas prioritárias
```

Hermes lê esses arquivos antes de executar qualquer ação → não precisa reexplicar contexto a cada sessão.

Obsidian também abre o vault no desktop para edição humana — você atualiza `irrigaagro.md` com novas informações da brand e o Hermes usa automaticamente na próxima execução.

### Infraestrutura necessária

- [ ] VPS (DigitalOcean/Hetzner — ~$6/mês) com Docker
- [ ] Hermes Agent instalado (repositório Nous Research)
- [ ] Bot Telegram criado via @BotFather
- [ ] Obsidian instalado + vault sincronizado via Git ou Obsidian Sync
- [ ] Variáveis de ambiente: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_TOKEN`
- [ ] Skills criadas: `gerar-ideias`, `aprovar-ideia`, `gerar-pacote`, `status-agentes`

### Skills a criar (ordem de prioridade)

1. `status-agentes` — retorna últimos 5 `agent_runs` com status/custo
2. `gerar-ideias` — chama agent-1-strategist via HTTP + confirma no Telegram
3. `aprovar-ideia` — lista ideias pending + aprova pelo número
4. `gerar-pacote` — chama agent-2-roteirista para ideia aprovada
5. `resumo-semanal` — consolida ideias/pacotes/posts da semana em texto

### Quando fazer

Pré-requisitos antes de começar Hermes:
- [ ] Sprint 3 (carrossel visual) concluído
- [ ] pg_cron configurado (agendamento automático dos agentes)
- [ ] UI de brand_plans criada
- [ ] Pelo menos 2 semanas de uso dos agentes 1+2 para validar fluxo manual antes de automatizar

---

## 📊 Analytics (futuro)

- [ ] Taxa de engajamento por post
- [ ] Melhor horário para postar
- [ ] Crescimento de seguidores ao longo do tempo
- [ ] Relatório exportável (PDF/CSV)
