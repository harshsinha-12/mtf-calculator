import type { MTFInputs } from "./mtf-schema";

export interface PositionBreakdown {
  totalPosition: number;
  yourMargin: number;
  brokerFunded: number;
  quantity: number;
  usablePledgeMargin: number;
  cashContribution: number;
  pledgeContribution: number;
}

export interface CostBreakdown {
  totalInterest: number;
  dailyInterest: number;
  weeklyInterest: number;
  buyBrokerage: number;
  sellBrokerage: number;
  totalBrokerage: number;
  pledgeCosts: number;
  totalFixedCosts: number;
}

export interface TradeResult {
  exitValue: number;
  grossPnL: number;
  netPnL: number;
  roiOnCash: number;
  roiOnEconomicCapital: number;
  breakEvenReturn: number;
  breakEvenPrice: number;
  economicCapital: number;
}

export interface ScenarioRow {
  stockMovement: number;
  grossPnL: number;
  netPnL: number;
  roiOnCash: number;
}

export interface RiskMetrics {
  effectiveLeverage: number;
  lossOnCapitalAt5Pct: number;
  dailyCostDrag: number;
  marginCallBufferEstimate: number;
}

export interface HoldingAnalysis {
  maxProfitableDays: number | null;
  daysToBreakEvenOnExpectedReturn: number | null;
  message: string;
}

function getMargin(inputs: MTFInputs): {
  cash: number;
  pledge: number;
  total: number;
} {
  const usablePledge =
    inputs.pledgeHoldingValue * (1 - inputs.pledgeHaircut / 100);

  switch (inputs.mode) {
    case "cash":
      return {
        cash: inputs.availableCapital,
        pledge: 0,
        total: inputs.availableCapital,
      };
    case "pledge":
      return { cash: 0, pledge: usablePledge, total: usablePledge };
    case "mixed":
      return {
        cash: inputs.availableCapital,
        pledge: usablePledge,
        total: inputs.availableCapital + usablePledge,
      };
  }
}

export function calculatePosition(inputs: MTFInputs): PositionBreakdown {
  const margin = getMargin(inputs);
  const totalPosition = margin.total * inputs.leverage;
  const brokerFunded = Math.max(0, totalPosition - margin.total);
  const quantity =
    inputs.manualQuantity && inputs.quantity
      ? inputs.quantity
      : Math.floor(totalPosition / inputs.stockPrice);

  const actualPosition = quantity * inputs.stockPrice;

  return {
    totalPosition: actualPosition,
    yourMargin: margin.total,
    brokerFunded: Math.max(0, actualPosition - margin.total),
    quantity,
    usablePledgeMargin: margin.pledge,
    cashContribution: margin.cash,
    pledgeContribution: margin.pledge,
  };
}

export function calculateCosts(
  inputs: MTFInputs,
  position: PositionBreakdown,
  exitValue?: number,
): CostBreakdown {
  const exit = exitValue ?? position.totalPosition;
  const dailyRate = inputs.dailyInterestRate / 100;
  const brokerageRate = inputs.brokeragePercent / 100;
  const gstMultiplier = 1 + inputs.gstPercent / 100;

  const dailyInterest = position.brokerFunded * dailyRate;
  const totalInterest = dailyInterest * inputs.holdingPeriodDays;
  const weeklyInterest = dailyInterest * 7;

  const buyBrokerage = position.totalPosition * brokerageRate;
  const sellBrokerage = exit * brokerageRate;
  const totalBrokerage = buyBrokerage + sellBrokerage;

  const pledgeCosts =
    inputs.mode === "cash"
      ? 0
      : (inputs.pledgeCharge + inputs.unpledgeCharge) * gstMultiplier;

  return {
    totalInterest,
    dailyInterest,
    weeklyInterest,
    buyBrokerage,
    sellBrokerage,
    totalBrokerage,
    pledgeCosts,
    totalFixedCosts: totalInterest + totalBrokerage + pledgeCosts,
  };
}

export function calculateNetPnL(
  inputs: MTFInputs,
  position: PositionBreakdown,
  stockReturnPercent: number,
): number {
  const returnDecimal = stockReturnPercent / 100;
  const grossPnL = position.totalPosition * returnDecimal;
  const exitValue = position.totalPosition * (1 + returnDecimal);
  const costs = calculateCosts(inputs, position, exitValue);

  return grossPnL - costs.totalInterest - costs.totalBrokerage - costs.pledgeCosts;
}

export function calculateBreakEven(
  inputs: MTFInputs,
  position: PositionBreakdown,
): { returnPercent: number; price: number } {
  const P = position.totalPosition;
  const F = position.brokerFunded;
  const d = inputs.holdingPeriodDays;
  const dailyRate = inputs.dailyInterestRate / 100;
  const b = inputs.brokeragePercent / 100;
  const gstMultiplier = 1 + inputs.gstPercent / 100;

  const interest = F * dailyRate * d;
  const pledgeCosts =
    inputs.mode === "cash"
      ? 0
      : (inputs.pledgeCharge + inputs.unpledgeCharge) * gstMultiplier;

  // net = P*r - interest - P*b - P*(1+r)*b - pledge = 0
  // r*(P - P*b) = interest + 2*P*b + pledge
  const numerator = interest + 2 * P * b + pledgeCosts;
  const denominator = P * (1 - b);

  const returnDecimal = denominator > 0 ? numerator / denominator : 0;
  const returnPercent = returnDecimal * 100;
  const price = inputs.stockPrice * (1 + returnDecimal);

  return { returnPercent, price };
}

export function calculateTradeResult(
  inputs: MTFInputs,
  position: PositionBreakdown,
): TradeResult {
  const returnDecimal = inputs.expectedReturn / 100;
  const exitValue = position.totalPosition * (1 + returnDecimal);
  const grossPnL = position.totalPosition * returnDecimal;
  const costs = calculateCosts(inputs, position, exitValue);
  const netPnL =
    grossPnL - costs.totalInterest - costs.totalBrokerage - costs.pledgeCosts;

  const economicCapital = Math.max(position.yourMargin, 1);
  const cashDeployed = Math.max(position.cashContribution, 1);

  const breakEven = calculateBreakEven(inputs, position);

  return {
    exitValue,
    grossPnL,
    netPnL,
    roiOnCash: (netPnL / cashDeployed) * 100,
    roiOnEconomicCapital: (netPnL / economicCapital) * 100,
    breakEvenReturn: breakEven.returnPercent,
    breakEvenPrice: breakEven.price,
    economicCapital: position.yourMargin,
  };
}

export function generateScenarioTable(
  inputs: MTFInputs,
  position: PositionBreakdown,
  min = -50,
  max = 100,
  step = 5,
): ScenarioRow[] {
  const rows: ScenarioRow[] = [];
  const cashDeployed = Math.max(position.cashContribution, 1);

  for (let movement = min; movement <= max; movement += step) {
    const netPnL = calculateNetPnL(inputs, position, movement);
    rows.push({
      stockMovement: movement,
      grossPnL: position.totalPosition * (movement / 100),
      netPnL,
      roiOnCash: (netPnL / cashDeployed) * 100,
    });
  }

  return rows;
}

export function generatePnLCurve(
  inputs: MTFInputs,
  position: PositionBreakdown,
  points = 81,
): { movement: number; netPnL: number }[] {
  const data: { movement: number; netPnL: number }[] = [];
  const min = -30;
  const max = 30;

  for (let i = 0; i < points; i++) {
    const movement = min + ((max - min) * i) / (points - 1);
    data.push({
      movement,
      netPnL: calculateNetPnL(inputs, position, movement),
    });
  }

  return data;
}

export function generateBreakEvenCurve(
  inputs: MTFInputs,
  position: PositionBreakdown,
  maxDays = 365,
): { days: number; breakEvenReturn: number }[] {
  const data: { days: number; breakEvenReturn: number }[] = [];
  const P = position.totalPosition;
  const F = position.brokerFunded;
  const dailyRate = inputs.dailyInterestRate / 100;
  const b = inputs.brokeragePercent / 100;
  const gstMultiplier = 1 + inputs.gstPercent / 100;
  const pledgeCosts =
    inputs.mode === "cash"
      ? 0
      : (inputs.pledgeCharge + inputs.unpledgeCharge) * gstMultiplier;

  for (let days = 1; days <= maxDays; days++) {
    const interest = F * dailyRate * days;
    const numerator = interest + 2 * P * b + pledgeCosts;
    const denominator = P * (1 - b);
    const returnPercent =
      denominator > 0 ? (numerator / denominator) * 100 : 0;
    data.push({ days, breakEvenReturn: returnPercent });
  }

  return data;
}

export function generateLeverageComparison(
  inputs: MTFInputs,
  leverages: number[] = [1, 2, 2.5, 3, 4],
): { leverage: number; netPnL: number; roi: number }[] {
  return leverages.map((lev) => {
    const modified = { ...inputs, leverage: lev };
    const position = calculatePosition(modified);
    const result = calculateTradeResult(modified, position);
    return {
      leverage: lev,
      netPnL: result.netPnL,
      roi: result.roiOnCash,
    };
  });
}

export function calculateRiskMetrics(
  inputs: MTFInputs,
  position: PositionBreakdown,
): RiskMetrics {
  const economicCapital = Math.max(position.yourMargin, 1);
  const lossAt5 = calculateNetPnL(inputs, position, -5);
  const costs = calculateCosts(inputs, position);

  return {
    effectiveLeverage: position.totalPosition / economicCapital,
    lossOnCapitalAt5Pct: (lossAt5 / economicCapital) * 100,
    dailyCostDrag: costs.dailyInterest,
    marginCallBufferEstimate: 25,
  };
}

export function calculateHoldingAnalysis(
  inputs: MTFInputs,
  position: PositionBreakdown,
): HoldingAnalysis {
  const P = position.totalPosition;
  const F = position.brokerFunded;
  const dailyRate = inputs.dailyInterestRate / 100;
  const b = inputs.brokeragePercent / 100;
  const er = inputs.expectedReturn / 100;
  const gstMultiplier = 1 + inputs.gstPercent / 100;
  const pledgeCosts =
    inputs.mode === "cash"
      ? 0
      : (inputs.pledgeCharge + inputs.unpledgeCharge) * gstMultiplier;

  const profitBeforeTime =
    er * P - P * b * (2 + er) - pledgeCosts;

  if (profitBeforeTime <= 0 || F <= 0 || dailyRate <= 0) {
    return {
      maxProfitableDays: 0,
      daysToBreakEvenOnExpectedReturn: null,
      message:
        "At your expected return, interest costs exceed gains immediately. Consider a shorter hold or higher expected move.",
    };
  }

  const maxDays = profitBeforeTime / (F * dailyRate);

  const breakEven = calculateBreakEven(inputs, position);
  const expectedAboveBreakEven = inputs.expectedReturn > breakEven.returnPercent;

  let message: string;
  if (maxDays < inputs.holdingPeriodDays) {
    message = `Your expected ${inputs.expectedReturn}% return turns unprofitable after ~${Math.floor(maxDays)} days. You're planning to hold ${inputs.holdingPeriodDays} days — interest will eat your edge.`;
  } else if (expectedAboveBreakEven) {
    message = `At ${inputs.expectedReturn}% expected return, you can hold up to ~${Math.floor(maxDays)} days before MTF costs erase profits. Your ${inputs.holdingPeriodDays}-day plan looks viable.`;
  } else {
    message = `Stock must rise ${breakEven.returnPercent.toFixed(2)}% just to break even after ${inputs.holdingPeriodDays} days. Your expected ${inputs.expectedReturn}% ${inputs.expectedReturn >= breakEven.returnPercent ? "clears" : "falls short of"} that hurdle.`;
  }

  return {
    maxProfitableDays: Math.floor(maxDays),
    daysToBreakEvenOnExpectedReturn: maxDays,
    message,
  };
}

export function calculateMaxMTFExposure(
  pledgeValue: number,
  haircut: number,
  leverage: number,
): number {
  const usable = pledgeValue * (1 - haircut / 100);
  return usable * leverage;
}
