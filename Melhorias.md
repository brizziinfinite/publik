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
- [ ] Integrações com redes sociais (Instagram, TikTok, etc.)
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

- [ ] Instagram (Graph API)
- [ ] TikTok
- [ ] Facebook / Meta
- [ ] Twitter / X
- [ ] LinkedIn
- [x] Fila de publicação via Edge Functions (cron — pg_cron a cada minuto)

---

## 🚀 Infra / Deploy

- [ ] Deploy na Vercel
- [ ] Variáveis de ambiente configuradas em produção
- [ ] Domínio customizado
- [x] Edge Functions para publicação agendada (publish-scheduled-posts)
- [ ] Monitoramento de erros (Sentry ou similar)

---

## 📊 Analytics (futuro)

- [ ] Taxa de engajamento por post
- [ ] Melhor horário para postar
- [ ] Crescimento de seguidores ao longo do tempo
- [ ] Relatório exportável (PDF/CSV)
