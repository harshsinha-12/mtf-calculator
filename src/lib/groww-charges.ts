/**
 * Groww MTF / equity-delivery charges on a trade's turnover (price × quantity).
 *
 * Buy-side rates reverse-engineered from a Groww contract note
 * (₹3,495 × 18 shares) and NSE/SEBI published schedules:
 *   STT 0.1%, stamp duty 0.015%, NSE txn 0.00297%,
 *   SEBI ₹10/crore, IPF ₹10/crore, GST 18% on GST-able heads.
 *
 * Sell-side statutory (STT, exchange, DP) is omitted until a sell note is available.
 * Sell brokerage still uses Groww's published 0.1% per order.
 */

export const STATUTORY_BUY = {
  /** Equity delivery STT on buy turnover */
  stt: 0.001,
  /** Stamp duty on buy turnover (0.015%) */
  stampDuty: 0.00015,
  /** NSE equity transaction charges */
  exchangeTxn: 0.0000297,
  /** SEBI turnover fees — ₹10 per crore */
  sebi: 0.000001,
  /** NSE Investor Protection Fund — ₹10 per crore */
  ipf: 0.000001,
} as const;

export interface TurnoverCharges {
  brokerage: number;
  stt: number;
  stampDuty: number;
  exchangeCharges: number;
  sebiCharges: number;
  ipfCharges: number;
  gst: number;
}

export function roundPaise(value: number): number {
  return Math.round(value * 100) / 100;
}

export function chargesOnTurnover(
  turnover: number,
  brokeragePercent: number,
  gstPercent: number,
  side: "buy" | "sell",
): TurnoverCharges {
  const brokerage = roundPaise(turnover * (brokeragePercent / 100));
  const gstRate = gstPercent / 100;

  if (side === "sell") {
    return {
      brokerage,
      stt: 0,
      stampDuty: 0,
      exchangeCharges: 0,
      sebiCharges: 0,
      ipfCharges: 0,
      gst: roundPaise(brokerage * gstRate),
    };
  }

  const stt = roundPaise(turnover * STATUTORY_BUY.stt);
  const stampDuty = roundPaise(turnover * STATUTORY_BUY.stampDuty);
  const exchangeCharges = roundPaise(turnover * STATUTORY_BUY.exchangeTxn);
  const sebiCharges = roundPaise(turnover * STATUTORY_BUY.sebi);
  const ipfCharges = roundPaise(turnover * STATUTORY_BUY.ipf);
  const gst = roundPaise(
    (brokerage + exchangeCharges + sebiCharges + ipfCharges) * gstRate,
  );

  return {
    brokerage,
    stt,
    stampDuty,
    exchangeCharges,
    sebiCharges,
    ipfCharges,
    gst,
  };
}

/** Ad-valorem buy cost as a fraction of buy turnover (unrounded, for break-even). */
export function buyChargeFraction(
  brokeragePercent: number,
  gstPercent: number,
): number {
  const b = brokeragePercent / 100;
  const g = gstPercent / 100;
  const statutory =
    STATUTORY_BUY.stt +
    STATUTORY_BUY.stampDuty +
    STATUTORY_BUY.exchangeTxn +
    STATUTORY_BUY.sebi +
    STATUTORY_BUY.ipf;
  const gstAble = b + STATUTORY_BUY.exchangeTxn + STATUTORY_BUY.sebi + STATUTORY_BUY.ipf;
  return b + statutory + g * gstAble;
}

/** Brokerage + GST on sell, as a fraction of exit turnover. */
export function sellBrokerageFraction(
  brokeragePercent: number,
  gstPercent: number,
): number {
  const b = brokeragePercent / 100;
  const g = gstPercent / 100;
  return b * (1 + g);
}
