"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { engines, transmissions, trims } from "@/lib/configurator/mock-data";
import {
  calculateConfigurationPrice,
  cloneConfiguration,
} from "@/lib/configurator/pricing";
import {
  normalizeConfigurationWithRules,
} from "@/lib/configurator/rules";
import type {
  Configuration,
  DealerId,
  MarketId,
  PriceBreakdown,
  SavedQuote,
  ValidationWarning,
} from "@/lib/configurator/types";

type ConfigurationStore = {
  configuration: Configuration;
  currentStep: number;
  warnings: ValidationWarning[];
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

function createConfigurationState(
  configuration: Configuration,
  warnings: ValidationWarning[],
): Pick<ConfigurationStore, "configuration" | "warnings" | "activeQuoteId"> {
  return {
    configuration,
    warnings,
    activeQuoteId: null,
  };
}

export const useConfigurationStore = create<ConfigurationStore>()(
  persist(
    (set, get) => ({
      configuration: createInitialConfiguration(),
      currentStep: 0,
      warnings: [],
      activeQuoteId: null,

      setMarket: (market) => {
        set((state) => {
          const result = normalizeConfigurationWithRules({
            ...state.configuration,
            market,
          });

          return createConfigurationState(result.configuration, result.warnings);
        });
      },

      setDealer: (dealer) => {
        set((state) => {
          const result = normalizeConfigurationWithRules({
            ...state.configuration,
            dealer,
          });

          return createConfigurationState(result.configuration, result.warnings);
        });
      },

      selectModel: (modelId) => {
        set((state) => {
          const result = normalizeConfigurationWithRules({
            ...state.configuration,
            modelId,
            engineId: null,
            transmissionId: null,
            trimId: null,
          });

          return createConfigurationState(result.configuration, result.warnings);
        });
      },

      selectEngine: (engineId) => {
        set((state) => {
          const result = normalizeConfigurationWithRules({
            ...state.configuration,
            engineId,
            transmissionId: null,
            trimId: null,
          });

          return createConfigurationState(result.configuration, result.warnings);
        });
      },

      selectTransmission: (transmissionId) => {
        set((state) =>
          createConfigurationState(
            {
              ...state.configuration,
              transmissionId,
            },
            [],
          ),
        );
      },

      selectTrim: (trimId) => {
        set((state) => {
          const result = normalizeConfigurationWithRules({
            ...state.configuration,
            trimId,
          });

          return createConfigurationState(result.configuration, result.warnings);
        });
      },

      toggleExteriorOption: (optionId) => {
        set((state) => {
          const isSelected = state.configuration.exteriorOptions.includes(optionId);

          return createConfigurationState(
            {
              ...state.configuration,
              exteriorOptions: isSelected
                ? state.configuration.exteriorOptions.filter((id) => id !== optionId)
                : [...state.configuration.exteriorOptions, optionId],
            },
            [],
          );
        });
      },

      toggleInteriorOption: (optionId) => {
        set((state) => {
          const isSelected = state.configuration.interiorOptions.includes(optionId);

          return createConfigurationState(
            {
              ...state.configuration,
              interiorOptions: isSelected
                ? state.configuration.interiorOptions.filter((id) => id !== optionId)
                : [...state.configuration.interiorOptions, optionId],
            },
            [],
          );
        });
      },

      selectWheels: (wheelId) => {
        set((state) =>
          createConfigurationState(
            {
              ...state.configuration,
              wheels: state.configuration.wheels === wheelId ? null : wheelId,
            },
            [],
          ),
        );
      },

      togglePackage: (packageId) => {
        set((state) => {
          const isSelected = state.configuration.packages.includes(packageId);
          const result = normalizeConfigurationWithRules({
            ...state.configuration,
            packages: isSelected
              ? state.configuration.packages.filter((id) => id !== packageId)
              : [...state.configuration.packages, packageId],
          });

          return createConfigurationState(result.configuration, result.warnings);
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
        set({
          configuration: createInitialConfiguration(),
          currentStep: 0,
          warnings: [],
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
          activeQuoteId: quote.id,
        });
      },

      calculatePrice: () => calculateConfigurationPrice(get().configuration),

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