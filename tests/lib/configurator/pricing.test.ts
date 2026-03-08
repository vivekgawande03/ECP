import { describe, expect, it } from "@jest/globals";
import {
  calculateConfigurationPrice,
  cloneConfiguration,
  clonePriceBreakdown,
} from "@/lib/configurator/pricing";
import type { Configuration, PriceBreakdown } from "@/lib/configurator/types";

function createConfiguration(overrides: Partial<Configuration> = {}): Configuration {
  return {
    market: "us",
    dealer: "premium",
    modelId: "suv-elite",
    engineId: "electric",
    transmissionId: "direct-drive",
    trimId: "luxury",
    exteriorOptions: ["paint-midnight-black", "roof-panoramic"],
    interiorOptions: ["interior-black-leather", "interior-carbon-trim"],
    wheels: "wheels-20",
    packages: ["pkg-technology", "pkg-comfort"],
    ...overrides,
  };
}

describe("configurator pricing", () => {
  it("deep clones configuration arrays", () => {
    const original = createConfiguration();
    const cloned = cloneConfiguration(original);

    cloned.exteriorOptions.push("paint-silver-metallic");
    cloned.interiorOptions.push("interior-wood-trim");
    cloned.packages.push("pkg-safety");

    expect(original.exteriorOptions).toEqual(["paint-midnight-black", "roof-panoramic"]);
    expect(original.interiorOptions).toEqual(["interior-black-leather", "interior-carbon-trim"]);
    expect(original.packages).toEqual(["pkg-technology", "pkg-comfort"]);
  });

  it("clones price breakdown objects", () => {
    const original: PriceBreakdown = {
      basePrice: 1,
      enginePrice: 2,
      transmissionPrice: 3,
      trimPrice: 4,
      optionsPrice: 5,
      packagesPrice: 6,
      dealerDiscount: 7,
      dealerDiscountLabel: "Sample incentive",
      totalPrice: 14,
    };

    const cloned = clonePriceBreakdown(original);
    cloned.totalPrice = 99;

    expect(cloned).not.toBe(original);
    expect(original.totalPrice).toBe(14);
  });

  it("calculates totals across selected equipment and dealer incentives", () => {
    const breakdown = calculateConfigurationPrice(createConfiguration());

    expect(breakdown).toEqual({
      basePrice: 48000,
      enginePrice: 15000,
      transmissionPrice: 1000,
      trimPrice: 12000,
      optionsPrice: 10500,
      packagesPrice: 9000,
      dealerDiscount: 1500,
      dealerDiscountLabel: "Premium Dealer luxury credit",
      totalPrice: 94000,
    });
  });
});