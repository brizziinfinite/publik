"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WizardProgress } from "@/components/brands/wizard/WizardProgress";
import type { Brand, BrandPlan } from "@/types/database";

// Steps importados depois de criados
// import { StepIdentidade } from "@/components/brands/wizard/StepIdentidade";
// import { StepVoz } from "@/components/brands/wizard/StepVoz";
// import { StepOferta } from "@/components/brands/wizard/StepOferta";
// import { StepPlano } from "@/components/brands/wizard/StepPlano";

type Step = 1 | 2 | 3 | 4;

export interface WizardState {
  // Step 1 — Identidade
  name: string;
  slug: string;
  primary_color: string;
  logo_url: string | null;
  niche: string;
  segment: string;
  visual_kit_id: string | null;
  // Step 2 — Voz
  tone: string;
  target_persona: string;
  pillars: { name: string; description: string; weight: number }[];
  forbidden_topics: string[];
  // Step 3 — Oferta
  main_offer: string;
  main_cta: string;
  pricing_anchor_phrases: string;       // textarea — uma por linha
  pricing_price_brl: string;            // string pois é input, parse no submit
  content_formats_priority: string;     // textarea — uma por linha
  hashtags_core: string;                // textarea — uma por linha
  // Step 4 — Plano
  goal_primary: string;
  current_phase: string;
  current_blocker: string;
  timeline_days: string;                // string pois é input
  weekly_priority_1: string;
  weekly_priority_2: string;
  weekly_priority_3: string;
  weekly_priority_4: string;
}

function brandToState(brand: Brand, plan: BrandPlan | null): WizardState {
  const pricing = (plan?.pricing as Record<string, unknown>) ?? {};
  const assets = (plan?.brand_assets as Record<string, unknown>) ?? {};
  const prio = (plan?.weekly_priorities as string[]) ?? [];

  return {
    name: brand.name ?? "",
    slug: brand.slug ?? "",
    primary_color: brand.primary_color ?? "#000000",
    logo_url: brand.logo_url ?? null,
    niche: brand.niche ?? "",
    segment: (brand.segment as string) ?? "",
    visual_kit_id: brand.visual_kit_id ?? null,
    tone: brand.tone ?? "",
    target_persona: brand.target_persona ?? "",
    pillars: Array.isArray(brand.pillars)
      ? (brand.pillars as { name: string; description: string; weight: number }[])
      : [],
    forbidden_topics: brand.forbidden_topics ?? [],
    main_offer: plan?.main_offer ?? "",
    main_cta: plan?.main_cta ?? "",
    pricing_anchor_phrases: Array.isArray(pricing.anchor_phrases)
      ? (pricing.anchor_phrases as string[]).join("\n")
      : "",
    pricing_price_brl: pricing.price_brl_per_hectare_month != null
      ? String(pricing.price_brl_per_hectare_month)
      : "",
    content_formats_priority: Array.isArray(assets.content_formats_priority)
      ? (assets.content_formats_priority as string[]).join("\n")
      : "",
    hashtags_core: Array.isArray(assets.hashtags_core)
      ? (assets.hashtags_core as string[]).join("\n")
      : "",
    goal_primary: plan?.goal_primary ?? "",
    current_phase: plan?.current_phase ?? "validate_message",
    current_blocker: plan?.current_blocker ?? "",
    timeline_days: plan?.timeline_days != null ? String(plan.timeline_days) : "90",
    weekly_priority_1: prio[0] ?? "",
    weekly_priority_2: prio[1] ?? "",
    weekly_priority_3: prio[2] ?? "",
    weekly_priority_4: prio[3] ?? "",
  };
}

export default function BrandSetupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [state, setState] = useState<WizardState | null>(null);
  const [brandName, setBrandName] = useState("");

  useEffect(() => {
    fetch(`/api/brands/${id}/setup`)
      .then((r) => r.json())
      .then(({ brand, plan }: { brand: Brand; plan: BrandPlan | null }) => {
        setState(brandToState(brand, plan));
        setBrandName(brand.name);
        setLoading(false);
      })
      .catch(() => {
        setError("Erro ao carregar dados da brand.");
        setLoading(false);
      });
  }, [id]);

  async function saveStep(step: Step, partial: Partial<WizardState>) {
    setSaving(true);
    setError(null);

    // Monta payload específico por step para a API
    const payload = buildPayload(step, partial);

    const res = await fetch(`/api/brands/${id}/setup`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Erro ao salvar. Tente novamente.");
      return false;
    }
    return true;
  }

  async function handleNext(partial: Partial<WizardState>) {
    // Merge estado local
    setState((prev) => prev ? { ...prev, ...partial } : prev);

    const ok = await saveStep(currentStep, { ...state, ...partial });
    if (!ok) return;

    if (currentStep < 4) {
      setCurrentStep((s) => (s + 1) as Step);
    } else {
      // Wizard completo — volta pra lista de brands
      router.push("/dashboard/brands");
    }
  }

  function handleBack() {
    if (currentStep > 1) setCurrentStep((s) => (s - 1) as Step);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
        Carregando...
      </div>
    );
  }

  if (error && !state) {
    return (
      <div className="flex h-64 items-center justify-center text-destructive text-sm">
        {error}
      </div>
    );
  }

  if (!state) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/brands")}
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Configurar brand</h1>
          <p className="text-sm text-muted-foreground">{brandName}</p>
        </div>
      </div>

      {/* Progress */}
      <WizardProgress currentStep={currentStep} />

      {/* Erro de save */}
      {error && (
        <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Steps — substituir por componentes reais conforme forem criados */}
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground text-sm">
          Step {currentStep} — em construção
        </p>
      </div>

      {/* Navegação (placeholder — cada step vai ter os seus botões) */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          Voltar
        </Button>
        <Button
          onClick={() => handleNext(state)}
          disabled={saving}
        >
          {saving ? "Salvando..." : currentStep === 4 ? "Concluir" : "Próximo"}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// buildPayload — converte WizardState para o formato esperado pela API
// ---------------------------------------------------------------------------

function buildPayload(step: Step, s: Partial<WizardState>) {
  if (step === 1) {
    return {
      step: 1,
      name: s.name,
      slug: s.slug,
      primary_color: s.primary_color || null,
      logo_url: s.logo_url || null,
      niche: s.niche || null,
      segment: s.segment || null,
      visual_kit_id: s.visual_kit_id || null,
    };
  }

  if (step === 2) {
    return {
      step: 2,
      tone: s.tone || null,
      target_persona: s.target_persona || null,
      pillars: s.pillars ?? [],
      forbidden_topics: s.forbidden_topics ?? [],
    };
  }

  if (step === 3) {
    const anchor_phrases = s.pricing_anchor_phrases
      ? s.pricing_anchor_phrases.split("\n").map((l) => l.trim()).filter(Boolean)
      : [];
    const price_brl = s.pricing_price_brl ? parseFloat(s.pricing_price_brl) : null;
    const formats = s.content_formats_priority
      ? s.content_formats_priority.split("\n").map((l) => l.trim()).filter(Boolean)
      : [];
    const hashtags = s.hashtags_core
      ? s.hashtags_core.split("\n").map((l) => l.trim()).filter(Boolean)
      : [];

    return {
      step: 3,
      main_offer: s.main_offer || null,
      main_cta: s.main_cta || null,
      pricing: { anchor_phrases, price_brl_per_hectare_month: price_brl },
      brand_assets: { content_formats_priority: formats, hashtags_core: hashtags },
    };
  }

  // step 4
  return {
    step: 4,
    goal_primary: s.goal_primary || null,
    current_phase: s.current_phase || "validate_message",
    current_blocker: s.current_blocker || null,
    timeline_days: s.timeline_days ? parseInt(s.timeline_days, 10) : 90,
    weekly_priorities: [
      s.weekly_priority_1 ?? "",
      s.weekly_priority_2 ?? "",
      s.weekly_priority_3 ?? "",
      s.weekly_priority_4 ?? "",
    ].filter(Boolean),
  };
}
