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

describe("AmmoSearchbar clear and controlled modes", () => {
  it("shows a clear button once there is text and clears on click", async () => {
    const setInputText = vi.fn();
    const user = userEvent.setup();

    render(<AmmoSearchbar setInputText={setInputText} />);
    expect(
      screen.queryByRole("button", { name: /clear search/i }),
    ).not.toBeInTheDocument();

    const input = screen.getByLabelText(/search for ammunition here/i);
    await user.type(input, "m855");
    await user.click(screen.getByRole("button", { name: /clear search/i }));

    expect(setInputText).toHaveBeenLastCalledWith("");
    expect(input).toHaveValue("");
  });

  it("clears with the Escape key", async () => {
    const setInputText = vi.fn();
    const user = userEvent.setup();

    render(<AmmoSearchbar setInputText={setInputText} />);
    const input = screen.getByLabelText(/search for ammunition here/i);
    await user.type(input, "m855{Escape}");

    expect(setInputText).toHaveBeenLastCalledWith("");
    expect(input).toHaveValue("");
  });

  it("shows the value passed by the parent", () => {
    const { rerender } = render(
      <AmmoSearchbar setInputText={() => {}} value="m995" />,
    );
    const input = screen.getByLabelText(/search for ammunition here/i);
    expect(input).toHaveValue("m995");

    rerender(<AmmoSearchbar setInputText={() => {}} value="" />);
    expect(input).toHaveValue("");
  });
});
