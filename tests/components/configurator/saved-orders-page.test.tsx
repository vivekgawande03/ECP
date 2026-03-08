import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { calculateConfigurationPrice } from "@/lib/configurator/pricing";
import { CURRENT_CONFIGURATION_VERSIONS } from "@/lib/configurator/versioning";
import type { Configuration, SavedQuote } from "@/lib/configurator/types";
import { formatCurrency } from "@/lib/utils";

const mockUseQuoteListQuery = jest.fn();
const mockUseConfigurationStore = jest.fn();

jest.mock("@/trpc/react", () => ({
  trpc: {
    quote: {
      list: {
        useQuery: mockUseQuoteListQuery,
      },
    },
  },
}));

jest.mock("@/store/configuration-store", () => ({
  useConfigurationStore: mockUseConfigurationStore,
}));

type StoreState = {
  activeQuoteId: string | null;
  applySavedQuote: (quote: SavedQuote) => void;
};

function createConfiguration(overrides: Partial<Configuration> = {}): Configuration {
  return {
    market: "us",
    dealer: "premium",
    modelId: "sedan-x",
    engineId: "petrol-3.0",
    transmissionId: "auto-8",
    trimId: "luxury",
    exteriorOptions: ["paint-midnight-black"],
    interiorOptions: ["interior-black-leather"],
    wheels: "wheels-19",
    packages: ["pkg-technology"],
    ...overrides,
  };
}

function createQuote(overrides: Partial<SavedQuote> = {}): SavedQuote {
  const configuration = overrides.configuration ?? createConfiguration();

  return {
    id: overrides.id ?? "order-1001",
    savedAt: overrides.savedAt ?? "2026-03-01T10:00:00.000Z",
    market: overrides.market ?? configuration.market,
    dealer: overrides.dealer ?? configuration.dealer,
    configuration,
    price: overrides.price ?? calculateConfigurationPrice(configuration),
    versions: overrides.versions ?? CURRENT_CONFIGURATION_VERSIONS,
    productionCommitment:
      overrides.productionCommitment === undefined
        ? { committedAt: "2026-03-02T14:30:00.000Z" }
        : overrides.productionCommitment,
  };
}

function mockStore(state: Partial<StoreState> = {}) {
  const storeState: StoreState = {
    activeQuoteId: null,
    applySavedQuote: jest.fn(),
    ...state,
  };

  mockUseConfigurationStore.mockImplementation((selector: unknown) =>
    (selector as (value: StoreState) => unknown)(storeState),
  );
  return storeState;
}

function mockQuery(overrides: Partial<{ data: SavedQuote[]; isLoading: boolean; error: Error | null }> = {}) {
  mockUseQuoteListQuery.mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
    ...overrides,
  });
}

async function renderPage() {
  const { SavedOrdersPage } = await import("@/components/configurator/saved-orders-page");
  render(<SavedOrdersPage />);
}

describe("SavedOrdersPage", () => {
  beforeEach(() => {
    mockUseQuoteListQuery.mockReset();
    mockUseConfigurationStore.mockReset();
  });

  it("shows a loading state while committed orders are being fetched", async () => {
    mockStore();
    mockQuery({ isLoading: true });

    await renderPage();

    expect(screen.getByText("Loading committed orders...")).toBeTruthy();
  });

  it("shows an error state when saved orders fail to load", async () => {
    mockStore();
    mockQuery({ error: new Error("boom") });

    await renderPage();

    expect(screen.getByText(/couldn’t load saved orders/i)).toBeTruthy();
  });

  it("shows the empty state when no committed orders exist", async () => {
    mockStore();
    mockQuery({
      data: [createQuote({ id: "quote-draft", productionCommitment: null })],
    });

    await renderPage();

    expect(screen.getByText("No saved orders yet")).toBeTruthy();
    expect(screen.queryByText("quote-draft")).toBeNull();
  });

  it("renders only committed orders and marks the active one", async () => {
    const activeOrder = createQuote({ id: "order-active" });

    mockStore({ activeQuoteId: activeOrder.id });
    mockQuery({
      data: [activeOrder, createQuote({ id: "quote-draft", productionCommitment: null })],
    });

    await renderPage();

    expect(screen.getByText("order-active")).toBeTruthy();
    expect(screen.queryByText("quote-draft")).toBeNull();
    expect(screen.getByText("Orders available")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("Sedan X • United States • Premium Dealer")).toBeTruthy();
    expect(screen.getByText(formatCurrency(activeOrder.price.totalPrice))).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open current order" })).toBeTruthy();
  });

  it("loads a committed order into the store before opening its summary", async () => {
    const order = createQuote({ id: "order-open" });
    const { applySavedQuote } = mockStore();
    mockQuery({ data: [order] });

    await renderPage();
    fireEvent.click(screen.getByRole("link", { name: "Open order summary" }));

    expect(applySavedQuote).toHaveBeenCalledWith(order);
  });
});