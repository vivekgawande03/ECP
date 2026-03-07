import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  configurationSchema,
  configurationVersionSetSchema,
  dealerSchema,
  marketSchema,
  priceBreakdownSchema,
} from "@/lib/configurator/schemas";
import { CURRENT_CONFIGURATION_VERSIONS } from "@/lib/configurator/versioning";
import { getSqliteDb } from "@/server/db";
import type { CreateQuoteInput, QuoteRepository, StoredQuoteRecord } from "@/server/repositories/quote-repository";

const quoteRowSchema = z.object({
  id: z.string(),
  savedAt: z.union([z.string(), z.number(), z.date()]),
  market: marketSchema,
  dealer: dealerSchema,
  configuration: z.unknown(),
  price: z.unknown(),
  catalogVersion: z.string(),
  rulesVersion: z.string(),
  pricingVersion: z.string(),
});

const QUOTE_VERSION_COLUMNS = [
  {
    name: "catalogVersion",
    value: CURRENT_CONFIGURATION_VERSIONS.catalogVersion,
  },
  {
    name: "rulesVersion",
    value: CURRENT_CONFIGURATION_VERSIONS.rulesVersion,
  },
  {
    name: "pricingVersion",
    value: CURRENT_CONFIGURATION_VERSIONS.pricingVersion,
  },
] as const;

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
    versions: configurationVersionSetSchema.parse({
      catalogVersion: parsedRow.catalogVersion,
      rulesVersion: parsedRow.rulesVersion,
      pricingVersion: parsedRow.pricingVersion,
    }),
  };
}

function escapeSqlString(value: string): string {
  return value.replaceAll("'", "''");
}

function ensureQuoteVersionColumns() {
  const tableColumns = sqlite
    .prepare(`PRAGMA table_info("Quote")`)
    .all() as Array<{ name?: unknown }>;
  const columnNames = new Set(tableColumns.map((column) => String(column.name ?? "")));

  QUOTE_VERSION_COLUMNS.forEach((column) => {
    if (!columnNames.has(column.name)) {
      sqlite.exec(
        `ALTER TABLE "Quote" ADD COLUMN "${column.name}" TEXT NOT NULL DEFAULT '${escapeSqlString(column.value)}'`,
      );
    }
  });
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
    "price" JSONB NOT NULL,
    "catalogVersion" TEXT NOT NULL DEFAULT 'catalog-2026.03',
    "rulesVersion" TEXT NOT NULL DEFAULT 'rules-2026.03',
    "pricingVersion" TEXT NOT NULL DEFAULT 'pricing-2026.03'
  )
`);
ensureQuoteVersionColumns();
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
    "price",
    "catalogVersion",
    "rulesVersion",
    "pricingVersion"
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  SELECT "id", "savedAt", "market", "dealer", "configuration", "price", "catalogVersion", "rulesVersion", "pricingVersion"
  FROM "Quote"
  WHERE "id" = ?
`);

const selectQuotesStatement = sqlite.prepare(`
  SELECT "id", "savedAt", "market", "dealer", "configuration", "price", "catalogVersion", "rulesVersion", "pricingVersion"
  FROM "Quote"
  ORDER BY "savedAt" DESC
`);

const selectLatestQuoteStatement = sqlite.prepare(`
  SELECT "id", "savedAt", "market", "dealer", "configuration", "price", "catalogVersion", "rulesVersion", "pricingVersion"
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
        input.versions.catalogVersion,
        input.versions.rulesVersion,
        input.versions.pricingVersion,
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