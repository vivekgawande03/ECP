"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { engines, transmissions, trims } from "@/lib/configurator/mock-data";
import {
  calculateConfigurationPrice,
  cloneConfiguration,
  clonePriceBreakdown,
} from "@/lib/configurator/pricing";
import {
  cloneConfigurationVersions,
  CURRENT_CONFIGURATION_VERSIONS,
} from "@/lib/configurator/versioning";
import type {
  Configuration,
  ConfigurationEvaluation,
  ConfigurationVersionSet,
  DealerId,
  MarketId,
  PriceBreakdown,
  RuleNote,
  SavedQuote,
  ValidationWarning,
} from "@/lib/configurator/types";

type ConfigurationStore = {
  configuration: Configuration;
  currentStep: number;
  warnings: ValidationWarning[];
  ruleNotes: RuleNote[];
  price: PriceBreakdown;
  currentVersions: ConfigurationVersionSet;
  isEvaluationPending: boolean;
  activeQuoteId: string | null;
  setMarket: (market: MarketId) => void;
  setDealer: (dealer: DealerId) => void;
  selectModel: (modelId: string) => void;
  selectEngine: (engineId: string) => void;
  selectTransmission: (transmissionId: string) => void;
  selectTrim: (trimId: string) => void;
  toggleExteriorOption: (optionId: string) => void;
  toggleInteriorOption: (optionId: string) => void;
  selectWheels: (wheelId: string) => void;
  togglePackage: (packageId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
  setActiveQuoteId: (quoteId: string | null) => void;
  applySavedQuote: (quote: SavedQuote) => void;
  applyEvaluation: (evaluation: ConfigurationEvaluation) => void;
  setEvaluationPending: (isPending: boolean) => void;
  calculatePrice: () => PriceBreakdown;
  isStepValid: () => boolean;
  getCompatibleEngines: () => string[];
  getCompatibleTransmissions: () => string[];
  getCompatibleTrims: () => string[];
};

const LAST_STEP_INDEX = 8;
const CONFIGURATION_STORAGE_KEY = "ecp-configuration-store";

function createInitialConfiguration(): Configuration {
  return {
    market: "us",
    dealer: "premium",
    modelId: null,
    engineId: null,
    transmissionId: null,
    trimId: null,
    exteriorOptions: [],
    interiorOptions: [],
    wheels: null,
    packages: [],
  };
}

function createEditableConfigurationState(
  configuration: Configuration,
): Pick<
  ConfigurationStore,
  | "configuration"
  | "warnings"
  | "ruleNotes"
  | "price"
  | "currentVersions"
  | "activeQuoteId"
  | "isEvaluationPending"
> {
  const nextConfiguration = cloneConfiguration(configuration);

  return {
    configuration: nextConfiguration,
    warnings: [],
    ruleNotes: [],
    price: calculateConfigurationPrice(nextConfiguration),
    currentVersions: cloneConfigurationVersions(CURRENT_CONFIGURATION_VERSIONS),
    activeQuoteId: null,
    isEvaluationPending: true,
  };
}

export const useConfigurationStore = create<ConfigurationStore>()(
  persist(
    (set, get) => ({
      configuration: createInitialConfiguration(),
      currentStep: 0,
      warnings: [],
      ruleNotes: [],
      price: calculateConfigurationPrice(createInitialConfiguration()),
      currentVersions: cloneConfigurationVersions(CURRENT_CONFIGURATION_VERSIONS),
      isEvaluationPending: false,
      activeQuoteId: null,

      setMarket: (market) => {
        set((state) => createEditableConfigurationState({ ...state.configuration, market }));
      },

      setDealer: (dealer) => {
        set((state) => createEditableConfigurationState({ ...state.configuration, dealer }));
      },

      selectModel: (modelId) => {
        set((state) =>
          createEditableConfigurationState({
            ...state.configuration,
            modelId,
            engineId: null,
            transmissionId: null,
            trimId: null,
          }),
        );
      },

      selectEngine: (engineId) => {
        set((state) =>
          createEditableConfigurationState({
            ...state.configuration,
            engineId,
            transmissionId: null,
            trimId: null,
          }),
        );
      },

      selectTransmission: (transmissionId) => {
        set((state) => createEditableConfigurationState({ ...state.configuration, transmissionId }));
      },

      selectTrim: (trimId) => {
        set((state) => createEditableConfigurationState({ ...state.configuration, trimId }));
      },

      toggleExteriorOption: (optionId) => {
        set((state) => {
          const isSelected = state.configuration.exteriorOptions.includes(optionId);

          return createEditableConfigurationState({
            ...state.configuration,
            exteriorOptions: isSelected
              ? state.configuration.exteriorOptions.filter((id) => id !== optionId)
              : [...state.configuration.exteriorOptions, optionId],
          });
        });
      },

      toggleInteriorOption: (optionId) => {
        set((state) => {
          const isSelected = state.configuration.interiorOptions.includes(optionId);

          return createEditableConfigurationState({
            ...state.configuration,
            interiorOptions: isSelected
              ? state.configuration.interiorOptions.filter((id) => id !== optionId)
              : [...state.configuration.interiorOptions, optionId],
          });
        });
      },

      selectWheels: (wheelId) => {
        set((state) =>
          createEditableConfigurationState({
            ...state.configuration,
            wheels: state.configuration.wheels === wheelId ? null : wheelId,
          }),
        );
      },

      togglePackage: (packageId) => {
        set((state) => {
          const isSelected = state.configuration.packages.includes(packageId);

          return createEditableConfigurationState({
            ...state.configuration,
            packages: isSelected
              ? state.configuration.packages.filter((id) => id !== packageId)
              : [...state.configuration.packages, packageId],
          });
        });
      },

      nextStep: () => {
        set((state) => ({ currentStep: Math.min(state.currentStep + 1, LAST_STEP_INDEX) }));
      },

      previousStep: () => {
        set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) }));
      },

      setCurrentStep: (step) => {
        set({ currentStep: Math.max(0, Math.min(step, LAST_STEP_INDEX)) });
      },

      reset: () => {
        const configuration = createInitialConfiguration();

        set({
          configuration,
          currentStep: 0,
          warnings: [],
          ruleNotes: [],
          price: calculateConfigurationPrice(configuration),
          currentVersions: cloneConfigurationVersions(CURRENT_CONFIGURATION_VERSIONS),
          isEvaluationPending: false,
          activeQuoteId: null,
        });
      },

      setActiveQuoteId: (quoteId) => {
        set({ activeQuoteId: quoteId });
      },

      applySavedQuote: (quote) => {
        set({
          configuration: cloneConfiguration(quote.configuration),
          currentStep: LAST_STEP_INDEX,
          warnings: [],
          ruleNotes: [],
          price: clonePriceBreakdown(quote.price),
          isEvaluationPending: true,
          activeQuoteId: quote.id,
        });
      },

      applyEvaluation: (evaluation) => {
        set({
          configuration: cloneConfiguration(evaluation.configuration),
          warnings: evaluation.warnings.map((warning) => ({ ...warning })),
          ruleNotes: evaluation.ruleNotes.map((note) => ({ ...note })),
          price: clonePriceBreakdown(evaluation.price),
          currentVersions: cloneConfigurationVersions(evaluation.versions),
          isEvaluationPending: false,
        });
      },

      setEvaluationPending: (isPending) => {
        set({ isEvaluationPending: isPending });
      },

      calculatePrice: () => clonePriceBreakdown(get().price),

      isStepValid: () => {
        const { configuration, currentStep } = get();

        switch (currentStep) {
          case 0:
            return Boolean(configuration.modelId);
          case 1:
            return Boolean(configuration.engineId);
          case 2:
            return Boolean(configuration.transmissionId);
          case 3:
            return Boolean(configuration.trimId);
          default:
            return true;
        }
      },

      getCompatibleEngines: () => {
        const { configuration } = get();
        if (!configuration.modelId) {
          return [];
        }

        return engines
          .filter((engine) => engine.compatibleModels.includes(configuration.modelId ?? ""))
          .map((engine) => engine.id);
      },

      getCompatibleTransmissions: () => {
        const { configuration } = get();
        if (!configuration.engineId) {
          return [];
        }

        return transmissions
          .filter((transmission) => transmission.compatibleEngines.includes(configuration.engineId ?? ""))
          .map((transmission) => transmission.id);
      },

      getCompatibleTrims: () => {
        const { configuration } = get();
        if (!configuration.engineId) {
          return [];
        }

        return trims
          .filter((trim) => trim.compatibleEngines.includes(configuration.engineId ?? ""))
          .map((trim) => trim.id);
      },
    }),
    {
      name: CONFIGURATION_STORAGE_KEY,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        configuration: state.configuration,
        currentStep: state.currentStep,
        activeQuoteId: state.activeQuoteId,
      }),
    },
  ),
);