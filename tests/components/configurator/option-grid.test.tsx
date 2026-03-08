import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

describe("OptionGrid", () => {
  it("renders the default responsive two-column layout", async () => {
    const { OptionGrid } = await import("@/components/configurator/option-grid");
    const { container } = render(
      <OptionGrid>
        <div>Option one</div>
      </OptionGrid>,
    );
    const grid = container.firstElementChild as HTMLElement | null;

    expect(screen.getByText("Option one")).toBeTruthy();
    expect(grid?.className).toContain("grid");
    expect(grid?.className).toContain("gap-3");
    expect(grid?.className).toContain("grid-cols-1");
    expect(grid?.className).toContain("md:grid-cols-2");
  });

  it("applies the requested column count and custom classes", async () => {
    const { OptionGrid } = await import("@/components/configurator/option-grid");
    const { container } = render(
      <OptionGrid columns={3} className="custom-grid">
        <div>Option two</div>
      </OptionGrid>,
    );
    const grid = container.firstElementChild as HTMLElement | null;

    expect(screen.getByText("Option two")).toBeTruthy();
    expect(grid?.className).toContain("grid-cols-1");
    expect(grid?.className).toContain("md:grid-cols-2");
    expect(grid?.className).toContain("xl:grid-cols-3");
    expect(grid?.className).toContain("custom-grid");
  });
});