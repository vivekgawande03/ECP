import { describe, expect, it } from "@jest/globals";
import {
  areConfigurationVersionsEqual,
  cloneConfigurationVersions,
  formatConfigurationVersionSummary,
  getConfigurationVersionEntries,
} from "@/lib/configurator/versioning";
import type { ConfigurationVersionSet } from "@/lib/configurator/types";

const sampleVersions: ConfigurationVersionSet = {
  catalogVersion: "catalog-2026.03",
  rulesVersion: "rules-2026.03",
  pricingVersion: "pricing-2026.03",
};

describe("configuration version helpers", () => {
  it("clones version sets by value", () => {
    const cloned = cloneConfigurationVersions(sampleVersions);

    expect(cloned).toEqual(sampleVersions);
    expect(cloned).not.toBe(sampleVersions);
  });

  it("compares version sets field-by-field", () => {
    expect(areConfigurationVersionsEqual(sampleVersions, { ...sampleVersions })).toBe(true);
    expect(
      areConfigurationVersionsEqual(sampleVersions, {
        ...sampleVersions,
        pricingVersion: "pricing-2026.04",
      }),
    ).toBe(false);
  });

  it("returns labeled entries and a readable summary", () => {
    expect(getConfigurationVersionEntries(sampleVersions)).toEqual([
      { label: "Catalog", value: "catalog-2026.03" },
      { label: "Rules", value: "rules-2026.03" },
      { label: "Pricing", value: "pricing-2026.03" },
    ]);
    expect(formatConfigurationVersionSummary(sampleVersions)).toBe(
      "Catalog catalog-2026.03 • Rules rules-2026.03 • Pricing pricing-2026.03",
    );
  });
});