"use client";

import { useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
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

export function canAdvanceVoz(s: WizardState): boolean {
  return (
    s.tone.trim().length > 0 &&
    s.target_persona.trim().length > 0 &&
    s.pillars.length > 0 &&
    s.pillars.some((p) => p.name.trim().length > 0)
  );
}

export function StepVoz({ state, saving, missingFields, onChange, onNext, onBack }: Props) {
  const topicInputRef = useRef<HTMLInputElement>(null);

  function addPillar() {
    if (state.pillars.length >= 5) return;
    onChange({
      pillars: [
        ...state.pillars,
        { name: "", description: "", weight: 5 },
      ],
    });
  }

  function removePillar(index: number) {
    onChange({
      pillars: state.pillars.filter((_, i) => i !== index),
    });
  }

  function updatePillar(
    index: number,
    field: keyof (typeof state.pillars)[number],
    value: string | number
  ) {
    const updated = state.pillars.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    onChange({ pillars: updated });
  }

  function addTopic(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const val = (e.currentTarget.value ?? "").trim();
    if (!val || state.forbidden_topics.includes(val)) return;
    onChange({ forbidden_topics: [...state.forbidden_topics, val] });
    e.currentTarget.value = "";
  }

  function removeTopic(topic: string) {
    onChange({
      forbidden_topics: state.forbidden_topics.filter((t) => t !== topic),
    });
  }

  const canAdvance = missingFields.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Voz da brand</h2>
        <p className="text-sm text-muted-foreground">
          Tom, persona e pilares de conteúdo que guiam toda comunicação.
        </p>
      </div>

      <div className="space-y-5">
        {/* Tom de voz */}
        <div className="space-y-1.5">
          <Label htmlFor="brand-tone">
            Tom de voz <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="brand-tone"
            value={state.tone}
            onChange={(e) => onChange({ tone: e.target.value })}
            placeholder="Ex: Técnico mas acessível, direto ao ponto, focado em resultados práticos para o produtor rural."
            rows={3}
          />
        </div>

        {/* Persona-alvo */}
        <div className="space-y-1.5">
          <Label htmlFor="brand-persona">Persona-alvo</Label>
          <Textarea
            id="brand-persona"
            value={state.target_persona}
            onChange={(e) => onChange({ target_persona: e.target.value })}
            placeholder="Ex: Produtor rural com 50-200 hectares, já usa tecnologia básica, quer reduzir custo de água."
            rows={3}
          />
        </div>

        {/* Pilares */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Pilares de conteúdo (máx. 5)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPillar}
              disabled={state.pillars.length >= 5}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Adicionar
            </Button>
          </div>

          {state.pillars.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Nenhum pilar adicionado.
            </p>
          )}

          <div className="space-y-3">
            {state.pillars.map((pillar, i) => (
              <div
                key={i}
                className="rounded-lg border bg-muted/30 p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-6">
                    #{i + 1}
                  </span>
                  <Input
                    value={pillar.name}
                    onChange={(e) => updatePillar(i, "name", e.target.value)}
                    placeholder="Nome do pilar (ex: Educação Técnica)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePillar(i)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={pillar.description}
                  onChange={(e) =>
                    updatePillar(i, "description", e.target.value)
                  }
                  placeholder="Descrição breve"
                />
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground shrink-0">
                    Peso ({pillar.weight})
                  </Label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={pillar.weight}
                    onChange={(e) =>
                      updatePillar(i, "weight", parseInt(e.target.value, 10))
                    }
                    className="flex-1 accent-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tópicos proibidos */}
        <div className="space-y-1.5">
          <Label htmlFor="brand-topics">Tópicos proibidos</Label>
          <Input
            ref={topicInputRef}
            id="brand-topics"
            onKeyDown={addTopic}
            placeholder='Digite e pressione Enter ou vírgula para adicionar'
          />
          {state.forbidden_topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {state.forbidden_topics.map((topic) => (
                <Badge
                  key={topic}
                  variant="secondary"
                  className="cursor-pointer gap-1 pr-1"
                  onClick={() => removeTopic(topic)}
                >
                  {topic}
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
