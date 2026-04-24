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
- [ ] Seletor de brand ativo na Sidebar (contexto global via Zustand)

---

## 📝 Posts

- [ ] Listagem de posts com filtros (status, brand, data)
- [ ] Formulário de criação de post (conteúdo, mídia, plataforma, data agendada)
- [ ] Upload de mídia (imagens/vídeos) para Supabase Storage
- [ ] Preview do post antes de publicar
- [ ] Edição de post existente
- [ ] Exclusão de post (com confirmação)
- [ ] Status de post: Rascunho / Agendado / Publicado / Falhado
- [ ] Publicação manual imediata
- [ ] Agendamento de publicação com data/hora

---

## 📅 Calendário

- [ ] Visualização mensal dos posts agendados
- [ ] Drag & drop para reagendar posts
- [ ] Clique no post para ver detalhes/editar
- [ ] Filtro por brand no calendário
- [ ] Indicador visual de status (cor por status)

---

## 🔐 Autenticação

- [ ] Proteção real de rotas (middleware com Supabase)
- [ ] Logout funcionando
- [ ] Página de perfil do usuário
- [ ] Atualização de nome e avatar
- [ ] Troca de senha
- [ ] Reset de senha por email

---

## ⚙️ Configurações

- [ ] Configurações gerais da conta
- [ ] Gerenciamento de plano/assinatura (futuro)
- [ ] Notificações por email
- [ ] Integrações com redes sociais (Instagram, TikTok, etc.)
- [ ] Tokens de API / webhooks

---

## 🎨 UI / UX

- [x] Toast notifications (sucesso, erro, aviso)
- [x] Loading skeletons nas listagens
- [ ] Empty states com CTAs em todas as páginas
- [ ] Sidebar colapsável no mobile (Sheet)
- [ ] Responsividade completa (mobile-first)
- [ ] Animações de transição entre páginas
- [ ] Dark/Light mode toggle
- [ ] Favicon e meta tags (OG image)

---

## 🔗 Integrações

- [ ] Instagram (Graph API)
- [ ] TikTok
- [ ] Facebook / Meta
- [ ] Twitter / X
- [ ] LinkedIn
- [ ] Fila de publicação via Edge Functions (cron)

---

## 🚀 Infra / Deploy

- [ ] Deploy na Vercel
- [ ] Variáveis de ambiente configuradas em produção
- [ ] Domínio customizado
- [ ] Edge Functions para publicação agendada
- [ ] Monitoramento de erros (Sentry ou similar)

---

## 📊 Analytics (futuro)

- [ ] Taxa de engajamento por post
- [ ] Melhor horário para postar
- [ ] Crescimento de seguidores ao longo do tempo
- [ ] Relatório exportável (PDF/CSV)
