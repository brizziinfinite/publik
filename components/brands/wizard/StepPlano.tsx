"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WizardState } from "@/app/(dashboard)/dashboard/brands/[id]/setup/page";

interface Props {
  state: WizardState;
  saving: boolean;
  missingFields: string[];
  onChange: (partial: Partial<WizardState>) => void;
  onNext: (partial: Partial<WizardState>) => void;
  onBack: () => void;
}

const PHASES = [
  {
    value: "validate_message",
    label: "Validar mensagem",
    description: "Testar narrativas e descobrir qual ressoa com o público",
  },
  {
    value: "validate_offer",
    label: "Validar oferta",
    description: "Confirmar que a oferta converte com clientes reais",
  },
  {
    value: "predictable_sales",
    label: "Vendas previsíveis",
    description: "Processo de venda repetível e mensurável",
  },
  {
    value: "scale_acquisition",
    label: "Escalar aquisição",
    description: "Crescimento acelerado com funil validado",
  },
] as const;

export function canAdvancePlano(s: WizardState): boolean {
  return (
    s.goal_primary.trim().length > 0 &&
    s.current_phase.trim().length > 0 &&
    s.main_cta.trim().length > 0
  );
}

export function StepPlano({ state, saving, missingFields, onChange, onNext, onBack }: Props) {
  const canAdvance = missingFields.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Plano estratégico</h2>
        <p className="text-sm text-muted-foreground">
          Objetivos, fase atual e prioridades semanais que o Agente 1 usa para gerar ideias relevantes.
        </p>
      </div>

      <div className="space-y-5">
        {/* Objetivo principal */}
        <div className="space-y-1.5">
          <Label htmlFor="goal-primary">
            Objetivo principal <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="goal-primary"
            value={state.goal_primary}
            onChange={(e) => onChange({ goal_primary: e.target.value })}
            placeholder="Ex: Gerar 20 leads qualificados por mês via Instagram nos próximos 90 dias."
            rows={2}
          />
        </div>

        {/* Fase atual */}
        <div className="space-y-1.5">
          <Label>Fase atual</Label>
          <Select
            value={state.current_phase}
            onValueChange={(v) => onChange({ current_phase: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PHASES.map((phase) => (
                <SelectItem key={phase.value} value={phase.value}>
                  <span className="font-medium">{phase.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    — {phase.description}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bloqueio atual */}
        <div className="space-y-1.5">
          <Label htmlFor="current-blocker">Principal bloqueio</Label>
          <Textarea
            id="current-blocker"
            value={state.current_blocker}
            onChange={(e) => onChange({ current_blocker: e.target.value })}
            placeholder="Ex: Produtores conhecem o produto mas não entendem o ROI. Precisamos de mais cases reais."
            rows={2}
          />
        </div>

        {/* Prazo */}
        <div className="space-y-1.5">
          <Label htmlFor="timeline-days">Prazo (dias)</Label>
          <Input
            id="timeline-days"
            type="number"
            min={1}
            max={365}
            value={state.timeline_days}
            onChange={(e) => onChange({ timeline_days: e.target.value })}
            className="w-32"
          />
        </div>

        {/* Prioridades semanais */}
        <div className="space-y-2">
          <Label>Prioridades semanais</Label>
          <p className="text-xs text-muted-foreground">
            4 focos para a semana atual — o agente prioriza ideias alinhadas a eles.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(
              [
                "weekly_priority_1",
                "weekly_priority_2",
                "weekly_priority_3",
                "weekly_priority_4",
              ] as const
            ).map((key, i) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Prioridade {i + 1}
                </Label>
                <Input
                  value={state[key]}
                  onChange={(e) => onChange({ [key]: e.target.value })}
                  placeholder={`Ex: ${
                    ["Lançar case Fazenda São João", "Gravar 2 reels de prova social", "Responder DMs de leads", "Publicar comparativo técnico"][i]
                  }`}
                />
              </div>
            ))}
          </div>
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
            {saving ? "Salvando..." : "Concluir"}
          </Button>
        </div>
      </div>
    </div>
  );
}
