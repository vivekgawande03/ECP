import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

jest.mock("@/components/configurator/car-configurator-page", () => ({
  CarConfiguratorPage: () => <div>car-configurator-page</div>,
}));

jest.mock("@/components/configurator/order-summary-page", () => ({
  OrderSummaryPage: () => <div>order-summary-page</div>,
}));

jest.mock("@/components/configurator/saved-orders-page", () => ({
  SavedOrdersPage: () => <div>saved-orders-page</div>,
}));

describe("app route wrappers", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the configurator page from the home route", async () => {
    const { default: HomePage } = await import("../../app/page");

    render(<HomePage />);

    expect(screen.getByText("car-configurator-page")).toBeTruthy();
  });

  it("renders the order summary page from the order summary route", async () => {
    const { default: OrderSummaryRoute } = await import("../../app/order-summary/page");

    render(<OrderSummaryRoute />);

    expect(screen.getByText("order-summary-page")).toBeTruthy();
  });

  it("renders the saved orders page from the saved orders route", async () => {
    const { default: SavedOrdersRoute } = await import("../../app/saved-orders/page");

    render(<SavedOrdersRoute />);

    expect(screen.getByText("saved-orders-page")).toBeTruthy();
  });
});