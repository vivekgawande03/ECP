'use client';

import { create } from 'zustand';
import { Configuration, PriceBreakdown, ValidationWarning } from './types';
import {
  getModelById,
  getEngineById,
  getTransmissionById,
  getTrimById,
  getExteriorOptionById,
  getInteriorOptionById,
  getWheelById,
  getPackageById,
  engines,
  transmissions,
  trims,
} from './mock-data';

interface ConfigurationStore {
  configuration: Configuration;
  currentStep: number;
  warnings: ValidationWarning[];

  // Actions
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

  // Selectors
  calculatePrice: () => PriceBreakdown;
  isStepValid: () => boolean;
  getDisabledExteriorOptions: () => string[];
  getDisabledInteriorOptions: () => string[];
  getDisabledPackages: () => string[];
  getCompatibleEngines: () => string[];
  getCompatibleTransmissions: () => string[];
  getCompatibleTrims: () => string[];
}

const initialConfiguration: Configuration = {
  modelId: null,
  engineId: null,
  transmissionId: null,
  trimId: null,
  exteriorOptions: [],
  interiorOptions: [],
  wheels: null,
  packages: [],
};

export const useConfigurationStore = create<ConfigurationStore>((set, get) => ({
  configuration: initialConfiguration,
  currentStep: 0,
  warnings: [],

  selectModel: (modelId: string) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        modelId,
        // Reset dependent selections
        engineId: null,
        transmissionId: null,
        trimId: null,
      },
      warnings: [],
    }));
  },

  selectEngine: (engineId: string) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        engineId,
        transmissionId: null,
      },
      warnings: [],
    }));
  },

  selectTransmission: (transmissionId: string) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        transmissionId,
      },
    }));
  },

  selectTrim: (trimId: string) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        trimId,
      },
    }));
  },

  toggleExteriorOption: (optionId: string) => {
    set((state) => {
      const isSelected = state.configuration.exteriorOptions.includes(optionId);
      const newExteriorOptions = isSelected
        ? state.configuration.exteriorOptions.filter((id) => id !== optionId)
        : [...state.configuration.exteriorOptions, optionId];

      return {
        configuration: {
          ...state.configuration,
          exteriorOptions: newExteriorOptions,
        },
      };
    });
  },

  toggleInteriorOption: (optionId: string) => {
    set((state) => {
      const isSelected = state.configuration.interiorOptions.includes(optionId);
      const newInteriorOptions = isSelected
        ? state.configuration.interiorOptions.filter((id) => id !== optionId)
        : [...state.configuration.interiorOptions, optionId];

      return {
        configuration: {
          ...state.configuration,
          interiorOptions: newInteriorOptions,
        },
      };
    });
  },

  selectWheels: (wheelId: string) => {
    set((state) => ({
      configuration: {
        ...state.configuration,
        wheels: state.configuration.wheels === wheelId ? null : wheelId,
      },
    }));
  },

  togglePackage: (packageId: string) => {
    set((state) => {
      const isSelected = state.configuration.packages.includes(packageId);
      const newPackages = isSelected
        ? state.configuration.packages.filter((id) => id !== packageId)
        : [...state.configuration.packages, packageId];

      return {
        configuration: {
          ...state.configuration,
          packages: newPackages,
        },
      };
    });
  },

  nextStep: () => {
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 8),
    }));
  },

  previousStep: () => {
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    }));
  },

  setCurrentStep: (step: number) => {
    set({ currentStep: Math.max(0, Math.min(step, 8)) });
  },

  reset: () => {
    set({
      configuration: initialConfiguration,
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
      totalPrice: 0,
    };

    if (configuration.modelId) {
      const model = getModelById(configuration.modelId);
      if (model) breakdown.basePrice = model.basePrice;
    }

    if (configuration.engineId) {
      const engine = getEngineById(configuration.engineId);
      if (engine) breakdown.enginePrice = engine.priceModifier;
    }

    if (configuration.transmissionId) {
      const transmission = getTransmissionById(configuration.transmissionId);
      if (transmission) breakdown.transmissionPrice = transmission.priceModifier;
    }

    if (configuration.trimId) {
      const trim = getTrimById(configuration.trimId);
      if (trim) breakdown.trimPrice = trim.priceModifier;
    }

    // Calculate exterior options price
    configuration.exteriorOptions.forEach((optionId) => {
      const option = getExteriorOptionById(optionId);
      if (option) breakdown.optionsPrice += option.priceModifier;
    });

    // Calculate interior options price
    configuration.interiorOptions.forEach((optionId) => {
      const option = getInteriorOptionById(optionId);
      if (option) breakdown.optionsPrice += option.priceModifier;
    });

    // Calculate wheels price
    if (configuration.wheels) {
      const wheel = getWheelById(configuration.wheels);
      if (wheel) breakdown.optionsPrice += wheel.priceModifier;
    }

    // Calculate packages price
    configuration.packages.forEach((packageId) => {
      const pkg = getPackageById(packageId);
      if (pkg) breakdown.packagesPrice += pkg.priceModifier;
    });

    breakdown.totalPrice =
      breakdown.basePrice +
      breakdown.enginePrice +
      breakdown.transmissionPrice +
      breakdown.trimPrice +
      breakdown.optionsPrice +
      breakdown.packagesPrice;

    return breakdown;
  },

  isStepValid: () => {
    const { configuration, currentStep } = get();

    switch (currentStep) {
      case 0: // Model
        return !!configuration.modelId;
      case 1: // Engine
        return !!configuration.engineId;
      case 2: // Transmission
        return !!configuration.transmissionId;
      case 3: // Trim
        return !!configuration.trimId;
      case 4: // Exterior
        return true; // Optional step
      case 5: // Interior
        return true; // Optional step
      case 6: // Wheels
        return true; // Optional step
      case 7: // Packages
        return true; // Optional step
      case 8: // Review
        return true; // Final review
      default:
        return false;
    }
  },

  getDisabledExteriorOptions: () => {
    const { configuration } = get();
    const disabled: string[] = [];

    configuration.exteriorOptions.forEach((selectedId) => {
      const option = getExteriorOptionById(selectedId);
      if (option?.disabledTrims?.includes(configuration.trimId || '')) {
        disabled.push(selectedId);
      }
    });

    return disabled;
  },

  getDisabledInteriorOptions: () => {
    const { configuration } = get();
    const disabled: string[] = [];

    configuration.interiorOptions.forEach((selectedId) => {
      const option = getInteriorOptionById(selectedId);
      if (option?.disabledTrims?.includes(configuration.trimId || '')) {
        disabled.push(selectedId);
      }
    });

    return disabled;
  },

  getDisabledPackages: () => {
    const { configuration } = get();
    const disabled: string[] = [];

    configuration.packages.forEach((selectedId) => {
      const pkg = getPackageById(selectedId);
      if (pkg?.disabledTrims?.includes(configuration.trimId || '')) {
        disabled.push(selectedId);
      }
    });

    return disabled;
  },

  getCompatibleEngines: () => {
    const { configuration } = get();
    if (!configuration.modelId) return [];

    return engines
      .filter((engine) => engine.compatibleModels.includes(configuration.modelId || ''))
      .map((e) => e.id);
  },

  getCompatibleTransmissions: () => {
    const { configuration } = get();
    if (!configuration.engineId) return [];

    return transmissions
      .filter((trans) => trans.compatibleEngines.includes(configuration.engineId || ''))
      .map((t) => t.id);
  },

  getCompatibleTrims: () => {
    const { configuration } = get();
    if (!configuration.engineId) return [];

    return trims
      .filter((trim) => trim.compatibleEngines.includes(configuration.engineId || ''))
      .map((t) => t.id);
  },
}));
