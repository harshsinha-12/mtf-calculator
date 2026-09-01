"use client";

import { ArrowRight, Landmark, Sparkles, TrendingUp, Wallet } from "lucide-react";
import type { MTFStore } from "@/hooks/use-mtf-store";

interface HomeScreenProps {
  store: MTFStore;
}

export function HomeScreen({ store }: HomeScreenProps) {
  const { openCalculator, openWizard } = store;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-400/10 ring-1 ring-amber-400/20">
          <Sparkles className="h-10 w-10 text-amber-400" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
          MTF Lab
        </h1>
        <p className="mt-3 text-base text-zinc-400 sm:text-lg">
          Return & Risk Simulator for Margin Trading
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-500">
          Figure out if your MTF trade is worth it — before interest eats your
          lunch. Calculate break-even, simulate returns, and model pledge
          collateral.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { icon: TrendingUp, label: "Break-even analysis" },
            { icon: Wallet, label: "Pledge collateral" },
            { icon: Landmark, label: "Cost decay curves" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-left"
            >
              <Icon className="mb-2 h-5 w-5 text-amber-400" />
              <p className="text-sm text-zinc-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={openCalculator}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-8 py-3.5 text-sm font-semibold text-amber-950 transition hover:bg-amber-300 sm:w-auto"
          >
            Open Calculator
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={openWizard}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 px-8 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-zinc-100 sm:w-auto"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            Guided Setup
          </button>
        </div>
      </div>
    </div>
  );
}
