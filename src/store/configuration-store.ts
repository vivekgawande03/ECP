"use client";

import { create } from "zustand";
import {
  engines,
  getEngineById,
  getExteriorOptionById,
  getInteriorOptionById,
  getModelById,
  getPackageById,
  getTransmissionById,
  getTrimById,
  getWheelById,
  transmissions,
  trims,
} from "@/lib/configurator/mock-data";
import {
  getDealerIncentive,
  normalizeConfigurationWithRules,
} from "@/lib/configurator/rules";
import type {
  Configuration,
  DealerId,
  MarketId,
  PriceBreakdown,
  ValidationWarning,
} from "@/lib/configurator/types";

type ConfigurationStore = {
  configuration: Configuration;
  currentStep: number;
  warnings: ValidationWarning[];
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
  calculatePrice: () => PriceBreakdown;
  isStepValid: () => boolean;
  getCompatibleEngines: () => string[];
  getCompatibleTransmissions: () => string[];
  getCompatibleTrims: () => string[];
};

const LAST_STEP_INDEX = 8;

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

export const useConfigurationStore = create<ConfigurationStore>((set, get) => ({
  configuration: createInitialConfiguration(),
  currentStep: 0,
  warnings: [],

  setMarket: (market) => {
    set((state) => {
      const result = normalizeConfigurationWithRules({
        ...state.configuration,
        market,
      });

      return {
        configuration: result.configuration,
        warnings: result.warnings,
      };
    });
  },

  setDealer: (dealer) => {
    set((state) => {
      const result = normalizeConfigurationWithRules({
        ...state.configuration,
        dealer,
      });

      return {
        configuration: result.configuration,
        warnings: result.warnings,
      };
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

      return {
        configuration: result.configuration,
        warnings: result.warnings,
      };
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

      return {
        configuration: result.configuration,
        warnings: result.warnings,
      };
    });
  },

  selectTransmission: (transmissionId) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        transmissionId,
      },
      warnings: [],
    }));
  },

  selectTrim: (trimId) => {
    set((state) => {
      const result = normalizeConfigurationWithRules({
        ...state.configuration,
        trimId,
      });

      return {
        configuration: result.configuration,
        warnings: result.warnings,
      };
    });
  },

  toggleExteriorOption: (optionId) => {
    set((state) => {
      const isSelected = state.configuration.exteriorOptions.includes(optionId);
      return {
        configuration: {
          ...state.configuration,
          exteriorOptions: isSelected
            ? state.configuration.exteriorOptions.filter((id) => id !== optionId)
            : [...state.configuration.exteriorOptions, optionId],
        },
        warnings: [],
      };
    });
  },

  toggleInteriorOption: (optionId) => {
    set((state) => {
      const isSelected = state.configuration.interiorOptions.includes(optionId);
      return {
        configuration: {
          ...state.configuration,
          interiorOptions: isSelected
            ? state.configuration.interiorOptions.filter((id) => id !== optionId)
            : [...state.configuration.interiorOptions, optionId],
        },
        warnings: [],
      };
    });
  },

  selectWheels: (wheelId) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        wheels: state.configuration.wheels === wheelId ? null : wheelId,
      },
      warnings: [],
    }));
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

      return {
        configuration: result.configuration,
        warnings: result.warnings,
      };
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
    });
  },

  calculatePrice: () => {
    const { configuration } = get();
    const breakdown: PriceBreakdown = {
      basePrice: 0,
      enginePrice: 0,
      transmissionPrice: 0,
      trimPrice: 0,
      optionsPrice: 0,
      packagesPrice: 0,
      dealerDiscount: 0,
      totalPrice: 0,
    };

    if (configuration.modelId) {
      breakdown.basePrice = getModelById(configuration.modelId)?.basePrice ?? 0;
    }

    if (configuration.engineId) {
      breakdown.enginePrice = getEngineById(configuration.engineId)?.priceModifier ?? 0;
    }

    if (configuration.transmissionId) {
      breakdown.transmissionPrice =
        getTransmissionById(configuration.transmissionId)?.priceModifier ?? 0;
    }

    if (configuration.trimId) {
      breakdown.trimPrice = getTrimById(configuration.trimId)?.priceModifier ?? 0;
    }

    configuration.exteriorOptions.forEach((optionId) => {
      breakdown.optionsPrice += getExteriorOptionById(optionId)?.priceModifier ?? 0;
    });

    configuration.interiorOptions.forEach((optionId) => {
      breakdown.optionsPrice += getInteriorOptionById(optionId)?.priceModifier ?? 0;
    });

    if (configuration.wheels) {
      breakdown.optionsPrice += getWheelById(configuration.wheels)?.priceModifier ?? 0;
    }

    configuration.packages.forEach((packageId) => {
      breakdown.packagesPrice += getPackageById(packageId)?.priceModifier ?? 0;
    });

    const dealerIncentive = getDealerIncentive(configuration);
    if (dealerIncentive) {
      breakdown.dealerDiscount = dealerIncentive.amount;
      breakdown.dealerDiscountLabel = dealerIncentive.label;
    }

    breakdown.totalPrice =
      breakdown.basePrice +
      breakdown.enginePrice +
      breakdown.transmissionPrice +
      breakdown.trimPrice +
      breakdown.optionsPrice +
      breakdown.packagesPrice -
      breakdown.dealerDiscount;

    return breakdown;
  },

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
}));