import type {
  Configuration,
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
}

export interface CreateQuoteInput {
  id: string;
  market: MarketId;
  dealer: DealerId;
  configuration: Configuration;
  price: PriceBreakdown;
  eventType: string;
  eventPayload?: unknown;
}

export interface QuoteRepository {
  create(input: CreateQuoteInput): StoredQuoteRecord;
  list(): StoredQuoteRecord[];
  getById(id: string): StoredQuoteRecord | null;
  getLatest(): StoredQuoteRecord | null;
}

export const quoteRepository: QuoteRepository = sqliteQuoteRepository;