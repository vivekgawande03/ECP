import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  configurationSchema,
  dealerSchema,
  marketSchema,
  priceBreakdownSchema,
} from "@/lib/configurator/schemas";
import { getSqliteDb } from "@/server/db";
import type { CreateQuoteInput, QuoteRepository, StoredQuoteRecord } from "@/server/repositories/quote-repository";

const quoteRowSchema = z.object({
  id: z.string(),
  savedAt: z.union([z.string(), z.number(), z.date()]),
  market: marketSchema,
  dealer: dealerSchema,
  configuration: z.unknown(),
  price: z.unknown(),
});

function parseJsonColumn(value: unknown): unknown {
  if (typeof value === "string") {
    return JSON.parse(value);
  }

  return value;
}

function parseDate(value: string | number | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function parseStoredQuote(row: unknown): StoredQuoteRecord {
  const parsedRow = quoteRowSchema.parse(row);

  return {
    id: parsedRow.id,
    savedAt: parseDate(parsedRow.savedAt),
    market: parsedRow.market,
    dealer: parsedRow.dealer,
    configuration: configurationSchema.parse(parseJsonColumn(parsedRow.configuration)),
    price: priceBreakdownSchema.parse(parseJsonColumn(parsedRow.price)),
  };
}

const sqlite = getSqliteDb();

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS "Quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "market" TEXT NOT NULL,
    "dealer" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,
    "price" JSONB NOT NULL
  )
`);
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS "QuoteEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )
`);
sqlite.exec(`CREATE INDEX IF NOT EXISTS "Quote_savedAt_idx" ON "Quote"("savedAt")`);
sqlite.exec(
  `CREATE INDEX IF NOT EXISTS "QuoteEvent_quoteId_createdAt_idx" ON "QuoteEvent"("quoteId", "createdAt")`,
);

const insertQuoteStatement = sqlite.prepare(`
  INSERT INTO "Quote" (
    "id",
    "savedAt",
    "updatedAt",
    "market",
    "dealer",
    "configuration",
    "price"
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertQuoteEventStatement = sqlite.prepare(`
  INSERT INTO "QuoteEvent" (
    "id",
    "quoteId",
    "eventType",
    "payload",
    "createdAt"
  ) VALUES (?, ?, ?, ?, ?)
`);

const selectQuoteByIdStatement = sqlite.prepare(`
  SELECT "id", "savedAt", "market", "dealer", "configuration", "price"
  FROM "Quote"
  WHERE "id" = ?
`);

const selectQuotesStatement = sqlite.prepare(`
  SELECT "id", "savedAt", "market", "dealer", "configuration", "price"
  FROM "Quote"
  ORDER BY "savedAt" DESC
`);

const selectLatestQuoteStatement = sqlite.prepare(`
  SELECT "id", "savedAt", "market", "dealer", "configuration", "price"
  FROM "Quote"
  ORDER BY "savedAt" DESC
  LIMIT 1
`);

export const sqliteQuoteRepository: QuoteRepository = {
  create(input: CreateQuoteInput): StoredQuoteRecord {
    const timestamp = new Date().toISOString();

    sqlite.exec("BEGIN");

    try {
      insertQuoteStatement.run(
        input.id,
        timestamp,
        timestamp,
        input.market,
        input.dealer,
        JSON.stringify(input.configuration),
        JSON.stringify(input.price),
      );

      insertQuoteEventStatement.run(
        randomUUID(),
        input.id,
        input.eventType,
        input.eventPayload == null ? null : JSON.stringify(input.eventPayload),
        timestamp,
      );

      sqlite.exec("COMMIT");
    } catch (error) {
      sqlite.exec("ROLLBACK");
      throw error;
    }

    const createdQuote = selectQuoteByIdStatement.get(input.id);

    if (!createdQuote) {
      throw new Error(`Failed to load created quote ${input.id}`);
    }

    return parseStoredQuote(createdQuote);
  },

  list(): StoredQuoteRecord[] {
    return selectQuotesStatement.all().map((row) => parseStoredQuote(row));
  },

  getById(id: string): StoredQuoteRecord | null {
    const quote = selectQuoteByIdStatement.get(id);

    return quote ? parseStoredQuote(quote) : null;
  },

  getLatest(): StoredQuoteRecord | null {
    const quote = selectLatestQuoteStatement.get();

    return quote ? parseStoredQuote(quote) : null;
  },
};