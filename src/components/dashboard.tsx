"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Home,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  BreakEvenChart,
  LeverageChart,
  PnLChart,
  ScenarioHeatmap,
} from "@/components/charts/mtf-charts";
import { InputPanel } from "@/components/panels/input-panel";
import { Panel, SliderInput, StatCard } from "@/components/ui/inputs";
import type { MTFStore } from "@/hooks/use-mtf-store";
import { formatINR, formatPercent } from "@/lib/utils";

interface DashboardProps {
  store: MTFStore;
}

export function Dashboard({ store }: DashboardProps) {
  const {
    inputs,
    update,
    openWizard,
    goHome,
    reset,
    position,
    costs,
    result,
    breakEven,
    scenarios,
    pnlCurve,
    breakEvenCurve,
    leverageComparison,
    risk,
    holdingAnalysis,
  } = store;

  const isProfitable = result.netPnL >= 0;

  return (
    <div className="space-y-6">
      {/* Hero summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[var(--hero-from)] via-[var(--hero-via)] to-[var(--hero-to)] p-6 backdrop-blur-md"
      >
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-amber-400/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-400/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                MTF Lab
              </h1>
              <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-600 ring-1 ring-amber-400/20 dark:text-amber-400">
                {inputs.mode}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {position.quantity} shares @ {formatINR(inputs.stockPrice)} ·{" "}
              {inputs.holdingPeriodDays} day hold · {inputs.leverage}x leverage
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={goHome}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition hover:border-amber-500/30 hover:text-foreground"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </button>
            <button
              type="button"
              onClick={openWizard}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-600 transition hover:bg-amber-400/20 dark:text-amber-400"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Setup Guide
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition hover:border-amber-500/30 hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={
              <>
                Net Profit
                <br />
                after interest
              </>
            }
            value={formatINR(result.netPnL)}
            sub={`on ${formatINR(position.cashContribution || position.yourMargin)} deployed`}
            trend={isProfitable ? "up" : "down"}
            delay={0}
          />
          <StatCard
            label="Return on Capital"
            value={formatPercent(result.roiOnCash)}
            sub={`Stock moved ${formatPercent(inputs.expectedReturn)}`}
            trend={result.roiOnCash >= 0 ? "up" : "down"}
            delay={0.05}
          />
          <StatCard
            label="Break-even Move"
            value={formatPercent(breakEven.returnPercent)}
            sub={`Price: ${formatINR(breakEven.price)}`}
            trend="neutral"
            delay={0.1}
          />
          <StatCard
            label="Total Interest"
            value={formatINR(costs.totalInterest)}
            sub={`${formatINR(costs.dailyInterest)}/day`}
            trend="down"
            delay={0.15}
          />
        </div>
      </motion.div>

      {/* Parameters */}
      <Panel title="Adjust Parameters" subtitle="All values are editable">
        <div className="mb-4 flex gap-2 rounded-xl border border-border bg-surface/80 p-1.5">
          {(["cash", "pledge", "mixed"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => update({ mode: m })}
              className={`flex-1 rounded-lg py-2 text-xs font-medium capitalize transition ${
                inputs.mode === m
                  ? "bg-amber-400 text-amber-950"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <InputPanel inputs={inputs} onChange={update} step="all" />
      </Panel>

      {/* Decision engine */}
      <Panel
        title="Decision Engine"
        subtitle="How long can you hold before MTF costs erase your edge?"
      >
        <div className="flex items-start gap-4 rounded-xl border border-amber-500/20 bg-amber-400/5 p-4">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm leading-relaxed text-foreground/80">
              {holdingAnalysis.message}
            </p>
            {holdingAnalysis.maxProfitableDays !== null && (
              <p className="mt-2 font-mono text-lg font-semibold text-amber-600 dark:text-amber-400">
                Max profitable hold: ~{holdingAnalysis.maxProfitableDays} days
              </p>
            )}
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Position breakdown */}
        <Panel title="Position" subtitle="Exposure breakdown" className="lg:col-span-1">
          <div className="space-y-3">
            {[
              { label: "Total Position", value: formatINR(position.totalPosition) },
              { label: "Your Margin", value: formatINR(position.yourMargin) },
              { label: "Broker Funds", value: formatINR(position.brokerFunded) },
              { label: "Quantity", value: `${position.quantity} shares` },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0"
              >
                <span className="text-xs text-muted">{row.label}</span>
                <span className="font-mono text-sm font-medium text-foreground">
                  {row.value}
                </span>
              </div>
            ))}

            {inputs.mode !== "cash" && (
              <div className="mt-4 rounded-lg bg-surface/80 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted">
                  Pledge Flow
                </p>
                <div className="mt-2 space-y-1 text-xs text-muted">
                  <p>Holdings → Haircut {inputs.pledgeHaircut}%</p>
                  <p className="font-mono text-amber-600 dark:text-amber-400">
                    → {formatINR(position.usablePledgeMargin)} usable
                  </p>
                </div>
              </div>
            )}
          </div>
        </Panel>

        {/* P&L breakdown */}
        <Panel title="P&L Breakdown" subtitle="At your expected return" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <ArrowUpRight className="h-3.5 w-3.5 text-profit" />
                  Gross Profit
                </span>
                <span className="font-mono text-sm text-profit">
                  {formatINR(result.grossPnL)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <ArrowDownRight className="h-3.5 w-3.5 text-loss" />
                  Interest
                </span>
                <span className="font-mono text-sm text-loss">
                  -{formatINR(costs.totalInterest)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Brokerage</span>
                <span className="font-mono text-sm text-loss">
                  -{formatINR(costs.totalBrokerage)}
                </span>
              </div>
              {inputs.mode !== "cash" && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Pledge Costs</span>
                  <span className="font-mono text-sm text-loss">
                    -{formatINR(costs.pledgeCosts)}
                  </span>
                </div>
              )}
              <div className="border-t border-border pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground/80">Net Profit</span>
                  <span
                    className={`font-mono text-lg font-bold ${
                      isProfitable ? "text-profit" : "text-loss"
                    }`}
                  >
                    {formatINR(result.netPnL)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Exit Value</span>
                <span className="font-mono text-sm text-foreground">
                  {formatINR(result.exitValue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">ROI on Cash</span>
                <span className="font-mono text-sm text-foreground">
                  {formatPercent(result.roiOnCash)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">ROI on Economic Capital</span>
                <span className="font-mono text-sm text-foreground">
                  {formatPercent(result.roiOnEconomicCapital)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Break-even Price</span>
                <span className="font-mono text-sm text-amber-600 dark:text-amber-400">
                  {formatINR(breakEven.price)}
                </span>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Net P&L vs Stock Movement"
          subtitle="Break-even marked in amber"
        >
          <PnLChart data={pnlCurve} breakEvenReturn={breakEven.returnPercent} />
        </Panel>

        <Panel
          title="Break-even vs Holding Period"
          subtitle="Required appreciation grows with time"
        >
          <BreakEvenChart
            data={breakEvenCurve}
            holdingPeriod={inputs.holdingPeriodDays}
          />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Return vs Leverage"
          subtitle={`At ${formatPercent(inputs.expectedReturn)} stock move`}
        >
          <LeverageChart data={leverageComparison} />
        </Panel>

        <Panel title="Scenario Explorer" subtitle="Tap a cell to inspect">
          <SliderInput
            label="Expected Return"
            value={inputs.expectedReturn}
            onChange={(v) => update({ expectedReturn: v })}
            min={-20}
            max={30}
            step={1}
            formatValue={(v) => `${v > 0 ? "+" : ""}${v}%`}
          />
          <div className="mt-4">
            <ScenarioHeatmap
              scenarios={scenarios}
              selectedMovement={inputs.expectedReturn}
              onSelect={(m) => update({ expectedReturn: m })}
            />
          </div>
        </Panel>
      </div>

      {/* Risk section */}
      <Panel title="Risk Metrics" subtitle="Understand your downside">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface/60 p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Effective Leverage
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-foreground">
              {risk.effectiveLeverage.toFixed(1)}x
            </p>
            <p className="mt-1 text-xs text-muted">
              Position / economic capital
            </p>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Loss at -5% Stock Move
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-loss">
              {formatPercent(risk.lossOnCapitalAt5Pct)}
            </p>
            <p className="mt-1 text-xs text-muted">On your capital, after costs</p>
          </div>
          <div className="rounded-xl border border-border bg-surface/60 p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Daily Cost Drag
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatINR(risk.dailyCostDrag)}
            </p>
            <p className="mt-1 text-xs text-muted">Interest accruing daily</p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-lg border border-border bg-surface/60 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs leading-relaxed text-muted">
            MTF amplifies both gains and losses. A 10% stock drop on 4x leverage
            can mean ~40% loss on your margin before costs. Always factor in
            interest decay for swing trades.
          </p>
        </div>
      </Panel>
    </div>
  );
}
