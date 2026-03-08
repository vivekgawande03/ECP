import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  configurationSchema,
  configurationVersionSetSchema,
  dealerSchema,
  marketSchema,
  priceBreakdownSchema,
} from "@/lib/configurator/schemas";
import type { SavedQuote } from "@/lib/configurator/types";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { quoteRepository } from "@/server/repositories/quote-repository";
import { evaluateConfiguration } from "@/server/services/configuration-evaluator";

const productionCommitmentRecordSchema = z.object({
  committedAt: z.date(),
});

const quoteRecordSchema = z.object({
  id: z.string(),
  savedAt: z.date(),
  market: marketSchema,
  dealer: dealerSchema,
  configuration: configurationSchema,
  price: priceBreakdownSchema,
  versions: configurationVersionSetSchema,
  productionCommitment: productionCommitmentRecordSchema.nullable(),
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
    versions: parsedQuote.versions,
    productionCommitment: parsedQuote.productionCommitment
      ? {
          committedAt: parsedQuote.productionCommitment.committedAt.toISOString(),
        }
      : null,
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
      const evaluation = evaluateConfiguration(input.configuration);
      const quote = quoteRepository.create({
        id: generateQuoteId(),
        market: evaluation.configuration.market,
        dealer: evaluation.configuration.dealer,
        configuration: evaluation.configuration,
        price: evaluation.price,
        versions: evaluation.versions,
        eventType: "QUOTE_CREATED",
        eventPayload: {
          source: "configurator",
          totalPrice: evaluation.price.totalPrice,
          versions: evaluation.versions,
        },
      });

      return serializeQuote(quote);
    }),

  commit: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(({ input }) => {
      const quote = quoteRepository.commitQuote(input.id);

      if (!quote) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Quote ${input.id} was not found.`,
        });
      }

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