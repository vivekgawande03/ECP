import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { TRPCError } from "@trpc/server";
import { CURRENT_CONFIGURATION_VERSIONS } from "@/lib/configurator/versioning";
import type { Configuration, ConfigurationEvaluation, PriceBreakdown } from "@/lib/configurator/types";
import type { CreateQuoteInput, StoredQuoteRecord } from "@/server/repositories/quote-repository";

const mockEvaluateConfiguration = jest.fn();
const mockQuoteRepository = {
  create: jest.fn(),
  commitQuote: jest.fn(),
  list: jest.fn(),
  getById: jest.fn(),
  getLatest: jest.fn(),
};

jest.mock("@/server/services/configuration-evaluator", () => ({
  evaluateConfiguration: mockEvaluateConfiguration,
}));

jest.mock("@/server/repositories/quote-repository", () => ({
  quoteRepository: mockQuoteRepository,
}));

jest.mock("@/server/api/trpc", () => {
  const { initTRPC } = jest.requireActual("@trpc/server") as typeof import("@trpc/server");
  const t = initTRPC.create();

  return {
    createTRPCRouter: t.router,
    publicProcedure: t.procedure,
  };
});

function createConfiguration(overrides: Partial<Configuration> = {}): Configuration {
  return {
    market: "us",
    dealer: "premium",
    modelId: "sedan-x",
    engineId: "petrol-3.0",
    transmissionId: "auto-8",
    trimId: "luxury",
    exteriorOptions: ["paint-midnight-black"],
    interiorOptions: ["interior-black-leather"],
    wheels: "wheels-19",
    packages: ["pkg-technology"],
    ...overrides,
  };
}

function createPrice(totalPrice: number): PriceBreakdown {
  return {
    basePrice: 35000,
    enginePrice: 8000,
    transmissionPrice: 3500,
    trimPrice: 12000,
    optionsPrice: 2500,
    packagesPrice: 3000,
    dealerDiscount: 0,
    totalPrice,
  };
}

function createEvaluation(overrides: Partial<ConfigurationEvaluation> = {}): ConfigurationEvaluation {
  const configuration = overrides.configuration ?? createConfiguration();

  return {
    configuration,
    warnings: overrides.warnings ?? [],
    ruleNotes: overrides.ruleNotes ?? [],
    price: overrides.price ?? createPrice(64000),
    versions: overrides.versions ?? CURRENT_CONFIGURATION_VERSIONS,
  };
}

function createStoredQuote(overrides: Partial<StoredQuoteRecord> = {}): StoredQuoteRecord {
  const configuration = overrides.configuration ?? createConfiguration();

  return {
    id: overrides.id ?? "quote-1001",
    savedAt: overrides.savedAt ?? new Date("2026-03-01T10:00:00.000Z"),
    market: overrides.market ?? configuration.market,
    dealer: overrides.dealer ?? configuration.dealer,
    configuration,
    price: overrides.price ?? createPrice(64000),
    versions: overrides.versions ?? CURRENT_CONFIGURATION_VERSIONS,
    productionCommitment: overrides.productionCommitment ?? null,
  };
}

async function createCaller() {
  const { quoteRouter } = await import("@/server/api/routers/quote");
  return quoteRouter.createCaller({});
}

describe("quoteRouter", () => {
  beforeEach(() => {
    mockEvaluateConfiguration.mockReset();
    mockQuoteRepository.create.mockReset();
    mockQuoteRepository.commitQuote.mockReset();
    mockQuoteRepository.list.mockReset();
    mockQuoteRepository.getById.mockReset();
    mockQuoteRepository.getLatest.mockReset();
  });

  it("creates a quote from the evaluated configuration and serializes the response", async () => {
    const configuration = createConfiguration({ dealer: "discount", trimId: null });
    const evaluation = createEvaluation({
      configuration: createConfiguration({ dealer: "discount", trimId: "sport" }),
      price: createPrice(58750),
    });
    const storedQuote = createStoredQuote({
      configuration: evaluation.configuration,
      market: evaluation.configuration.market,
      dealer: evaluation.configuration.dealer,
      price: evaluation.price,
      versions: evaluation.versions,
    });

    mockEvaluateConfiguration.mockReturnValue(evaluation);
    mockQuoteRepository.create.mockImplementation((input) => ({
      ...storedQuote,
      id: (input as CreateQuoteInput).id,
    }));

    const caller = await createCaller();
    const result = await caller.create({ configuration });

    expect(mockEvaluateConfiguration).toHaveBeenCalledWith(configuration);
    expect(mockQuoteRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/^ECP-\d{14}-[A-Z0-9]{4}$/),
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
      }),
    );
    expect(result).toEqual({
      id: expect.any(String),
      savedAt: storedQuote.savedAt.toISOString(),
      market: storedQuote.market,
      dealer: storedQuote.dealer,
      configuration: storedQuote.configuration,
      price: storedQuote.price,
      versions: storedQuote.versions,
      productionCommitment: null,
    });
  });

  it("lists quotes with ISO timestamps for saved and committed dates", async () => {
    const committedQuote = createStoredQuote({
      id: "order-committed",
      productionCommitment: { committedAt: new Date("2026-03-02T14:30:00.000Z") },
    });

    mockQuoteRepository.list.mockReturnValue([committedQuote]);

    const caller = await createCaller();
    const result = await caller.list();

    expect(result).toEqual([
      {
        id: committedQuote.id,
        savedAt: committedQuote.savedAt.toISOString(),
        market: committedQuote.market,
        dealer: committedQuote.dealer,
        configuration: committedQuote.configuration,
        price: committedQuote.price,
        versions: committedQuote.versions,
        productionCommitment: {
          committedAt: committedQuote.productionCommitment?.committedAt.toISOString(),
        },
      },
    ]);
  });

  it("returns null from getById when the repository misses", async () => {
    mockQuoteRepository.getById.mockReturnValue(null);

    const caller = await createCaller();

    await expect(caller.getById({ id: "missing-quote" })).resolves.toBeNull();
  });

  it("returns the latest quote with serialized dates", async () => {
    const latestQuote = createStoredQuote({
      id: "quote-latest",
      productionCommitment: { committedAt: new Date("2026-03-04T09:15:00.000Z") },
    });

    mockQuoteRepository.getLatest.mockReturnValue(latestQuote);

    const caller = await createCaller();
    const result = await caller.getLatest();

    expect(result).toEqual({
      id: latestQuote.id,
      savedAt: latestQuote.savedAt.toISOString(),
      market: latestQuote.market,
      dealer: latestQuote.dealer,
      configuration: latestQuote.configuration,
      price: latestQuote.price,
      versions: latestQuote.versions,
      productionCommitment: {
        committedAt: latestQuote.productionCommitment?.committedAt.toISOString(),
      },
    });
  });

  it("commits an existing quote and throws a not found error for unknown ids", async () => {
    const committedQuote = createStoredQuote({
      id: "quote-commit",
      productionCommitment: { committedAt: new Date("2026-03-03T08:00:00.000Z") },
    });

    mockQuoteRepository.commitQuote.mockReturnValueOnce(committedQuote).mockReturnValueOnce(null);

    const caller = await createCaller();
    const committedResult = await caller.commit({ id: committedQuote.id });

    expect(committedResult).toEqual({
      id: committedQuote.id,
      savedAt: committedQuote.savedAt.toISOString(),
      market: committedQuote.market,
      dealer: committedQuote.dealer,
      configuration: committedQuote.configuration,
      price: committedQuote.price,
      versions: committedQuote.versions,
      productionCommitment: {
        committedAt: committedQuote.productionCommitment?.committedAt.toISOString(),
      },
    });

    const missingQuotePromise = caller.commit({ id: "missing-quote" });

    await expect(missingQuotePromise).rejects.toBeInstanceOf(TRPCError);
    await expect(missingQuotePromise).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Quote missing-quote was not found.",
    });
  });
});