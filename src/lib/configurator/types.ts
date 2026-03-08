export type MarketId = "us" | "california" | "eu";
export type DealerId = "premium" | "discount" | "ev";

export interface Market {
  id: MarketId;
  name: string;
  description: string;
}

export interface Dealer {
  id: DealerId;
  name: string;
  description: string;
}

export interface Model {
  id: string;
  name: string;
  basePrice: number;
  description: string;
  image: string;
}

export interface Engine {
  id: string;
  name: string;
  type: "petrol" | "diesel" | "electric";
  horsePower: number;
  torque: number;
  priceModifier: number;
  compatibleModels: string[];
}

export interface Transmission {
  id: string;
  name: string;
  type: "manual" | "automatic" | "cvt";
  priceModifier: number;
  compatibleEngines: string[];
}

export interface Trim {
  id: string;
  name: string;
  description: string;
  priceModifier: number;
  features: string[];
  compatibleEngines: string[];
}

export interface ExteriorOption {
  id: string;
  name: string;
  type: "paint" | "roof" | "other";
  priceModifier: number;
  color?: string;
  description: string;
  disabledTrims?: string[];
}

export interface InteriorOption {
  id: string;
  name: string;
  type: "upholstery" | "trim_material" | "other";
  priceModifier: number;
  color?: string;
  description: string;
  disabledTrims?: string[];
}

export interface Wheel {
  id: string;
  name: string;
  size: string;
  priceModifier: number;
  description: string;
  image: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  features: string[];
  priceModifier: number;
  disabledTrims?: string[];
}

export interface Configuration {
  market: MarketId;
  dealer: DealerId;
  modelId: string | null;
  engineId: string | null;
  transmissionId: string | null;
  trimId: string | null;
  exteriorOptions: string[];
  interiorOptions: string[];
  wheels: string | null;
  packages: string[];
}

export interface PriceBreakdown {
  basePrice: number;
  enginePrice: number;
  transmissionPrice: number;
  trimPrice: number;
  optionsPrice: number;
  packagesPrice: number;
  dealerDiscount: number;
  dealerDiscountLabel?: string;
  totalPrice: number;
}

export interface ConfigurationVersionSet {
  catalogVersion: string;
  rulesVersion: string;
  pricingVersion: string;
}

export interface ProductionCommitment {
  committedAt: string;
}

export interface SavedQuote {
  id: string;
  savedAt: string;
  market: MarketId;
  dealer: DealerId;
  configuration: Configuration;
  price: PriceBreakdown;
  versions: ConfigurationVersionSet;
  productionCommitment: ProductionCommitment | null;
}

export interface ValidationWarning {
  id: string;
  message: string;
  severity: "warning" | "error";
  conflictingOption?: string;
}

export interface RuleNote {
  id: string;
  title: string;
  detail: string;
  tone: "info" | "warning" | "success";
}

export interface ConfigurationEvaluation {
  configuration: Configuration;
  warnings: ValidationWarning[];
  ruleNotes: RuleNote[];
  price: PriceBreakdown;
  versions: ConfigurationVersionSet;
}