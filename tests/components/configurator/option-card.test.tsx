import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";

async function renderOptionCard(overrides: Partial<Parameters<typeof import("@/components/configurator/option-card").OptionCard>[0]> = {}) {
  const { OptionCard } = await import("@/components/configurator/option-card");
  const onClick = jest.fn();

  render(
    <OptionCard
      name="Technology Package"
      description="Adds advanced connectivity and automation."
      price={3000}
      isSelected={false}
      onClick={onClick}
      {...overrides}
    />,
  );

  return { onClick };
}

describe("OptionCard", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("shows Included for zero-priced options and custom labels when provided", async () => {
    await renderOptionCard({ name: "Standard Paint", price: 0 });
    expect(screen.getByText("Included")).toBeTruthy();

    document.body.innerHTML = "";

    await renderOptionCard({ name: "Lease special", price: 500, priceLabel: "Special offer" });
    expect(screen.getByText("Special offer")).toBeTruthy();
  });

  it("calls onClick for mouse, Enter, and Space interactions when enabled", async () => {
    const { onClick } = await renderOptionCard();
    const card = screen.getByRole("button", { name: /technology package/i });

    fireEvent.click(card);
    fireEvent.keyDown(card, { key: "Enter" });
    fireEvent.keyDown(card, { key: " " });

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("blocks interactions and shows the disabled reason when disabled", async () => {
    const { onClick } = await renderOptionCard({
      isDisabled: true,
      disabledReason: "Requires the sport trim.",
    });
    const card = screen.getByRole("button", { name: /technology package/i });

    fireEvent.click(card);
    fireEvent.keyDown(card, { key: "Enter" });

    expect(card.getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByText("Requires the sport trim.")).toBeTruthy();
    expect(onClick).not.toHaveBeenCalled();
  });
});