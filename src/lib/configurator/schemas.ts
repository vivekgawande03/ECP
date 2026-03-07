import { z } from "zod";

export const marketSchema = z.enum(["us", "california", "eu"]);
export const dealerSchema = z.enum(["premium", "discount", "ev"]);

export const configurationSchema = z.object({
  market: marketSchema,
  dealer: dealerSchema,
  modelId: z.string().nullable(),
  engineId: z.string().nullable(),
  transmissionId: z.string().nullable(),
  trimId: z.string().nullable(),
  exteriorOptions: z.array(z.string()),
  interiorOptions: z.array(z.string()),
  wheels: z.string().nullable(),
  packages: z.array(z.string()),
});

export const priceBreakdownSchema = z.object({
  basePrice: z.number(),
  enginePrice: z.number(),
  transmissionPrice: z.number(),
  trimPrice: z.number(),
  optionsPrice: z.number(),
  packagesPrice: z.number(),
  dealerDiscount: z.number(),
  dealerDiscountLabel: z.string().optional(),
  totalPrice: z.number(),
});

export const configurationVersionSetSchema = z.object({
  catalogVersion: z.string(),
  rulesVersion: z.string(),
  pricingVersion: z.string(),
});

export const validationWarningSchema = z.object({
  id: z.string(),
  message: z.string(),
  severity: z.enum(["warning", "error"]),
  conflictingOption: z.string().optional(),
});

export const ruleNoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  detail: z.string(),
  tone: z.enum(["info", "warning", "success"]),
});

export const configurationEvaluationSchema = z.object({
  configuration: configurationSchema,
  warnings: z.array(validationWarningSchema),
  ruleNotes: z.array(ruleNoteSchema),
  price: priceBreakdownSchema,
  versions: configurationVersionSetSchema,
});