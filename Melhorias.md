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

## 📊 Analytics (futuro)

- [ ] Taxa de engajamento por post
- [ ] Melhor horário para postar
- [ ] Crescimento de seguidores ao longo do tempo
- [ ] Relatório exportável (PDF/CSV)
