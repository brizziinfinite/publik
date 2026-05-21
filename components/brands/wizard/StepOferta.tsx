"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { WizardState } from "@/app/(dashboard)/dashboard/brands/[id]/setup/page";

interface Props {
  state: WizardState;
  saving: boolean;
  missingFields: string[];
  onChange: (partial: Partial<WizardState>) => void;
  onNext: (partial: Partial<WizardState>) => void;
  onBack: () => void;
}

const FORMAT_OPTIONS = [
  { value: "carrossel", label: "Carrossel" },
  { value: "reel", label: "Reel / Vídeo curto" },
  { value: "post_estatico", label: "Post estático" },
  { value: "story", label: "Story" },
  { value: "live", label: "Live" },
  { value: "blog", label: "Blog / Artigo" },
  { value: "email", label: "Email marketing" },
] as const;

export function canAdvanceOferta(s: WizardState): boolean {
  return s.main_offer.trim().length > 0 && s.main_cta.trim().length > 0;
}

export function StepOferta({ state, saving, missingFields, onChange, onNext, onBack }: Props) {
  const hashtagInputRef = useRef<HTMLInputElement>(null);

  function toggleFormat(value: string) {
    const current = state.content_formats_priority;
    const next = current.includes(value)
      ? current.filter((f) => f !== value)
      : [...current, value];
    onChange({ content_formats_priority: next });
  }

  function addHashtag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const raw = e.currentTarget.value.trim();
    if (!raw) return;
    // Normaliza: garante # no início
    const tag = raw.startsWith("#") ? raw : `#${raw}`;
    if (state.hashtags_core.includes(tag)) {
      e.currentTarget.value = "";
      return;
    }
    onChange({ hashtags_core: [...state.hashtags_core, tag] });
    e.currentTarget.value = "";
  }

  function removeHashtag(tag: string) {
    onChange({ hashtags_core: state.hashtags_core.filter((t) => t !== tag) });
  }

  const canAdvance = missingFields.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Oferta e ativos</h2>
        <p className="text-sm text-muted-foreground">
          O que você vende, como comunica valor e quais formatos prioriza.
        </p>
      </div>

      <div className="space-y-5">
        {/* Oferta principal */}
        <div className="space-y-1.5">
          <Label htmlFor="main-offer">
            Oferta principal <span className="text-destructive">*</span>
          </Label>
          <Input
            id="main-offer"
            value={state.main_offer}
            onChange={(e) => onChange({ main_offer: e.target.value })}
            placeholder="Ex: Sistema de irrigação automatizado por R$ 89/ha/mês"
          />
        </div>

        {/* CTA principal */}
        <div className="space-y-1.5">
          <Label htmlFor="main-cta">
            CTA principal <span className="text-destructive">*</span>
          </Label>
          <Input
            id="main-cta"
            value={state.main_cta}
            onChange={(e) => onChange({ main_cta: e.target.value })}
            placeholder='Ex: "Fale com um especialista" ou "Peça um orçamento"'
          />
        </div>

        {/* Frases âncora de preço */}
        <div className="space-y-1.5">
          <Label htmlFor="anchor-phrases">Frases âncora de preço</Label>
          <Textarea
            id="anchor-phrases"
            value={state.pricing_anchor_phrases}
            onChange={(e) => onChange({ pricing_anchor_phrases: e.target.value })}
            placeholder={"Por menos de R$ 3 por dia\nMenos que um café por semana\nPaga em uma safra"}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Uma frase por linha. O agente usa para ancorar o valor nas copies.
          </p>
        </div>

        {/* Preço por hectare */}
        <div className="space-y-1.5">
          <Label htmlFor="price-brl">Preço (R$/ha/mês)</Label>
          <Input
            id="price-brl"
            type="number"
            min={0}
            step={0.01}
            value={state.pricing_price_brl}
            onChange={(e) => onChange({ pricing_price_brl: e.target.value })}
            placeholder="89.90"
            className="w-48"
          />
        </div>

        {/* Formatos prioritários — checkboxes */}
        <div className="space-y-2">
          <Label>Formatos de conteúdo</Label>
          <p className="text-xs text-muted-foreground">
            Selecione os formatos que a brand usa. A ordem de seleção define prioridade.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {FORMAT_OPTIONS.map(({ value, label }) => {
              const checked = state.content_formats_priority.includes(value);
              const rank = state.content_formats_priority.indexOf(value) + 1;
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors ${
                    checked
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFormat(value)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold ${
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {checked ? rank : ""}
                  </span>
                  <span className="text-sm">{label}</span>
                </label>
              );
            })}
          </div>
          {state.content_formats_priority.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Ordem: {state.content_formats_priority.join(" → ")}
            </p>
          )}
        </div>

        {/* Hashtags core — chips */}
        <div className="space-y-1.5">
          <Label htmlFor="hashtags">Hashtags principais</Label>
          <Input
            ref={hashtagInputRef}
            id="hashtags"
            onKeyDown={addHashtag}
            placeholder='Digite e pressione Enter ou vírgula para adicionar'
          />
          {state.hashtags_core.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {state.hashtags_core.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer gap-1 pr-1"
                  onClick={() => removeHashtag(tag)}
                >
                  {tag}
                  <span className="text-muted-foreground text-xs">×</span>
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Clique no chip para remover.
          </p>
        </div>
      </div>

      {/* Navegação */}
      <div className="space-y-2">
        {missingFields.length > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Preencha: {missingFields.join(", ")}
          </p>
        )}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <Button onClick={() => onNext(state)} disabled={!canAdvance || saving}>
            {saving ? "Salvando..." : "Próximo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
