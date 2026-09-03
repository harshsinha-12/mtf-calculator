import {
  buyChargeFraction,
  chargesOnTurnover,
  sellBrokerageFraction,
} from "./groww-charges";
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
  stt: number;
  stampDuty: number;
  exchangeCharges: number;
  sebiCharges: number;
  ipfCharges: number;
  gst: number;
  pledgeCosts: number;
  totalCharges: number;
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

function pledgeCostsFor(inputs: MTFInputs): number {
  if (inputs.mode === "cash") return 0;
  return (inputs.pledgeCharge + inputs.unpledgeCharge) * (1 + inputs.gstPercent / 100);
}

function breakEvenReturnAtDays(
  inputs: MTFInputs,
  position: PositionBreakdown,
  days: number,
): number {
  const P = position.totalPosition;
  const F = position.brokerFunded;
  const dailyRate = inputs.dailyInterestRate / 100;
  const kBuy = buyChargeFraction(inputs.brokeragePercent, inputs.gstPercent);
  const sellLoad = sellBrokerageFraction(inputs.brokeragePercent, inputs.gstPercent);
  const pledgeCosts = pledgeCostsFor(inputs);
  const interest = F * dailyRate * days;
  const denominator = P * (1 - sellLoad);
  const numerator = interest + P * kBuy + P * sellLoad + pledgeCosts;
  return denominator > 0 ? (numerator / denominator) * 100 : 0;
}

export function calculateCosts(
  inputs: MTFInputs,
  position: PositionBreakdown,
  exitValue?: number,
): CostBreakdown {
  const exit = exitValue ?? position.totalPosition;
  const dailyRate = inputs.dailyInterestRate / 100;

  const dailyInterest = position.brokerFunded * dailyRate;
  const totalInterest = dailyInterest * inputs.holdingPeriodDays;
  const weeklyInterest = dailyInterest * 7;

  const buy = chargesOnTurnover(
    position.totalPosition,
    inputs.brokeragePercent,
    inputs.gstPercent,
    "buy",
  );
  const sell = chargesOnTurnover(
    exit,
    inputs.brokeragePercent,
    inputs.gstPercent,
    "sell",
  );

  const pledgeCosts = pledgeCostsFor(inputs);
  const totalBrokerage = buy.brokerage + sell.brokerage;
  const gst = buy.gst + sell.gst;
  const totalCharges =
    totalInterest +
    totalBrokerage +
    buy.stt +
    buy.stampDuty +
    buy.exchangeCharges +
    buy.sebiCharges +
    buy.ipfCharges +
    gst +
    pledgeCosts;

  return {
    totalInterest,
    dailyInterest,
    weeklyInterest,
    buyBrokerage: buy.brokerage,
    sellBrokerage: sell.brokerage,
    totalBrokerage,
    stt: buy.stt,
    stampDuty: buy.stampDuty,
    exchangeCharges: buy.exchangeCharges,
    sebiCharges: buy.sebiCharges,
    ipfCharges: buy.ipfCharges,
    gst,
    pledgeCosts,
    totalCharges,
    totalFixedCosts: totalCharges,
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

  return grossPnL - costs.totalCharges;
}

export function calculateBreakEven(
  inputs: MTFInputs,
  position: PositionBreakdown,
): { returnPercent: number; price: number } {
  const returnPercent = breakEvenReturnAtDays(
    inputs,
    position,
    inputs.holdingPeriodDays,
  );
  const price = inputs.stockPrice * (1 + returnPercent / 100);
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
  const netPnL = grossPnL - costs.totalCharges;

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

  for (let days = 1; days <= maxDays; days++) {
    data.push({
      days,
      breakEvenReturn: breakEvenReturnAtDays(inputs, position, days),
    });
  }

  return data;
}

export function generateLeverageComparison(
  inputs: MTFInputs,
  leverages: number[] = [1, 2, 2.5, 2.95, 3, 4],
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
  const er = inputs.expectedReturn / 100;
  const kBuy = buyChargeFraction(inputs.brokeragePercent, inputs.gstPercent);
  const sellLoad = sellBrokerageFraction(inputs.brokeragePercent, inputs.gstPercent);
  const pledgeCosts = pledgeCostsFor(inputs);

  const profitBeforeTime =
    er * P - P * kBuy - P * (1 + er) * sellLoad - pledgeCosts;

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
