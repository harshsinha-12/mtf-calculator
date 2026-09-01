"use client";

import { ArrowRight, Sparkles, TrendingUp, Wallet, Landmark, X } from "lucide-react";
import type { FundingMode } from "@/lib/mtf-schema";
import { ModePill } from "@/components/ui/inputs";
import { InputPanel } from "@/components/panels/input-panel";
import type { MTFStore } from "@/hooks/use-mtf-store";

const STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "mode", title: "Funding" },
  { id: "position", title: "Position" },
  { id: "costs", title: "Costs" },
  { id: "simulate", title: "Simulate" },
];

const WHISPERS: Record<number, string> = {
  0: "Let's figure out if your MTF trade is worth it — before interest eats your lunch.",
  1: "How are you funding this trade? Cash, pledged holdings, or a mix of both?",
  2: "Set your position. Stock price, capital, and leverage define your exposure.",
  3: "MTF isn't free. Interest, brokerage, and pledge charges compound daily.",
  4: "Now simulate. How much do you expect the stock to move?",
};

interface WizardOverlayProps {
  store: MTFStore;
}

export function WizardOverlay({ store }: WizardOverlayProps) {
  const {
    inputs,
    update,
    wizardStep,
    setWizardStep,
    completeWizard,
    closeWizard,
  } = store;

  const isLast = wizardStep === STEPS.length - 1;
  const stepKey =
    wizardStep === 2
      ? "position"
      : wizardStep === 3
        ? "costs"
        : wizardStep === 4
          ? "simulate"
          : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close setup guide"
        className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm"
        onClick={closeWizard}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl">
        <button
          type="button"
          onClick={closeWizard}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted transition hover:bg-surface-elevated hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-2 pr-8">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setWizardStep(i)}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <div className="relative h-1 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="absolute inset-y-0 left-0 bg-amber-400 transition-all duration-300"
                  style={{ width: i <= wizardStep ? "100%" : "0%" }}
                />
              </div>
              <span
                className={`text-[10px] uppercase tracking-wider ${
                  i <= wizardStep ? "text-amber-500 dark:text-amber-400" : "text-subtle"
                }`}
              >
                {s.title}
              </span>
            </button>
          ))}
        </div>

        <p className="mb-6 min-h-[3rem] text-lg leading-relaxed text-foreground/80">
          {WHISPERS[wizardStep]}
        </p>

        <div>
          {wizardStep === 0 && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10 ring-1 ring-amber-400/20">
                <Sparkles className="h-8 w-8 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  MTF Lab
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Return & Risk Simulator for Margin Trading
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { icon: TrendingUp, label: "Break-even analysis" },
                  { icon: Wallet, label: "Pledge collateral" },
                  { icon: Landmark, label: "Cost decay curves" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border bg-surface/80 p-3 text-left"
                  >
                    <Icon className="mb-2 h-4 w-4 text-amber-500 dark:text-amber-400" />
                    <p className="text-xs text-muted">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wizardStep === 1 && (
            <ModeStep
              mode={inputs.mode}
              onModeChange={(mode) => update({ mode })}
            />
          )}

          {stepKey && (
            <InputPanel inputs={inputs} onChange={update} step={stepKey} />
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setWizardStep(Math.max(0, wizardStep - 1))}
            disabled={wizardStep === 0}
            className="rounded-lg px-4 py-2 text-sm text-muted transition hover:text-foreground disabled:opacity-30"
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeWizard}
              className="text-sm text-muted transition hover:text-foreground"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => {
                if (isLast) {
                  completeWizard();
                } else {
                  setWizardStep(wizardStep + 1);
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-amber-950 transition hover:bg-amber-300"
            >
              {isLast ? "Apply & Close" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeStep({
  mode,
  onModeChange,
}: {
  mode: FundingMode;
  onModeChange: (mode: FundingMode) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Select your funding mode</p>
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface/80 p-1.5">
        <ModePill active={mode === "cash"} onClick={() => onModeChange("cash")}>
          Cash
        </ModePill>
        <ModePill active={mode === "pledge"} onClick={() => onModeChange("pledge")}>
          Pledged
        </ModePill>
        <ModePill active={mode === "mixed"} onClick={() => onModeChange("mixed")}>
          Mixed
        </ModePill>
      </div>
      <div className="rounded-xl border border-border bg-surface/60 p-4 text-sm text-muted">
        {mode === "cash" && (
          <p>You put cash as margin. Groww funds the rest at daily interest.</p>
        )}
        {mode === "pledge" && (
          <p>
            Cashless MTF — pledge existing holdings as collateral. Haircut reduces
            usable margin.
          </p>
        )}
        {mode === "mixed" && (
          <p>
            Combine cash and pledged collateral. Most realistic for active traders.
          </p>
        )}
      </div>
    </div>
  );
}
