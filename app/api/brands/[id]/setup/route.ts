import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Schemas por step — validação incremental (save parcial)
// ---------------------------------------------------------------------------

const PillarSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  weight: z.number().min(1).max(10).default(5),
})

const StepIdentidadeSchema = z.object({
  step: z.literal(1),
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug: apenas letras minúsculas, números e hífens').optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  niche: z.string().optional().nullable(),
  segment: z.enum(['b2b', 'b2c', 'ambos']).optional().nullable(),
  visual_kit_id: z.string().optional().nullable(),
})

const StepVozSchema = z.object({
  step: z.literal(2),
  tone: z.string().optional().nullable(),
  target_persona: z.string().optional().nullable(),
  pillars: z.array(PillarSchema).max(5).optional(),
  forbidden_topics: z.array(z.string()).optional(),
})

const StepOfertaSchema = z.object({
  step: z.literal(3),
  // brand_plans fields
  main_offer: z.string().optional().nullable(),
  main_cta: z.string().optional().nullable(),
  pricing: z.object({
    anchor_phrases: z.array(z.string()).optional(),
    price_brl_per_hectare_month: z.number().optional().nullable(),
    notes: z.string().optional().nullable(),
  }).optional(),
  brand_assets: z.object({
    content_formats_priority: z.array(z.string()).optional(),
    hashtags_core: z.array(z.string()).optional(),
  }).optional(),
})

const StepPlanoSchema = z.object({
  step: z.literal(4),
  // brand_plans fields
  goal_primary: z.string().optional().nullable(),
  current_phase: z.enum([
    'validate_message',
    'validate_offer',
    'predictable_sales',
    'scale_acquisition',
  ]).optional(),
  current_blocker: z.string().optional().nullable(),
  timeline_days: z.number().int().positive().optional(),
  weekly_priorities: z.array(z.string()).max(4).optional(),
})

const SetupBodySchema = z.discriminatedUnion('step', [
  StepIdentidadeSchema,
  StepVozSchema,
  StepOfertaSchema,
  StepPlanoSchema,
])

// ---------------------------------------------------------------------------
// GET — carrega estado salvo (brand + brand_plan ativo)
// ---------------------------------------------------------------------------

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'não autenticado' }, { status: 401 })

  const { data: brand, error: brandErr } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (brandErr || !brand) {
    return NextResponse.json({ error: 'brand não encontrada' }, { status: 404 })
  }

  const { data: plan } = await supabase
    .from('brand_plans')
    .select('*')
    .eq('brand_id', id)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ brand, plan: plan ?? null })
}

// ---------------------------------------------------------------------------
// PATCH — save parcial por step
// ---------------------------------------------------------------------------

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'não autenticado' }, { status: 401 })

  // Verifica ownership
  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!brand) return NextResponse.json({ error: 'brand não encontrada' }, { status: 404 })

  // Parse + validação
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'body inválido' }, { status: 400 })

  const parsed = SetupBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const data = parsed.data

  // ---------------------------------------------------------------------------
  // Step 1 — Identidade → atualiza brands
  // ---------------------------------------------------------------------------
  if (data.step === 1) {
    const { step: _, ...fields } = data
    const { error } = await supabase
      .from('brands')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, step: 1 })
  }

  // ---------------------------------------------------------------------------
  // Step 2 — Voz → atualiza brands
  // ---------------------------------------------------------------------------
  if (data.step === 2) {
    const { step: _, ...fields } = data
    const { error } = await supabase
      .from('brands')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, step: 2 })
  }

  // ---------------------------------------------------------------------------
  // Steps 3 e 4 — Oferta e Plano → upsert brand_plans
  // Para steps 3/4 buscamos o plano ativo existente (ou criamos um novo)
  // ---------------------------------------------------------------------------

  const { data: existingPlan } = await supabase
    .from('brand_plans')
    .select('id, pricing, brand_assets, weekly_priorities')
    .eq('brand_id', id)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (data.step === 3) {
    const { step: _, pricing, brand_assets, ...rest } = data

    // Merge com JSONB existentes (não sobrescreve chaves não enviadas)
    const currentPricing = (existingPlan?.pricing as Record<string, unknown>) ?? {}
    const currentAssets = (existingPlan?.brand_assets as Record<string, unknown>) ?? {}

    const mergedPricing = pricing ? { ...currentPricing, ...pricing } : currentPricing
    const mergedAssets = brand_assets ? { ...currentAssets, ...brand_assets } : currentAssets

    const planFields = {
      ...rest,
      pricing: mergedPricing,
      brand_assets: mergedAssets,
    }

    const { error } = await upsertPlan(supabase, id, user.id, existingPlan?.id ?? null, planFields)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, step: 3 })
  }

  if (data.step === 4) {
    const { step: _, weekly_priorities, ...rest } = data

    // weekly_priorities: array de strings → JSONB[]
    const planFields = {
      ...rest,
      weekly_priorities: weekly_priorities ?? existingPlan?.weekly_priorities ?? [],
    }

    const { error } = await upsertPlan(supabase, id, user.id, existingPlan?.id ?? null, planFields)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, step: 4 })
  }

  return NextResponse.json({ error: 'step inválido' }, { status: 400 })
}

// ---------------------------------------------------------------------------
// Helper: upsert brand_plans
// Se plan_id existe → UPDATE. Se não → INSERT com defaults mínimos.
// ---------------------------------------------------------------------------

async function upsertPlan(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  brand_id: string,
  user_id: string,
  plan_id: string | null,
  fields: Record<string, unknown>
) {
  if (plan_id) {
    return supabase
      .from('brand_plans')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', plan_id)
  }

  // INSERT com campos obrigatórios em valores mínimos (wizard completa depois)
  return supabase
    .from('brand_plans')
    .insert({
      brand_id,
      user_id,
      goal_primary: (fields.goal_primary as string) ?? '',
      goal_metric: 'receita_mensal_brl',
      goal_target_value: 0,
      timeline_days: (fields.timeline_days as number) ?? 90,
      current_phase: (fields.current_phase as string) ?? 'validate_message',
      is_active: true,
      ...fields,
    })
}
