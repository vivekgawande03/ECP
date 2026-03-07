import type { ConfigurationVersionSet } from "@/lib/configurator/types";

export const CURRENT_CONFIGURATION_VERSIONS: ConfigurationVersionSet = {
  catalogVersion: "catalog-2026.03",
  rulesVersion: "rules-2026.03",
  pricingVersion: "pricing-2026.03",
};

export function cloneConfigurationVersions(
  versions: ConfigurationVersionSet,
): ConfigurationVersionSet {
  return {
    ...versions,
  };
}

export function areConfigurationVersionsEqual(
  left: ConfigurationVersionSet,
  right: ConfigurationVersionSet,
): boolean {
  return (
    left.catalogVersion === right.catalogVersion &&
    left.rulesVersion === right.rulesVersion &&
    left.pricingVersion === right.pricingVersion
  );
}

export function getConfigurationVersionEntries(
  versions: ConfigurationVersionSet,
) {
  return [
    { label: "Catalog", value: versions.catalogVersion },
    { label: "Rules", value: versions.rulesVersion },
    { label: "Pricing", value: versions.pricingVersion },
  ] as const;
}

export function formatConfigurationVersionSummary(
  versions: ConfigurationVersionSet,
): string {
  return getConfigurationVersionEntries(versions)
    .map(({ label, value }) => `${label} ${value}`)
    .join(" • ");
}