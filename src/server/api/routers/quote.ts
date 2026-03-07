import { z } from "zod";
import {
  configurationSchema,
  dealerSchema,
  marketSchema,
  priceBreakdownSchema,
} from "@/lib/configurator/schemas";
import { calculateConfigurationPrice } from "@/lib/configurator/pricing";
import type { SavedQuote } from "@/lib/configurator/types";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { quoteRepository } from "@/server/repositories/quote-repository";

const quoteRecordSchema = z.object({
  id: z.string(),
  savedAt: z.date(),
  market: marketSchema,
  dealer: dealerSchema,
  configuration: configurationSchema,
  price: priceBreakdownSchema,
});

function generateQuoteId(): string {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `ECP-${timestamp}-${suffix}`;
}

function serializeQuote(record: unknown): SavedQuote {
  const parsedQuote = quoteRecordSchema.parse(record);

  return {
    id: parsedQuote.id,
    savedAt: parsedQuote.savedAt.toISOString(),
    market: parsedQuote.market,
    dealer: parsedQuote.dealer,
    configuration: parsedQuote.configuration,
    price: parsedQuote.price,
  };
}

export const quoteRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        configuration: configurationSchema,
      }),
    )
    .mutation(({ input }) => {
      const price = calculateConfigurationPrice(input.configuration);
      const quote = quoteRepository.create({
        id: generateQuoteId(),
        market: input.configuration.market,
        dealer: input.configuration.dealer,
        configuration: input.configuration,
        price,
        eventType: "QUOTE_CREATED",
        eventPayload: {
          source: "configurator",
          totalPrice: price.totalPrice,
        },
      });

      return serializeQuote(quote);
    }),

  list: publicProcedure.query(() => {
    return quoteRepository.list().map((quote) => serializeQuote(quote));
  }),

  getById: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(({ input }) => {
      const quote = quoteRepository.getById(input.id);

      if (!quote) {
        return null;
      }

      return serializeQuote(quote);
    }),

  getLatest: publicProcedure.query(() => {
    const quote = quoteRepository.getLatest();

    if (!quote) {
      return null;
    }

    return serializeQuote(quote);
  }),
});