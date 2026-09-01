import { z } from "zod";

export const fundingModeSchema = z.enum(["cash", "pledge", "mixed"]);
export type FundingMode = z.infer<typeof fundingModeSchema>;

export const mtfInputsSchema = z.object({
  mode: fundingModeSchema,
  stockPrice: z.number().positive(),
  availableCapital: z.number().min(0),
  pledgeHoldingValue: z.number().min(0),
  pledgeHaircut: z.number().min(0).max(100),
  leverage: z.number().min(1).max(10),
  holdingPeriodDays: z.number().min(1).max(365),
  dailyInterestRate: z.number().min(0).max(1),
  expectedReturn: z.number().min(-100).max(500),
  brokeragePercent: z.number().min(0).max(5),
  pledgeCharge: z.number().min(0),
  unpledgeCharge: z.number().min(0),
  gstPercent: z.number().min(0).max(100),
  quantity: z.number().positive().optional(),
  manualQuantity: z.boolean(),
});

export type MTFInputs = z.infer<typeof mtfInputsSchema>;

export const defaultInputs: MTFInputs = {
  mode: "cash",
  stockPrice: 1000,
  availableCapital: 25000,
  pledgeHoldingValue: 200000,
  pledgeHaircut: 20,
  leverage: 4,
  holdingPeriodDays: 30,
  dailyInterestRate: 0.041,
  expectedReturn: 10,
  brokeragePercent: 0.1,
  pledgeCharge: 20,
  unpledgeCharge: 20,
  gstPercent: 18,
  manualQuantity: false,
};
