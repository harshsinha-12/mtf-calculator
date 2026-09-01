"use client";

import { NumberInput, SliderInput } from "@/components/ui/inputs";
import type { MTFInputs } from "@/lib/mtf-schema";

interface InputPanelProps {
  inputs: MTFInputs;
  onChange: (patch: Partial<MTFInputs>) => void;
  step?: "position" | "costs" | "simulate" | "all";
}

export function InputPanel({ inputs, onChange, step = "all" }: InputPanelProps) {
  const showPosition = step === "position" || step === "all";
  const showCosts = step === "costs" || step === "all";
  const showSimulate = step === "simulate" || step === "all";
  const showPledge =
    (inputs.mode === "pledge" || inputs.mode === "mixed") &&
    (step === "position" || step === "all");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {showPosition && (
        <>
          <NumberInput
            label="Stock Price"
            value={inputs.stockPrice}
            onChange={(v) => onChange({ stockPrice: v })}
            prefix="₹"
            step={10}
            min={1}
          />
          {(inputs.mode === "cash" || inputs.mode === "mixed") && (
            <NumberInput
              label="Available Capital"
              value={inputs.availableCapital}
              onChange={(v) => onChange({ availableCapital: v })}
              prefix="₹"
              step={1000}
              min={0}
            />
          )}
          {showPledge && (
            <>
              <NumberInput
                label="Pledge Holding Value"
                value={inputs.pledgeHoldingValue}
                onChange={(v) => onChange({ pledgeHoldingValue: v })}
                prefix="₹"
                step={10000}
                min={0}
              />
              <SliderInput
                label="Haircut"
                value={inputs.pledgeHaircut}
                onChange={(v) => onChange({ pledgeHaircut: v })}
                min={0}
                max={80}
                step={5}
                formatValue={(v) => `${v}%`}
              />
            </>
          )}
          <SliderInput
            label="MTF Leverage"
            value={inputs.leverage}
            onChange={(v) => onChange({ leverage: v })}
            min={1}
            max={5}
            step={0.5}
            formatValue={(v) => `${v}x`}
          />
        </>
      )}

      {showCosts && (
        <>
          <SliderInput
            label="Holding Period"
            value={inputs.holdingPeriodDays}
            onChange={(v) => onChange({ holdingPeriodDays: v })}
            min={1}
            max={365}
            step={1}
            formatValue={(v) => `${v} days`}
          />
          <NumberInput
            label="Daily Interest Rate"
            value={inputs.dailyInterestRate}
            onChange={(v) => onChange({ dailyInterestRate: v })}
            suffix="%/day"
            step={0.001}
            min={0}
            hint="Groww: 0.041% per day (14.95% p.a.)"
          />
          <NumberInput
            label="Brokerage"
            value={inputs.brokeragePercent}
            onChange={(v) => onChange({ brokeragePercent: v })}
            suffix="%"
            step={0.01}
            min={0}
          />
          {inputs.mode !== "cash" && (
            <>
              <NumberInput
                label="Pledge Charge"
                value={inputs.pledgeCharge}
                onChange={(v) => onChange({ pledgeCharge: v })}
                prefix="₹"
                step={5}
                min={0}
              />
              <NumberInput
                label="Unpledge Charge"
                value={inputs.unpledgeCharge}
                onChange={(v) => onChange({ unpledgeCharge: v })}
                prefix="₹"
                step={5}
                min={0}
              />
            </>
          )}
          <NumberInput
            label="GST"
            value={inputs.gstPercent}
            onChange={(v) => onChange({ gstPercent: v })}
            suffix="%"
            step={1}
            min={0}
          />
        </>
      )}

      {showSimulate && (
        <div className="sm:col-span-2">
          <SliderInput
            label="Expected Stock Return"
            value={inputs.expectedReturn}
            onChange={(v) => onChange({ expectedReturn: v })}
            min={-30}
            max={50}
            step={0.5}
            formatValue={(v) => `${v > 0 ? "+" : ""}${v}%`}
          />
        </div>
      )}
    </div>
  );
}
