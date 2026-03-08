import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import type { Configuration, PriceBreakdown, SavedQuote } from "@/lib/configurator/types";
import { CURRENT_CONFIGURATION_VERSIONS } from "@/lib/configurator/versioning";
import { formatCurrency } from "@/lib/utils";

const mockUseQuoteQuery = jest.fn();
const mockUseConfigurationStore = jest.fn();

jest.mock("@/trpc/react", () => ({
  trpc: {
    quote: {
      getById: {
        useQuery: mockUseQuoteQuery,
      },
    },
  },
}));

jest.mock("@/store/configuration-store", () => ({
  useConfigurationStore: mockUseConfigurationStore,
}));

type StoreState = {
  configuration: Configuration;
  currentVersions: typeof CURRENT_CONFIGURATION_VERSIONS;
  activeQuoteId: string | null;
  calculatePrice: () => PriceBreakdown;
};

function createConfiguration(overrides: Partial<Configuration> = {}): Configuration {
  return {
    market: "us",
    dealer: "premium",
    modelId: "sedan-x",
    engineId: "petrol-3.0",
    transmissionId: "auto-8",
    trimId: "luxury",
    exteriorOptions: ["paint-midnight-black", "roof-panoramic"],
    interiorOptions: ["interior-black-leather"],
    wheels: "wheels-19",
    packages: ["pkg-technology"],
    ...overrides,
  };
}

function createPrice(overrides: Partial<PriceBreakdown> = {}): PriceBreakdown {
  return {
    basePrice: 35000,
    enginePrice: 8000,
    transmissionPrice: 2000,
    trimPrice: 12000,
    optionsPrice: 4000,
    packagesPrice: 3000,
    dealerDiscount: 1500,
    dealerDiscountLabel: "Spring dealer incentive",
    totalPrice: 62500,
    ...overrides,
  };
}

function createQuote(overrides: Partial<SavedQuote> = {}): SavedQuote {
  const configuration = overrides.configuration ?? createConfiguration();

  return {
    id: overrides.id ?? "quote-2001",
    savedAt: overrides.savedAt ?? "2026-03-01T10:00:00.000Z",
    market: overrides.market ?? configuration.market,
    dealer: overrides.dealer ?? configuration.dealer,
    configuration,
    price: overrides.price ?? createPrice(),
    versions: overrides.versions ?? CURRENT_CONFIGURATION_VERSIONS,
    productionCommitment: overrides.productionCommitment ?? null,
  };
}

function mockStore(overrides: Partial<StoreState> = {}) {
  const storeState: StoreState = {
    configuration: createConfiguration(),
    currentVersions: CURRENT_CONFIGURATION_VERSIONS,
    activeQuoteId: null,
    calculatePrice: () => createPrice(),
    ...overrides,
  };

  mockUseConfigurationStore.mockImplementation((selector: unknown) =>
    (selector as (value: StoreState) => unknown)(storeState),
  );

  return storeState;
}

async function renderSummary() {
  const { ConfigurationSummary } = await import("@/components/configurator/configuration-summary");
  render(<ConfigurationSummary />);
}

describe("ConfigurationSummary", () => {
  beforeEach(() => {
    mockUseQuoteQuery.mockReset();
    mockUseConfigurationStore.mockReset();
  });

  it("renders the selected configuration and price breakdown", async () => {
    const price = createPrice();

    mockStore({
      calculatePrice: () => price,
    });
    mockUseQuoteQuery.mockReturnValue({ data: null });

    await renderSummary();

    expect(screen.getByText("Your Configuration")).toBeTruthy();
    expect(screen.getByText("United States")).toBeTruthy();
    expect(screen.getByText("Premium Dealer")).toBeTruthy();
    expect(screen.getByText("Sedan X")).toBeTruthy();
    expect(screen.getByText("Midnight Black")).toBeTruthy();
    expect(screen.getByText("Black Leather")).toBeTruthy();
    expect(screen.getByText(/Technology Package/)).toBeTruthy();
    expect(screen.getByText("Spring dealer incentive")).toBeTruthy();
    expect(screen.getByText(`-${formatCurrency(price.dealerDiscount)}`)).toBeTruthy();
    expect(screen.getByText(formatCurrency(price.totalPrice))).toBeTruthy();
  });

  it("shows a current badge when the loaded quote versions match", async () => {
    const activeQuote = createQuote({ id: "quote-current" });

    mockStore({ activeQuoteId: activeQuote.id });
    mockUseQuoteQuery.mockReturnValue({ data: activeQuote });

    await renderSummary();

    expect(mockUseQuoteQuery).toHaveBeenCalledWith(
      { id: activeQuote.id },
      expect.objectContaining({ enabled: true }),
    );
    expect(screen.getByText("Loaded Quote")).toBeTruthy();
    expect(screen.getByText(activeQuote.id)).toBeTruthy();
    expect(screen.getByText("Current")).toBeTruthy();
    expect(screen.getByText(CURRENT_CONFIGURATION_VERSIONS.catalogVersion)).toBeTruthy();
  });

  it("shows an older badge when the loaded quote versions differ", async () => {
    const activeQuote = createQuote({
      id: "quote-older",
      versions: {
        ...CURRENT_CONFIGURATION_VERSIONS,
        pricingVersion: "pricing-2026.02",
      },
    });

    mockStore({ activeQuoteId: activeQuote.id });
    mockUseQuoteQuery.mockReturnValue({ data: activeQuote });

    await renderSummary();

    expect(screen.getByText("Older")).toBeTruthy();
    expect(screen.getByText("pricing-2026.02")).toBeTruthy();
  });
});