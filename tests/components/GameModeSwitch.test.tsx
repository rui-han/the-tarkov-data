import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GameModeSwitch from "@/components/navigation/GameModeSwitch";
import { GameModeProvider, STORAGE_KEY } from "@/contexts/GameModeContext";

const renderSwitch = () =>
  render(
    <GameModeProvider>
      <GameModeSwitch />
    </GameModeProvider>,
  );

beforeEach(() => window.localStorage.clear());

describe("GameModeSwitch", () => {
  it("asks for confirmation and only switches after Switch is clicked", async () => {
    const user = userEvent.setup();
    renderSwitch();

    await user.click(screen.getByRole("button", { name: "PvE" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Switch to PvE?");
    // nothing has changed yet
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();

    await user.click(screen.getByRole("button", { name: "Switch" }));
    await waitFor(() =>
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe("pve"),
    );
  });

  it("keeps the current mode when cancelled", async () => {
    const user = userEvent.setup();
    renderSwitch();

    await user.click(screen.getByRole("button", { name: "Season" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(screen.getByRole("button", { name: "PvP" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("does not ask when the current mode is clicked again", async () => {
    const user = userEvent.setup();
    renderSwitch();

    await user.click(screen.getByRole("button", { name: "PvP" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
