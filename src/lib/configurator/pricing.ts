import {
  getEngineById,
  getExteriorOptionById,
  getInteriorOptionById,
  getModelById,
  getPackageById,
  getTransmissionById,
  getTrimById,
  getWheelById,
} from "@/lib/configurator/mock-data";
import { getDealerIncentive } from "@/lib/configurator/rules";
import type { Configuration, PriceBreakdown } from "@/lib/configurator/types";

export function cloneConfiguration(configuration: Configuration): Configuration {
  return {
    ...configuration,
    exteriorOptions: [...configuration.exteriorOptions],
    interiorOptions: [...configuration.interiorOptions],
    packages: [...configuration.packages],
  };
}

export function clonePriceBreakdown(price: PriceBreakdown): PriceBreakdown {
  return {
    ...price,
  };
}

export function calculateConfigurationPrice(configuration: Configuration): PriceBreakdown {
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
    breakdown.transmissionPrice = getTransmissionById(configuration.transmissionId)?.priceModifier ?? 0;
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
}