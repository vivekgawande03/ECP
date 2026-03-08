import { beforeEach, describe, expect, it } from "@jest/globals";
import { CURRENT_CONFIGURATION_VERSIONS } from "@/lib/configurator/versioning";
import type {
  Configuration,
  ConfigurationEvaluation,
  PriceBreakdown,
  SavedQuote,
} from "@/lib/configurator/types";
import { useConfigurationStore } from "@/store/configuration-store";

function createConfiguration(overrides: Partial<Configuration> = {}): Configuration {
  return {
    market: "us",
    dealer: "premium",
    modelId: "sedan-x",
    engineId: "petrol-3.0",
    transmissionId: "auto-10",
    trimId: "luxury",
    exteriorOptions: ["paint-midnight-black", "roof-panoramic"],
    interiorOptions: ["interior-black-leather"],
    wheels: "wheels-20",
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
    optionsPrice: 4000,
    packagesPrice: 2500,
    dealerDiscount: 0,
    totalPrice,
  };
}

function createQuote(overrides: Partial<SavedQuote> = {}): SavedQuote {
  const configuration = overrides.configuration ?? createConfiguration();

  return {
    id: overrides.id ?? "quote-1001",
    savedAt: overrides.savedAt ?? "2026-03-03T12:00:00.000Z",
    market: overrides.market ?? configuration.market,
    dealer: overrides.dealer ?? configuration.dealer,
    configuration,
    price: overrides.price ?? createPrice(65000),
    versions: overrides.versions ?? CURRENT_CONFIGURATION_VERSIONS,
    productionCommitment: overrides.productionCommitment ?? null,
  };
}

function createEvaluation(overrides: Partial<ConfigurationEvaluation> = {}): ConfigurationEvaluation {
  return {
    configuration: overrides.configuration ?? createConfiguration(),
    warnings: overrides.warnings ?? [{ id: "warning-1", message: "Example warning", severity: "warning" }],
    ruleNotes: overrides.ruleNotes ?? [{ id: "note-1", title: "Rule note", detail: "Example detail", tone: "info" }],
    price: overrides.price ?? createPrice(61000),
    versions: overrides.versions ?? CURRENT_CONFIGURATION_VERSIONS,
  };
}

describe("configuration store", () => {
  beforeEach(() => {
    localStorage.clear();
    useConfigurationStore.getState().reset();
  });

  it("starts with the expected defaults", () => {
    const state = useConfigurationStore.getState();

    expect(state.configuration).toEqual({
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
    });
    expect(state.currentStep).toBe(0);
    expect(state.isLoadedSavedQuote).toBe(false);
    expect(state.isStepValid()).toBe(false);
  });

  it("resets downstream selections when a model is chosen", () => {
    useConfigurationStore.getState().selectModel("sedan-x");
    useConfigurationStore.getState().selectEngine("petrol-3.0");
    useConfigurationStore.getState().selectTransmission("auto-10");
    useConfigurationStore.getState().selectTrim("luxury");
    useConfigurationStore.getState().toggleExteriorOption("roof-panoramic");
    useConfigurationStore.getState().toggleExteriorOption("paint-midnight-black");

    useConfigurationStore.getState().selectModel("suv-elite");
    const { configuration, isEvaluationPending, activeQuoteId, isLoadedSavedQuote } = useConfigurationStore.getState();

    expect(configuration.modelId).toBe("suv-elite");
    expect(configuration.engineId).toBeNull();
    expect(configuration.transmissionId).toBeNull();
    expect(configuration.trimId).toBeNull();
    expect(configuration.exteriorOptions).toEqual(["paint-pearl-white"]);
    expect(isEvaluationPending).toBe(true);
    expect(activeQuoteId).toBeNull();
    expect(isLoadedSavedQuote).toBe(false);
  });

  it("keeps only one paint selection while preserving non-paint exterior options", () => {
    useConfigurationStore.getState().toggleExteriorOption("roof-panoramic");
    useConfigurationStore.getState().toggleExteriorOption("paint-midnight-black");
    expect(useConfigurationStore.getState().configuration.exteriorOptions).toEqual(["paint-midnight-black", "roof-panoramic"]);

    useConfigurationStore.getState().toggleExteriorOption("paint-silver-metallic");
    expect(useConfigurationStore.getState().configuration.exteriorOptions).toEqual(["paint-silver-metallic", "roof-panoramic"]);
  });

  it("toggles wheels off when the same wheel set is selected twice", () => {
    useConfigurationStore.getState().selectWheels("wheels-20");
    expect(useConfigurationStore.getState().configuration.wheels).toBe("wheels-20");

    useConfigurationStore.getState().selectWheels("wheels-20");
    expect(useConfigurationStore.getState().configuration.wheels).toBeNull();
  });

  it("loads saved quotes into the last step with cloned configuration and price data", () => {
    const quote = createQuote();

    useConfigurationStore.getState().applySavedQuote(quote);
    const state = useConfigurationStore.getState();

    expect(state.currentStep).toBe(8);
    expect(state.activeQuoteId).toBe(quote.id);
    expect(state.isLoadedSavedQuote).toBe(true);
    expect(state.isEvaluationPending).toBe(true);
    expect(state.configuration).toEqual(quote.configuration);
    expect(state.configuration).not.toBe(quote.configuration);
    expect(state.price).toEqual(quote.price);
    expect(state.price).not.toBe(quote.price);

    state.setActiveQuoteId("quote-2002");
    expect(useConfigurationStore.getState().activeQuoteId).toBe("quote-2002");
    expect(useConfigurationStore.getState().isLoadedSavedQuote).toBe(false);
  });

  it("applies evaluated snapshots and exposes step validation plus compatibility helpers", () => {
    const evaluation = createEvaluation({
      configuration: createConfiguration({ modelId: "sedan-x", engineId: "electric", transmissionId: "direct-drive", trimId: "sport" }),
    });

    useConfigurationStore.getState().applyEvaluation(evaluation);
    const state = useConfigurationStore.getState();

    expect(state.configuration).toEqual(evaluation.configuration);
    expect(state.configuration).not.toBe(evaluation.configuration);
    expect(state.warnings).toEqual(evaluation.warnings);
    expect(state.ruleNotes).toEqual(evaluation.ruleNotes);
    expect(state.price).toEqual(evaluation.price);
    expect(state.currentVersions).toEqual(CURRENT_CONFIGURATION_VERSIONS);
    expect(state.isEvaluationPending).toBe(false);
    expect(state.getCompatibleEngines()).toEqual(["petrol-2.0", "petrol-3.0", "diesel-2.2", "electric"]);
    expect(state.getCompatibleTransmissions()).toEqual(["direct-drive"]);
    expect(state.getCompatibleTrims()).toEqual(["sport", "luxury"]);

    state.setCurrentStep(1);
    expect(useConfigurationStore.getState().isStepValid()).toBe(true);
    state.selectEngine("petrol-2.0");
    state.setCurrentStep(2);
    expect(useConfigurationStore.getState().isStepValid()).toBe(false);
    state.nextStep();
    state.setCurrentStep(99);
    expect(useConfigurationStore.getState().currentStep).toBe(8);
    state.previousStep();
    expect(useConfigurationStore.getState().currentStep).toBe(7);
  });
});