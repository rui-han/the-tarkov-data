import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AmmoTableFilter from "@/components/ammunition/AmmoTableFilter";

const round = (caliber: string, ammoType = "bullet") =>
  ({ caliber, ammoType } as any);

const ammo = [
  round("Caliber556x45NATO"),
  round("Caliber556x45NATO"),
  round("Caliber762x39"),
  round("Caliber12g", "buckshot"),
  round("Caliber40x46", "grenade"),
  round(""), // no caliber: no button
];

describe("AmmoTableFilter", () => {
  it("lists every caliber with its count, bullets and others alike", () => {
    render(
      <AmmoTableFilter
        ammo={ammo}
        currentCaliber=""
        onFilterButtonClick={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "556x45 NATO (2)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "762x39 (1)" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "12g (1)" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "40x46 (1)" }),
    ).toBeInTheDocument();
    // "All calibers" plus the four calibers above
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("selects a caliber and clears it when it is clicked again", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <AmmoTableFilter
        ammo={ammo}
        currentCaliber=""
        onFilterButtonClick={onClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: "762x39 (1)" }));
    expect(onClick).toHaveBeenLastCalledWith("Caliber762x39");

    rerender(
      <AmmoTableFilter
        ammo={ammo}
        currentCaliber="Caliber762x39"
        onFilterButtonClick={onClick}
      />,
    );
    expect(screen.getByRole("button", { name: "762x39 (1)" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "762x39 (1)" }));
    expect(onClick).toHaveBeenLastCalledWith("");
  });

  it("clears the filter with the All calibers chip", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <AmmoTableFilter
        ammo={ammo}
        currentCaliber="Caliber12g"
        onFilterButtonClick={onClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: "All calibers" }));
    expect(onClick).toHaveBeenLastCalledWith("");
  });
});
