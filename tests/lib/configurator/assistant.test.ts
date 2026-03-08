import { describe, expect, it } from "@jest/globals";
import { calculateConfigurationPrice } from "@/lib/configurator/pricing";
import { getRuleNotes } from "@/lib/configurator/rules";
import type { AssistantContext } from "@/lib/configurator/assistant";
import {
  buildCandidates,
  detectIntent,
  getAssistantReply,
  getRecommendation,
} from "@/lib/configurator/assistant";
import type { Configuration } from "@/lib/configurator/types";

function createContext(configuration: Configuration, overrides?: Partial<AssistantContext>): AssistantContext {
  return {
    configuration,
    currentStep: 4,
    warnings: [],
    ruleNotes: getRuleNotes(configuration),
    price: calculateConfigurationPrice(configuration),
    isEvaluationPending: false,
    ...overrides,
  };
}

describe("configurator assistant logic", () => {
  it("detects warning-oriented prompts", () => {
    expect(detectIntent("Why is this configuration invalid?")).toBe("warnings");
  });

  it("summarizes incomplete builds with the next required step", () => {
    const configuration: Configuration = {
      market: "us",
      dealer: "premium",
      modelId: null,
      engineId: null,
      transmissionId: null,
      trimId: null,
      exteriorOptions: ["paint-pearl-white"],
      interiorOptions: [],
      wheels: null,
      packages: [],
    };

    const reply = getAssistantReply("summary", createContext(configuration), buildCandidates("us", "premium"));

    expect(reply.content).toContain("Start by choosing a model");
  });

  it("keeps the current model when finding a cheaper recommendation", () => {
    const configuration: Configuration = {
      market: "us",
      dealer: "premium",
      modelId: "suv-elite",
      engineId: "electric",
      transmissionId: "direct-drive",
      trimId: "luxury",
      exteriorOptions: ["paint-pearl-white"],
      interiorOptions: [],
      wheels: null,
      packages: [],
    };

    const context = createContext(configuration);
    const recommendation = getRecommendation("cheaper", context, buildCandidates("us", "premium"));

    expect(recommendation).not.toBeNull();
    expect(recommendation?.configuration.modelId).toBe("suv-elite");
    expect(recommendation?.estimatedPrice).toBeLessThan(context.price.totalPrice);
  });

  it("returns a sport-focused recommendation with an apply payload", () => {
    const configuration: Configuration = {
      market: "us",
      dealer: "premium",
      modelId: "sedan-x",
      engineId: "petrol-2.0",
      transmissionId: "manual",
      trimId: "base",
      exteriorOptions: ["paint-pearl-white"],
      interiorOptions: [],
      wheels: null,
      packages: [],
    };

    const reply = getAssistantReply("sporty", createContext(configuration), buildCandidates("us", "premium"));

    expect(reply.recommendation).toBeDefined();
    expect(reply.recommendation?.label).toBe("Sport-focused setup");
    expect(reply.recommendation?.configuration.modelId).toBe("coupe-sport");
    expect(reply.recommendation?.configuration.trimId).toBe("sport");
    expect(reply.content).toContain("sportier direction");
  });
});