import type {
  Configuration,
  ConfigurationVersionSet,
  DealerId,
  MarketId,
  PriceBreakdown,
} from "@/lib/configurator/types";
import { sqliteQuoteRepository } from "@/server/repositories/sqlite-quote-repository";

export interface StoredQuoteRecord {
  id: string;
  savedAt: Date;
  market: MarketId;
  dealer: DealerId;
  configuration: Configuration;
  price: PriceBreakdown;
  versions: ConfigurationVersionSet;
  productionCommitment: { committedAt: Date } | null;
}

export interface CreateQuoteInput {
  id: string;
  market: MarketId;
  dealer: DealerId;
  configuration: Configuration;
  price: PriceBreakdown;
  versions: ConfigurationVersionSet;
  eventType: string;
  eventPayload?: unknown;
}

export interface QuoteRepository {
  create(input: CreateQuoteInput): StoredQuoteRecord;
  commitQuote(id: string): StoredQuoteRecord | null;
  list(): StoredQuoteRecord[];
  getById(id: string): StoredQuoteRecord | null;
  getLatest(): StoredQuoteRecord | null;
}

export const quoteRepository: QuoteRepository = sqliteQuoteRepository;