import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { calculateConfigurationPrice } from "@/lib/configurator/pricing";
import type { Configuration, SavedQuote } from "@/lib/configurator/types";
import { CURRENT_CONFIGURATION_VERSIONS } from "@/lib/configurator/versioning";
import { formatCurrency } from "@/lib/utils";

const mockUseQuoteQuery = jest.fn();
const mockUseCommitMutation = jest.fn();
const mockUseUtils = jest.fn();
const mockUseConfigurationStore = Object.assign(jest.fn(), {
  persist: {
    hasHydrated: jest.fn(),
    rehydrate: jest.fn(),
  },
});

jest.mock("@/trpc/react", () => ({
  trpc: {
    useUtils: mockUseUtils,
    quote: {
      getById: {
        useQuery: mockUseQuoteQuery,
      },
      commit: {
        useMutation: mockUseCommitMutation,
      },
    },
  },
}));

jest.mock("@/store/configuration-store", () => ({
  useConfigurationStore: mockUseConfigurationStore,
}));

type StoreState = {
  configuration: Configuration;
  activeQuoteId: string | null;
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

function createQuote(overrides: Partial<SavedQuote> = {}): SavedQuote {
  const configuration = overrides.configuration ?? createConfiguration();

  return {
    id: overrides.id ?? "quote-1001",
    savedAt: overrides.savedAt ?? "2026-03-01T10:00:00.000Z",
    market: overrides.market ?? configuration.market,
    dealer: overrides.dealer ?? configuration.dealer,
    configuration,
    price: overrides.price ?? calculateConfigurationPrice(configuration),
    versions: overrides.versions ?? CURRENT_CONFIGURATION_VERSIONS,
    productionCommitment: overrides.productionCommitment ?? null,
  };
}

function mockStore(
  overrides: Partial<StoreState> & { hydrated?: boolean; rehydrateResult?: Promise<void> | void } = {},
) {
  const storeState: StoreState = {
    configuration: createConfiguration(),
    activeQuoteId: null,
    ...overrides,
  };

  mockUseConfigurationStore.mockImplementation((selector: unknown) =>
    (selector as (value: StoreState) => unknown)(storeState),
  );
  mockUseConfigurationStore.persist.hasHydrated.mockReturnValue(overrides.hydrated ?? true);
  mockUseConfigurationStore.persist.rehydrate.mockReturnValue(overrides.rehydrateResult);

  return storeState;
}

function mockTrpc(
  overrides: Partial<{
    quote: SavedQuote | null;
    quoteLoading: boolean;
    quoteError: Error | null;
    mutationData: SavedQuote | null;
    mutationPending: boolean;
    mutationError: Error | null;
  }> = {},
) {
  const mutate = jest.fn();
  const invalidate = jest.fn();

  mockUseUtils.mockReturnValue({
    quote: {
      getById: { invalidate },
      list: { invalidate },
      getLatest: { invalidate },
    },
  });
  mockUseQuoteQuery.mockReturnValue({
    data: overrides.quote ?? null,
    isLoading: overrides.quoteLoading ?? false,
    error: overrides.quoteError ?? null,
  });
  mockUseCommitMutation.mockImplementation(() => ({
    mutate,
    data: overrides.mutationData ?? null,
    isPending: overrides.mutationPending ?? false,
    error: overrides.mutationError ?? null,
  }));

  return { mutate };
}

async function renderPage() {
  const { OrderSummaryPage } = await import("@/components/configurator/order-summary-page");
  render(<OrderSummaryPage />);
}

describe("OrderSummaryPage", () => {
  beforeEach(() => {
    mockUseQuoteQuery.mockReset();
    mockUseCommitMutation.mockReset();
    mockUseUtils.mockReset();
    mockUseConfigurationStore.mockReset();
    mockUseConfigurationStore.persist.hasHydrated.mockReset();
    mockUseConfigurationStore.persist.rehydrate.mockReset();
  });

  it("shows a loading shell while persisted state is rehydrating", async () => {
    mockStore({ hydrated: false, rehydrateResult: new Promise<void>(() => {}) });
    mockTrpc();

    await renderPage();

    expect(screen.getByText("Loading order summary")).toBeTruthy();
    expect(screen.getByText("Restoring your saved build details.")).toBeTruthy();
  });

  it("shows the empty-state shell when there is no saved model in the store", async () => {
    mockStore({
      configuration: createConfiguration({ modelId: null, engineId: null, transmissionId: null, trimId: null }),
      activeQuoteId: null,
    });
    mockTrpc();

    await renderPage();

    expect(screen.getByText("No saved build found")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Go to configurator" })).toBeTruthy();
  });

  it("requires the commitment checkbox before confirming production commitment", async () => {
    const quote = createQuote({ id: "quote-open", productionCommitment: null });
    const { mutate } = mockTrpc({ quote });

    mockStore({ configuration: quote.configuration, activeQuoteId: quote.id });
    await renderPage();

    expect(screen.getByText("Production commitment summary")).toBeTruthy();
    expect(screen.getByText(quote.id)).toBeTruthy();

    const checkbox = screen.getByRole("checkbox");
    const button = screen.getByRole("button", { name: "Confirm production commitment" }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    fireEvent.click(checkbox);
    expect(button.disabled).toBe(false);
    fireEvent.click(button);

    expect(mutate).toHaveBeenCalledWith({ id: quote.id });
  });

  it("renders the confirmation card when the order is already committed", async () => {
    const quote = createQuote({
      id: "order-committed",
      productionCommitment: { committedAt: "2026-03-02T14:30:00.000Z" },
    });

    mockStore({ configuration: quote.configuration, activeQuoteId: quote.id });
    mockTrpc({ quote });

    await renderPage();

    expect(screen.getByText("Order Confirmation")).toBeTruthy();
    expect(screen.getByText("Factory scheduling")).toBeTruthy();
    expect(screen.getByText(formatCurrency(quote.price.totalPrice))).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to configurator" })).toBeTruthy();
  });
});