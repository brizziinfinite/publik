-- ============================================================================
-- Migration: 20260518000002_seed_irrigaagro
-- Seed: Brand IrrigaAgro + Plano Base
-- PRÉ-REQUISITO: A brand "IrrigaAgro" deve existir em public.brands
-- ============================================================================

do $$
declare
  v_brand_id uuid;
  v_user_id  uuid;
begin

  -- Verificar se a brand IrrigaAgro existe
  select id, user_id into v_brand_id, v_user_id
  from public.brands
  where lower(name) = 'irrigaagro'
  limit 1;

  if v_brand_id is null then
    raise exception
      'Brand "IrrigaAgro" não encontrada em public.brands. '
      'Crie a brand pelo painel em /dashboard/brands antes de rodar este seed.';
  end if;

  -- 1. UPDATE da brand IrrigaAgro
  update public.brands set
    niche = 'SaaS de monitoramento para pivôs centrais — médio produtor (100-500ha)',

    tone = 'Técnico-acessível: falo como um agrônomo que cresceu na fazenda, não como um vendedor de tech. '
           'Linguagem direta, sem rodeios. Frases curtas. Zero buzzword. '
           'Gírias de roça permitidas com parcimônia (ex: "isso não pega", "vai de vez"). '
           'Palavras PROIBIDAS: revolucionário, disruptivo, ecossistema, sinergia, jornada, '
           'empoderar, otimizar (no sentido vago), transformar, inovar, solução. '
           'Tom: como um colega produtor que achou algo que funciona e quer mostrar pros outros. '
           'Nunca superiority complex. Nunca medo como gatilho primário. '
           'Provocação intelectual > urgência artificial.',

    target_persona = 'PRIMÁRIO: Produtor de médio porte (100-500ha), 35-55 anos, '
                     'tem 1-3 pivôs centrais, sofre com custo de energia e quebras inesperadas, '
                     'não é tech-nativo mas usa WhatsApp e YouTube, '
                     'já perdeu lavoura por falha de pivô e sente que o problema é "inevitável", '
                     'toma decisão baseado em referência de outros produtores ou agrônomo de confiança. '
                     'SECUNDÁRIO: Técnico agrícola ou consultor que assessora fazendas com pivô, '
                     'quer recomendar algo concreto pros clientes, preocupado com reputação.',

    pillars = '[
      {
        "id": "prejuizo",
        "name": "Dor do Prejuízo",
        "description": "Posts sobre custo real de uma falha não detectada: energia desperdiçada, lavoura perdida, técnico de emergência, horas parado. Dados concretos, não drama.",
        "weight": 0.25
      },
      {
        "id": "operador",
        "name": "Vida do Operador",
        "description": "A rotina real do operador de pivô: o que ele faz hoje sem monitoramento, o que vira trabalho braçal desnecessário, o que acontece quando ele não está. Empatia sem condescendência.",
        "weight": 0.20
      },
      {
        "id": "diagnostico",
        "name": "Diagnóstico Técnico",
        "description": "Como funciona monitoramento de pivô: sensores, telemetria, alertas. Educacional, não técnico demais. Objetivo: o produtor entender o que está comprando.",
        "weight": 0.25
      },
      {
        "id": "case",
        "name": "Case / Prova Social",
        "description": "Resultados reais: horas de parada evitadas, consumo de energia normalizado, falha detectada antes de quebrar. Quando não tivermos cases reais, usar cenários realistas com dados de mercado.",
        "weight": 0.15
      },
      {
        "id": "provocacao",
        "name": "Provocação Intelectual",
        "description": "Perguntas que fazem o produtor pensar diferente sobre o problema. Não vende diretamente — gera reflexão e engajamento orgânico.",
        "weight": 0.15
      }
    ]'::jsonb,

    forbidden_topics = ARRAY[
      'política',
      'religião',
      'comparação nominal com concorrentes Valley/Lindsay/Bauer/Fockink/Krebs',
      'hype tech sem evidência (IA, blockchain, IoT como buzzword)',
      'promessas de resultado garantido',
      'preço sem contexto de valor'
    ],

    is_active = true
  where id = v_brand_id;

  -- 2. Desativar planos anteriores se houver
  update public.brand_plans
  set is_active = false
  where brand_id = v_brand_id and is_active = true;

  -- 3. INSERT do Plano Base
  insert into public.brand_plans (
    brand_id,
    user_id,
    goal_primary,
    goal_metric,
    goal_target_value,
    goal_current_value,
    support_metrics,
    timeline_days,
    started_at,
    current_phase,
    current_blocker,
    brand_assets,
    weekly_priorities,
    pricing,
    main_offer,
    main_cta,
    is_active
  ) values (
    v_brand_id,
    v_user_id,

    '3 primeiros clientes pagantes do IrrigaAgro para validar oferta de monitoramento de pivô central',

    'clientes pagantes',
    3,
    0,

    '[
      {"metric": "seguidores_instagram", "target": 500, "current": 0},
      {"metric": "leads_capturados", "target": 30, "current": 0},
      {"metric": "demos_agendadas", "target": 10, "current": 0},
      {"metric": "posts_publicados", "target": 36, "current": 0}
    ]'::jsonb,

    90,
    current_date,
    'validate_message',

    'Zero presença digital, zero audiência, zero prova social. '
    'O produto existe mas ninguém sabe. O maior risco é gastar 90 dias '
    'construindo audiência e descobrir que a mensagem não converte. '
    'Precisamos validar se o produtor de 100-500ha sente a dor de monitoramento '
    'de pivô como prioridade de compra AGORA, não "seria legal ter".',

    '{
      "instagram_handle": "@irrigaagro",
      "website": "https://irrigaagro.com.br",
      "logo_style": "verde agro + azul água, clean, sem rodeios",
      "content_formats_priority": ["carrossel", "reel", "post"],
      "hashtags_core": ["#pivôcentral", "#irrigação", "#agtech", "#monitoramento", "#fazenda"]
    }'::jsonb,

    '[
      {"week_range": "1-2",  "focus": "Estabelecer voz da marca. 6 posts de pilares prejuizo e operador. Meta: primeiros 50 seguidores orgânicos."},
      {"week_range": "3-4",  "focus": "Conteúdo de diagnóstico técnico. 6 posts. Começar lista de espera com link na bio."},
      {"week_range": "5-6",  "focus": "Primeiro conteúdo de case/prova social (cenário realista com dados de mercado). Engajar comentários manualmente."},
      {"week_range": "7-8",  "focus": "Provocações. Testar CTAs diretos: ''quer ver como funciona no seu pivô?'' DM aberto."},
      {"week_range": "9-10", "focus": "Agendar 5 demos com produtores interessados. Coletar feedback de produto."},
      {"week_range": "11-13","focus": "Converter demos em clientes pagantes. Oferta de early-adopter com desconto de lançamento."}
    ]'::jsonb,

    '{
      "price_brl_per_hectare_year": 45,
      "price_brl_per_hectare_month": 3.75,
      "billing_default": "monthly_credit_card",
      "payment_processor": "asaas",
      "free_trial_days": 14,
      "anchor_phrases": [
        "R$ 3,75/ha/mês — menos que um litro de diesel por hectare",
        "Para um pivô de 100ha: R$ 375/mês. Uma hora de técnico de emergência custa mais.",
        "14 dias grátis, sem cartão, cancela quando quiser",
        "Se uma parada não detectada custa R$ 2.000 em técnico + perda de lavoura, o sistema se paga em 5x"
      ],
      "objection_handlers": {
        "caro": "Compare com o custo de uma visita técnica de emergência. Ou com a perda de produção quando o pivô para por 12h sem avisar.",
        "nao_sei_usar_tecnologia": "Se você usa WhatsApp, você usa o IrrigaAgro. O alerta chega no celular. Sem painel complicado.",
        "ja_tenho_operador": "O operador não dorme. O sistema sim. Falhas acontecem às 3h da manhã.",
        "vou_pensar": "Temos trial de 14 dias. Instala, testa no seu pivô real, decide depois."
      }
    }'::jsonb,

    'Monitoramento de pivô central em tempo real — alertas de falha no WhatsApp antes que vire prejuízo. '
    'Trial de 14 dias grátis, sem burocracia, cancela quando quiser.',

    'Teste 14 dias grátis no seu pivô → irrigaagro.com.br/trial',

    true
  );

  raise notice 'Seed IrrigaAgro concluído. brand_id: %, user_id: %', v_brand_id, v_user_id;

end $$;
