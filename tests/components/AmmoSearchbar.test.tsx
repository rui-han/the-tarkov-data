import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AmmoSearchbar from "@/components/ammunition/AmmoSearchbar";

describe("AmmoSearchbar", () => {
  it("renders a search input with the expected label", () => {
    render(<AmmoSearchbar setInputText={() => {}} />);
    expect(
      screen.getByLabelText(/search for ammunition here/i),
    ).toBeInTheDocument();
  });

  it("calls setInputText with the current value as the user types", async () => {
    const setInputText = vi.fn();
    const user = userEvent.setup();

    render(<AmmoSearchbar setInputText={setInputText} />);
    const input = screen.getByLabelText(/search for ammunition here/i);

    await user.type(input, "m855");

    expect(setInputText).toHaveBeenCalled();
    // MUI's TextField fires onChange per keystroke; the last call should
    // reflect the fully typed value.
    expect(setInputText).toHaveBeenLastCalledWith("m855");
  });
});
