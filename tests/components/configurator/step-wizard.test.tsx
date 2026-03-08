import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { calculateConfigurationPrice } from "@/lib/configurator/pricing";
import { CURRENT_CONFIGURATION_VERSIONS } from "@/lib/configurator/versioning";
import type { Configuration, SavedQuote } from "@/lib/configurator/types";

const mockUseQuoteListQuery = jest.fn();
const mockUseActiveQuoteQuery = jest.fn();
const mockUseConfigurationStore = jest.fn();

jest.mock("@/trpc/react", () => ({
  trpc: {
    quote: {
      list: {
        useQuery: mockUseQuoteListQuery,
      },
      getById: {
        useQuery: mockUseActiveQuoteQuery,
      },
    },
  },
}));

jest.mock("@/store/configuration-store", () => ({
  useConfigurationStore: mockUseConfigurationStore,
}));

jest.mock("@/components/configurator/progress-stepper", () => ({
  ProgressStepper: ({ currentStep }: { currentStep: number }) => <div data-testid="progress-stepper">step-{currentStep}</div>,
}));

type StoreState = {
  currentStep: number;
  nextStep: () => void;
  previousStep: () => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
  isStepValid: () => boolean;
  activeQuoteId: string | null;
  isLoadedSavedQuote: boolean;
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
    exteriorOptions: ["paint-pearl-white"],
    interiorOptions: [],
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

function mockStore(overrides: Partial<StoreState> = {}) {
  const nextStep = jest.fn();
  const previousStep = jest.fn();
  const setCurrentStep = jest.fn();
  const reset = jest.fn();
  const applySavedQuote = jest.fn();

  const storeState: StoreState = {
    currentStep: 0,
    nextStep,
    previousStep,
    setCurrentStep,
    reset,
    isStepValid: () => true,
    activeQuoteId: null,
    isLoadedSavedQuote: false,
    applySavedQuote,
    ...overrides,
  };

  mockUseConfigurationStore.mockImplementation((selector: unknown) =>
    (selector as (value: StoreState) => unknown)(storeState),
  );

  return { applySavedQuote, storeState };
}

function mockQueries(
  overrides: Partial<{ data: SavedQuote[]; isLoading: boolean; error: Error | null; activeQuote: SavedQuote | null }> = {},
) {
  mockUseQuoteListQuery.mockReturnValue({ data: [], isLoading: false, error: null, ...overrides });
  mockUseActiveQuoteQuery.mockReturnValue({ data: overrides.activeQuote ?? null, isLoading: false, error: null });
}

async function renderWizard() {
  const { StepWizard } = await import("@/components/configurator/step-wizard");

  render(
    <StepWizard
      steps={[
        { label: "Choose model", content: <div>Model step</div> },
        { label: "Choose powertrain", content: <div>Powertrain step</div> },
        { label: "Review", content: <div>Review step</div> },
      ]}
    />,
  );
}

describe("StepWizard", () => {
  beforeEach(() => {
    mockUseQuoteListQuery.mockReset();
    mockUseActiveQuoteQuery.mockReset();
    mockUseConfigurationStore.mockReset();
  });

  it("shows Place order for a loaded quote that is not yet committed", async () => {
    const quote = createQuote({ id: "quote-open" });

    mockStore({ currentStep: 2, isLoadedSavedQuote: true, activeQuoteId: quote.id });
    mockQueries({ data: [quote] });
    await renderWizard();

    expect(screen.getByRole("link", { name: "Place order" })).toBeTruthy();
  });

  it("shows View order summary for a committed saved order", async () => {
    const quote = createQuote({
      id: "order-committed",
      productionCommitment: { committedAt: "2026-03-02T14:30:00.000Z" },
    });

    mockStore({ currentStep: 2, isLoadedSavedQuote: true, activeQuoteId: quote.id });
    mockQueries({ data: [quote] });
    await renderWizard();

    expect(screen.getByRole("link", { name: "View order summary" })).toBeTruthy();
  });

  it("shows Complete configuration for a new build on the last step", async () => {
    mockStore({ currentStep: 2, isLoadedSavedQuote: false });
    mockQueries();
    await renderWizard();

    expect(screen.getByRole("button", { name: "Complete configuration" })).toBeTruthy();
  });

  it("shows a loading state when the saved quotes panel is opened during fetch", async () => {
    mockStore();
    mockQueries({ isLoading: true, data: [] });
    await renderWizard();

    fireEvent.click(screen.getByRole("button", { name: /saved quotes/i }));

    expect(screen.getByText("Loading persisted quotes...")).toBeTruthy();
  });

  it("loads a recent saved quote from the header panel", async () => {
    const quote = createQuote({ id: "quote-recent" });
    const { applySavedQuote } = mockStore();

    mockQueries({ data: [quote] });
    await renderWizard();

    fireEvent.click(screen.getByRole("button", { name: /saved quotes/i }));
    fireEvent.click(screen.getByRole("button", { name: /quote-recent/i }));

    expect(applySavedQuote).toHaveBeenCalledWith(quote);
    expect(screen.queryByText("Loading persisted quotes...")).toBeNull();
  });
});