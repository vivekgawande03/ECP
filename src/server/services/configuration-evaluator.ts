import {
  calculateConfigurationPrice,
  cloneConfiguration,
  clonePriceBreakdown,
} from "@/lib/configurator/pricing";
import {
  cloneConfigurationVersions,
  CURRENT_CONFIGURATION_VERSIONS,
} from "@/lib/configurator/versioning";
import {
  getRuleNotes,
  normalizeConfigurationWithRules,
} from "@/lib/configurator/rules";
import type {
  Configuration,
  ConfigurationEvaluation,
} from "@/lib/configurator/types";

export function evaluateConfiguration(
  configuration: Configuration,
): ConfigurationEvaluation {
  const normalized = normalizeConfigurationWithRules(configuration);
  const normalizedConfiguration = cloneConfiguration(normalized.configuration);

  return {
    configuration: normalizedConfiguration,
    warnings: normalized.warnings.map((warning) => ({ ...warning })),
    ruleNotes: getRuleNotes(normalizedConfiguration).map((note) => ({ ...note })),
    price: clonePriceBreakdown(
      calculateConfigurationPrice(normalizedConfiguration),
    ),
    versions: cloneConfigurationVersions(CURRENT_CONFIGURATION_VERSIONS),
  };
}