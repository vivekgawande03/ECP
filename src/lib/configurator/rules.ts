import {
  getEngineById,
  getExteriorOptionById,
  getInteriorOptionById,
  getPackageById,
} from "@/lib/configurator/mock-data";
import type { Configuration, RuleNote, ValidationWarning } from "@/lib/configurator/types";
import { formatCurrency } from "@/lib/utils";

const DIESEL_ENGINE_ID = "diesel-2.2";
const ELECTRIC_ENGINE_ID = "electric";
const RED_INTERIOR_ID = "interior-red-sport";
const TOWING_PACKAGE_ID = "pkg-towing";
const EV_DEALER_INCENTIVE = 2500;
const PREMIUM_DEALER_LUXURY_CREDIT = 1500;

type DealerIncentive = {
  amount: number;
  label: string;
};

function createWarning(id: string, message: string, conflictingOption?: string): ValidationWarning {
  return {
    id,
    message,
    severity: "warning",
    conflictingOption,
  };
}

export function getEngineDisabledReason(configuration: Configuration, engineId: string): string | undefined {
  if (configuration.market === "california" && engineId === DIESEL_ENGINE_ID) {
    return "Diesel powertrains are blocked in the California market.";
  }

  return undefined;
}

export function getExteriorDisabledReason(
  configuration: Configuration,
  optionId: string,
): string | undefined {
  const option = getExteriorOptionById(optionId);
  if (option?.disabledTrims?.includes(configuration.trimId ?? "")) {
    return "Not available with this trim.";
  }

  return undefined;
}

export function getInteriorDisabledReason(
  configuration: Configuration,
  optionId: string,
): string | undefined {
  if (configuration.trimId === "base" && optionId === RED_INTERIOR_ID) {
    return "Base trim excludes Red Sport Leather.";
  }

  const option = getInteriorOptionById(optionId);
  if (option?.disabledTrims?.includes(configuration.trimId ?? "")) {
    return "Not available with this trim.";
  }

  return undefined;
}

export function getPackageDisabledReason(
  configuration: Configuration,
  packageId: string,
): string | undefined {
  if (configuration.engineId === ELECTRIC_ENGINE_ID && packageId === TOWING_PACKAGE_ID) {
    return "Towing Package is not offered with the electric powertrain.";
  }

  const pkg = getPackageById(packageId);
  if (pkg?.disabledTrims?.includes(configuration.trimId ?? "")) {
    return "Not available with this trim.";
  }

  return undefined;
}

export function getDealerIncentive(configuration: Configuration): DealerIncentive | null {
  if (configuration.dealer === "ev" && configuration.engineId === ELECTRIC_ENGINE_ID) {
    return {
      amount: EV_DEALER_INCENTIVE,
      label: "EV Dealer electric incentive",
    };
  }

  if (configuration.dealer === "premium" && configuration.trimId === "luxury") {
    return {
      amount: PREMIUM_DEALER_LUXURY_CREDIT,
      label: "Premium Dealer luxury credit",
    };
  }

  return null;
}

export function getRuleNotes(configuration: Configuration): RuleNote[] {
  const notes: RuleNote[] = [];
  const incentive = getDealerIncentive(configuration);

  if (configuration.market === "california") {
    notes.push({
      id: "california-diesel-rule",
      title: "California market rule",
      detail: "Diesel powertrains are hidden from sale in California due to emissions policy.",
      tone: "warning",
    });
  }

  if (configuration.engineId === ELECTRIC_ENGINE_ID) {
    notes.push({
      id: "electric-towing-rule",
      title: "Electric compatibility rule",
      detail: "Towing Package is disabled when the electric powertrain is selected.",
      tone: "warning",
    });
  }

  if (configuration.trimId === "base") {
    notes.push({
      id: "base-red-interior-rule",
      title: "Base trim restriction",
      detail: "Red Sport Leather is unavailable on the Base trim.",
      tone: "warning",
    });
  }

  if (incentive) {
    notes.push({
      id: `dealer-incentive-${configuration.dealer}`,
      title: "Dealer incentive applied",
      detail: `${incentive.label} applied: -${formatCurrency(incentive.amount)}.`,
      tone: "success",
    });
  } else if (configuration.dealer === "ev") {
    notes.push({
      id: "ev-dealer-preview",
      title: "EV Dealer offer",
      detail: `Select the Electric powertrain to unlock a ${formatCurrency(EV_DEALER_INCENTIVE)} incentive.`,
      tone: "info",
    });
  } else if (configuration.dealer === "premium") {
    notes.push({
      id: "premium-dealer-preview",
      title: "Premium Dealer offer",
      detail: `Select the Luxury trim to unlock a ${formatCurrency(PREMIUM_DEALER_LUXURY_CREDIT)} credit.`,
      tone: "info",
    });
  }

  return notes;
}

export function normalizeConfigurationWithRules(configuration: Configuration): {
  configuration: Configuration;
  warnings: ValidationWarning[];
} {
  let nextConfiguration: Configuration = {
    ...configuration,
    exteriorOptions: [...configuration.exteriorOptions],
    interiorOptions: [...configuration.interiorOptions],
    packages: [...configuration.packages],
  };
  const warnings: ValidationWarning[] = [];

  if (nextConfiguration.engineId) {
    const reason = getEngineDisabledReason(nextConfiguration, nextConfiguration.engineId);

    if (reason) {
      const engine = getEngineById(nextConfiguration.engineId);
      nextConfiguration = {
        ...nextConfiguration,
        engineId: null,
        transmissionId: null,
        trimId: null,
      };
      warnings.push(
        createWarning(
          `engine-removed-${engine?.id ?? "unknown"}`,
          `${engine?.name ?? "Selected engine"} was removed. ${reason}`,
          engine?.id,
        ),
      );
    }
  }

  nextConfiguration.exteriorOptions = nextConfiguration.exteriorOptions.filter((optionId) => {
    const reason = getExteriorDisabledReason(nextConfiguration, optionId);
    if (!reason) {
      return true;
    }

    const option = getExteriorOptionById(optionId);
    warnings.push(
      createWarning(
        `exterior-removed-${optionId}`,
        `${option?.name ?? "Exterior option"} was removed. ${reason}`,
        optionId,
      ),
    );

    return false;
  });

  nextConfiguration.interiorOptions = nextConfiguration.interiorOptions.filter((optionId) => {
    const reason = getInteriorDisabledReason(nextConfiguration, optionId);
    if (!reason) {
      return true;
    }

    const option = getInteriorOptionById(optionId);
    warnings.push(
      createWarning(
        `interior-removed-${optionId}`,
        `${option?.name ?? "Interior option"} was removed. ${reason}`,
        optionId,
      ),
    );

    return false;
  });

  nextConfiguration.packages = nextConfiguration.packages.filter((packageId) => {
    const reason = getPackageDisabledReason(nextConfiguration, packageId);
    if (!reason) {
      return true;
    }

    const pkg = getPackageById(packageId);
    warnings.push(
      createWarning(
        `package-removed-${packageId}`,
        `${pkg?.name ?? "Package"} was removed. ${reason}`,
        packageId,
      ),
    );

    return false;
  });

  return {
    configuration: nextConfiguration,
    warnings,
  };
}