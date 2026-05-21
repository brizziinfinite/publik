"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { number: 1, label: "Identidade" },
  { number: 2, label: "Voz" },
  { number: 3, label: "Oferta" },
  { number: 4, label: "Plano" },
] as const;

interface WizardProgressProps {
  currentStep: 1 | 2 | 3 | 4;
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <nav aria-label="Progresso do wizard" className="w-full">
      <ol className="flex items-center">
        {STEPS.map((step, index) => {
          const done = step.number < currentStep;
          const active = step.number === currentStep;
          const isLast = index === STEPS.length - 1;

          return (
            <li key={step.number} className={cn("flex items-center", !isLast && "flex-1")}>
              {/* Círculo */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary bg-background text-primary",
                    !done && !active && "border-muted-foreground/30 bg-background text-muted-foreground"
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <span
                  className={cn(
                    "mt-1 hidden text-xs font-medium sm:block",
                    active && "text-primary",
                    done && "text-primary",
                    !done && !active && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Linha conectora */}
              {!isLast && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 transition-colors",
                    done ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
