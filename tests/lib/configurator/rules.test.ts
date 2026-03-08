import { describe, expect, it } from "@jest/globals";
import {
  getDealerIncentive,
  getRuleNotes,
  normalizeConfigurationWithRules,
} from "@/lib/configurator/rules";
import type { Configuration } from "@/lib/configurator/types";

function createConfiguration(overrides: Partial<Configuration> = {}): Configuration {
  return {
    market: "us",
    dealer: "premium",
    modelId: "sedan-x",
    engineId: "petrol-2.0",
    transmissionId: "manual",
    trimId: "sport",
    exteriorOptions: ["paint-pearl-white"],
    interiorOptions: [],
    wheels: null,
    packages: [],
    ...overrides,
  };
}

describe("configurator rules", () => {
  it("removes diesel selections blocked in California", () => {
    const result = normalizeConfigurationWithRules(
      createConfiguration({
        market: "california",
        engineId: "diesel-2.2",
        transmissionId: "auto-10",
        trimId: "base",
      }),
    );

    expect(result.configuration).toMatchObject({
      engineId: null,
      transmissionId: null,
      trimId: null,
    });
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.id).toBe("engine-removed-diesel-2.2");
    expect(result.warnings[0]?.message).toContain("California market");
  });

  it("removes trim-incompatible options and packages", () => {
    const result = normalizeConfigurationWithRules(
      createConfiguration({
        trimId: "base",
        exteriorOptions: ["paint-pearl-white", "paint-racing-red"],
        interiorOptions: ["interior-red-sport"],
        packages: ["pkg-comfort"],
      }),
    );

    expect(result.configuration.exteriorOptions).toEqual(["paint-pearl-white"]);
    expect(result.configuration.interiorOptions).toEqual([]);
    expect(result.configuration.packages).toEqual([]);
    expect(result.warnings.map((warning) => warning.conflictingOption)).toEqual(
      expect.arrayContaining(["paint-racing-red", "interior-red-sport", "pkg-comfort"]),
    );
  });

  it("removes the towing package from electric builds", () => {
    const result = normalizeConfigurationWithRules(
      createConfiguration({
        engineId: "electric",
        transmissionId: "direct-drive",
        trimId: "sport",
        packages: ["pkg-towing", "pkg-safety"],
      }),
    );

    expect(result.configuration.packages).toEqual(["pkg-safety"]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.message).toContain("electric powertrain");
  });

  it("returns dealer incentives only for eligible configurations", () => {
    expect(
      getDealerIncentive(
        createConfiguration({
          dealer: "ev",
          engineId: "electric",
          transmissionId: "direct-drive",
        }),
      ),
    ).toEqual({
      amount: 2500,
      label: "EV Dealer electric incentive",
    });

    expect(
      getDealerIncentive(
        createConfiguration({
          dealer: "premium",
          engineId: "petrol-3.0",
          transmissionId: "auto-8",
          trimId: "luxury",
        }),
      ),
    ).toEqual({
      amount: 1500,
      label: "Premium Dealer luxury credit",
    });

    expect(getDealerIncentive(createConfiguration({ dealer: "ev" }))).toBeNull();
  });

  it("includes active restriction and incentive notes", () => {
    const notes = getRuleNotes(
      createConfiguration({
        market: "california",
        dealer: "premium",
        engineId: "electric",
        transmissionId: "direct-drive",
        trimId: "luxury",
      }),
    );

    expect(notes.map((note) => note.id)).toEqual(
      expect.arrayContaining([
        "california-diesel-rule",
        "electric-towing-rule",
        "dealer-incentive-premium",
      ]),
    );
    expect(notes.find((note) => note.id === "dealer-incentive-premium")?.detail).toContain("-$1,500");
  });

  it("shows preview notes when a dealer incentive is not yet unlocked", () => {
    const notes = getRuleNotes(createConfiguration({ dealer: "ev" }));

    expect(notes).toContainEqual(
      expect.objectContaining({
        id: "ev-dealer-preview",
        tone: "info",
      }),
    );
  });
});