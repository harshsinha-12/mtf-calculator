"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateBreakEven,
  calculateCosts,
  calculateHoldingAnalysis,
  calculatePosition,
  calculateRiskMetrics,
  calculateTradeResult,
  generateBreakEvenCurve,
  generateLeverageComparison,
  generatePnLCurve,
  generateScenarioTable,
} from "@/lib/mtf-calculations";
import { defaultInputs, type MTFInputs } from "@/lib/mtf-schema";

const STORAGE_KEY = "mtf-lab-state";

type Screen = "home" | "calculator";

interface StoredState {
  inputs: MTFInputs;
  screen?: Screen;
}

function readStoredState(): { inputs: MTFInputs; screen: Screen } {
  if (typeof window === "undefined") {
    return { inputs: defaultInputs, screen: "home" };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { inputs: defaultInputs, screen: "home" };

    const parsed = JSON.parse(raw) as Partial<StoredState> & Partial<MTFInputs>;

    // Legacy: flat inputs object
    if (!("inputs" in parsed) && "stockPrice" in parsed) {
      return {
        inputs: { ...defaultInputs, ...parsed },
        screen: "home",
      };
    }

    if (parsed.inputs) {
      return {
        inputs: { ...defaultInputs, ...parsed.inputs },
        screen: parsed.screen === "calculator" ? "calculator" : "home",
      };
    }

    return { inputs: defaultInputs, screen: "home" };
  } catch {
    return { inputs: defaultInputs, screen: "home" };
  }
}

function writeStoredState(inputs: MTFInputs, screen: Screen) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ inputs, screen }));
}

export function useMTFStore() {
  const [inputs, setInputs] = useState<MTFInputs>(defaultInputs);
  const [screen, setScreen] = useState<Screen>("home");
  const [hydrated, setHydrated] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);

  useEffect(() => {
    const stored = readStoredState();
    setInputs(stored.inputs);
    setScreen(stored.screen);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredState(inputs, screen);
  }, [inputs, screen, hydrated]);

  const update = useCallback((patch: Partial<MTFInputs>) => {
    setInputs((prev) => ({ ...prev, ...patch }));
  }, []);

  const openCalculator = useCallback(() => {
    setScreen("calculator");
  }, []);

  const goHome = useCallback(() => {
    setScreen("home");
    setShowWizard(false);
    setWizardStep(0);
  }, []);

  const openWizard = useCallback(() => {
    setWizardStep(0);
    setShowWizard(true);
  }, []);

  const closeWizard = useCallback(() => {
    setShowWizard(false);
    setWizardStep(0);
  }, []);

  const completeWizard = useCallback(() => {
    setShowWizard(false);
    setWizardStep(0);
    setScreen("calculator");
  }, []);

  const reset = useCallback(() => {
    setInputs(defaultInputs);
    setWizardStep(0);
    setShowWizard(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("mtf-lab-inputs");
  }, []);

  const position = useMemo(() => calculatePosition(inputs), [inputs]);
  const costs = useMemo(() => {
    const exitValue =
      position.totalPosition * (1 + inputs.expectedReturn / 100);
    return calculateCosts(inputs, position, exitValue);
  }, [inputs, position]);
  const result = useMemo(
    () => calculateTradeResult(inputs, position),
    [inputs, position],
  );
  const breakEven = useMemo(
    () => calculateBreakEven(inputs, position),
    [inputs, position],
  );
  const scenarios = useMemo(
    () => generateScenarioTable(inputs, position),
    [inputs, position],
  );
  const pnlCurve = useMemo(
    () => generatePnLCurve(inputs, position),
    [inputs, position],
  );
  const breakEvenCurve = useMemo(
    () => generateBreakEvenCurve(inputs, position),
    [inputs, position],
  );
  const leverageComparison = useMemo(
    () => generateLeverageComparison(inputs),
    [inputs],
  );
  const risk = useMemo(
    () => calculateRiskMetrics(inputs, position),
    [inputs, position],
  );
  const holdingAnalysis = useMemo(
    () => calculateHoldingAnalysis(inputs, position),
    [inputs, position],
  );

  return {
    inputs,
    update,
    reset,
    hydrated,
    screen,
    goHome,
    openCalculator,
    showWizard,
    openWizard,
    closeWizard,
    wizardStep,
    setWizardStep,
    completeWizard,
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
  };
}

export type MTFStore = ReturnType<typeof useMTFStore>;
