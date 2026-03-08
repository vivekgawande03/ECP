import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { TRPCError } from "@trpc/server";
import { CURRENT_CONFIGURATION_VERSIONS } from "@/lib/configurator/versioning";
import type { Configuration, ConfigurationEvaluation } from "@/lib/configurator/types";

const mockEvaluateConfiguration = jest.fn();

jest.mock("@/server/services/configuration-evaluator", () => ({
  evaluateConfiguration: mockEvaluateConfiguration,
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

function createEvaluation(overrides: Partial<ConfigurationEvaluation> = {}): ConfigurationEvaluation {
  return {
    configuration: overrides.configuration ?? createConfiguration(),
    warnings: overrides.warnings ?? [],
    ruleNotes: overrides.ruleNotes ?? [],
    price: overrides.price ?? {
      basePrice: 35000,
      enginePrice: 8000,
      transmissionPrice: 2000,
      trimPrice: 12000,
      optionsPrice: 1000,
      packagesPrice: 3000,
      dealerDiscount: 0,
      totalPrice: 61000,
    },
    versions: overrides.versions ?? CURRENT_CONFIGURATION_VERSIONS,
  };
}

async function createCaller() {
  const { configurationRouter } = await import("@/server/api/routers/configuration");
  return configurationRouter.createCaller({});
}

describe("configurationRouter", () => {
  beforeEach(() => {
    mockEvaluateConfiguration.mockReset();
  });

  it("returns the evaluated configuration payload", async () => {
    const configuration = createConfiguration({ dealer: "discount" });
    const evaluation = createEvaluation({
      configuration,
      warnings: [{ id: "warning-1", message: "Dealer incentive applied.", severity: "warning" }],
    });

    mockEvaluateConfiguration.mockReturnValue(evaluation);

    const caller = await createCaller();
    const result = await caller.evaluate({ configuration });

    expect(mockEvaluateConfiguration).toHaveBeenCalledWith(configuration);
    expect(result).toEqual(evaluation);
  });

  it("rejects invalid input before calling the evaluator", async () => {
    const invalidConfiguration = {
      ...createConfiguration(),
      dealer: "city-center",
    };

    const caller = await createCaller();
    const invalidRequest = caller.evaluate({
      configuration: invalidConfiguration as unknown as Configuration,
    });

    await expect(invalidRequest).rejects.toBeInstanceOf(TRPCError);
    expect(mockEvaluateConfiguration).not.toHaveBeenCalled();
  });
});