"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  hint?: string;
  className?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min,
  max,
  hint,
  className,
}: NumberInputProps) {
  return (
    <div className={cn("group", className)}>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </label>
      <div className="relative flex items-center overflow-hidden rounded-lg border border-border bg-surface-elevated transition-colors focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/20">
        {prefix && (
          <span className="pl-3 font-mono text-sm text-muted">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          min={min}
          max={max}
          className="w-full bg-transparent px-3 py-2.5 font-mono text-sm text-foreground outline-none placeholder:text-subtle"
        />
        {suffix && (
          <span className="pr-3 font-mono text-xs text-muted">{suffix}</span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </div>
  );
}

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (v: number) => string;
  className?: string;
}

export function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue = (v) => String(v),
  className,
}: SliderInputProps) {
  return (
    <div className={cn("", className)}>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider text-muted">
          {label}
        </label>
        <span className="font-mono text-sm font-semibold text-amber-500 dark:text-amber-400">
          {formatValue(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-amber-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(251,191,36,0.5)]"
      />
      <div className="mt-1 flex justify-between font-mono text-[10px] text-subtle">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: React.ReactNode;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

export function StatCard({ label, value, sub, trend, delay = 0 }: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-profit"
      : trend === "down"
        ? "text-loss"
        : "text-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-border bg-surface/80 p-4 backdrop-blur-sm"
    >
      <div className="text-[10px] font-medium uppercase tracking-widest text-muted">
        {label}
      </div>
      <p className={cn("mt-1 font-mono text-xl font-semibold tabular-nums", trendColor)}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </motion.div>
  );
}

interface PanelProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  actions?: React.ReactNode;
}

export function Panel({
  title,
  subtitle,
  children,
  className,
  id,
  actions,
}: PanelProps) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-2xl border border-border bg-surface/60 p-6 backdrop-blur-md",
        className,
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function ModePill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-lg px-4 py-2 text-sm font-medium transition-all",
        active ? "text-amber-950" : "text-muted hover:text-foreground",
      )}
    >
      {active && (
        <motion.div
          layoutId="mode-pill"
          className="absolute inset-0 rounded-lg bg-amber-400"
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function WhisperText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={String(children)}
        initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn("text-lg leading-relaxed text-foreground/80", className)}
      >
        {children}
      </motion.p>
    </AnimatePresence>
  );
}
