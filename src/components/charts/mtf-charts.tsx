"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme } from "@/hooks/use-chart-theme";
import { formatINR, formatINRCompact, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  theme,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string | number;
  labelFormatter?: (l: string | number) => string;
  valueFormatter?: (v: number) => string;
  theme: ReturnType<typeof useChartTheme>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 shadow-xl backdrop-blur-sm",
        theme.tooltipBorder,
        theme.tooltipBg,
      )}
      style={{ fontSize: 12 }}
    >
      <p className={cn("mb-1 font-mono", theme.tooltipText)}>
        {labelFormatter ? labelFormatter(label ?? "") : label}
      </p>
      {payload.map((p) => (
        <p key={p.name} className="font-mono font-semibold" style={{ color: p.color }}>
          {valueFormatter ? valueFormatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

interface PnLChartProps {
  data: { movement: number; netPnL: number }[];
  breakEvenReturn: number;
}

export function PnLChart({ data, breakEvenReturn }: PnLChartProps) {
  const chartTheme = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
            <stop offset="50%" stopColor="#34d399" stopOpacity={0} />
            <stop offset="50%" stopColor="#fb7185" stopOpacity={0} />
            <stop offset="100%" stopColor="#fb7185" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
        <XAxis
          dataKey="movement"
          tickFormatter={(v) => `${v}%`}
          stroke={chartTheme.axis}
          fontSize={11}
          fontFamily="var(--font-mono)"
        />
        <YAxis
          tickFormatter={(v) => formatINR(v, true)}
          stroke={chartTheme.axis}
          fontSize={11}
          fontFamily="var(--font-mono)"
          width={70}
        />
        <Tooltip
          content={
            <ChartTooltip
              theme={chartTheme}
              labelFormatter={(l) => `Stock ${formatPercent(Number(l))}`}
              valueFormatter={(v) => formatINR(v)}
            />
          }
        />
        <ReferenceLine y={0} stroke={chartTheme.reference} strokeDasharray="4 4" />
        <ReferenceLine
          x={breakEvenReturn}
          stroke="#fbbf24"
          strokeDasharray="6 3"
          label={{
            value: "Break-even",
            position: "top",
            fill: "#fbbf24",
            fontSize: 10,
          }}
        />
        <Area
          type="monotone"
          dataKey="netPnL"
          stroke={chartTheme.stroke}
          strokeWidth={2}
          fill="url(#pnlGradient)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface BreakEvenChartProps {
  data: { days: number; breakEvenReturn: number }[];
  holdingPeriod: number;
}

export function BreakEvenChart({ data, holdingPeriod }: BreakEvenChartProps) {
  const chartTheme = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
        <XAxis
          dataKey="days"
          tickFormatter={(v) => `${v}d`}
          stroke={chartTheme.axis}
          fontSize={11}
          fontFamily="var(--font-mono)"
        />
        <YAxis
          tickFormatter={(v) => `${v.toFixed(1)}%`}
          stroke={chartTheme.axis}
          fontSize={11}
          fontFamily="var(--font-mono)"
          width={50}
        />
        <Tooltip
          content={
            <ChartTooltip
              theme={chartTheme}
              labelFormatter={(l) => `Day ${l}`}
              valueFormatter={(v) => `${v.toFixed(2)}% needed`}
            />
          }
        />
        <ReferenceLine
          x={holdingPeriod}
          stroke="#fbbf24"
          strokeDasharray="6 3"
          label={{
            value: "Your hold",
            position: "top",
            fill: "#fbbf24",
            fontSize: 10,
          }}
        />
        <Line
          type="monotone"
          dataKey="breakEvenReturn"
          stroke="#fbbf24"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface LeverageChartProps {
  data: { leverage: number; netPnL: number; roi: number }[];
}

export function LeverageChart({ data }: LeverageChartProps) {
  const chartTheme = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
        <XAxis
          dataKey="leverage"
          tickFormatter={(v) => `${v}x`}
          stroke={chartTheme.axis}
          fontSize={11}
          fontFamily="var(--font-mono)"
        />
        <YAxis
          tickFormatter={(v) => formatINR(v, true)}
          stroke={chartTheme.axis}
          fontSize={11}
          fontFamily="var(--font-mono)"
          width={70}
        />
        <Tooltip
          content={
            <ChartTooltip
              theme={chartTheme}
              labelFormatter={(l) => `${l}x leverage`}
              valueFormatter={(v) => formatINR(v)}
            />
          }
        />
        <ReferenceLine y={0} stroke={chartTheme.reference} />
        <Bar dataKey="netPnL" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.leverage}
              fill={entry.netPnL >= 0 ? "#34d399" : "#fb7185"}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ScenarioSliderProps {
  scenarios: { stockMovement: number; netPnL: number; roiOnCash: number }[];
  selectedMovement: number;
  onSelect: (movement: number) => void;
}

function ScenarioCell({
  movement,
  netPnL,
  isSelected,
  onSelect,
}: {
  movement: number;
  netPnL: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const intensity = Math.min(Math.abs(netPnL) / 10000, 1);
  const isProfit = netPnL >= 0;
  const bg = isProfit
    ? `rgba(52, 211, 153, ${0.15 + intensity * 0.5})`
    : `rgba(251, 113, 133, ${0.15 + intensity * 0.5})`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex min-h-[4.5rem] flex-col items-center justify-center rounded-lg px-2 py-3 text-center transition-all ${
        isSelected ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-background" : ""
      }`}
      style={{ backgroundColor: bg }}
    >
      <span className="font-mono text-[10px] leading-tight text-muted sm:text-xs">
        {movement > 0 ? "+" : ""}
        {movement}%
      </span>
      <span
        className={`mt-1.5 w-full truncate font-mono text-[10px] font-semibold leading-tight sm:text-xs ${
          isProfit ? "text-profit" : "text-loss"
        }`}
      >
        {formatINRCompact(netPnL)}
      </span>
    </button>
  );
}

export function ScenarioHeatmap({
  scenarios,
  selectedMovement,
  onSelect,
}: ScenarioSliderProps) {
  const filtered = scenarios.filter(
    (s) => s.stockMovement >= -20 && s.stockMovement <= 30,
  );
  const lossZone = filtered.filter((s) => s.netPnL < 0);
  const profitZone = filtered.filter((s) => s.netPnL >= 0);

  return (
    <div className="space-y-2">
      {lossZone.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-loss/80">
            Loss zone
          </p>
          <div
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${lossZone.length}, minmax(0, 1fr))`,
            }}
          >
            {lossZone.map((s) => (
              <ScenarioCell
                key={s.stockMovement}
                movement={s.stockMovement}
                netPnL={s.netPnL}
                isSelected={s.stockMovement === selectedMovement}
                onSelect={() => onSelect(s.stockMovement)}
              />
            ))}
          </div>
        </div>
      )}

      {profitZone.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-profit/80">
            Profit zone
          </p>
          <div
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${profitZone.length}, minmax(0, 1fr))`,
            }}
          >
            {profitZone.map((s) => (
              <ScenarioCell
                key={s.stockMovement}
                movement={s.stockMovement}
                netPnL={s.netPnL}
                isSelected={s.stockMovement === selectedMovement}
                onSelect={() => onSelect(s.stockMovement)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
