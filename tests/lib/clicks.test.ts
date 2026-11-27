import { describe, it, expect } from "vitest";
import { isPlainLeftClick } from "@/lib/clicks";

const click = (overrides: Record<string, unknown> = {}) => ({
  defaultPrevented: false,
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  ...overrides,
});

describe("isPlainLeftClick", () => {
  it("accepts a plain left click", () => {
    expect(isPlainLeftClick(click())).toBe(true);
  });

  it("leaves new-tab style clicks to the browser", () => {
    expect(isPlainLeftClick(click({ metaKey: true }))).toBe(false);
    expect(isPlainLeftClick(click({ ctrlKey: true }))).toBe(false);
    expect(isPlainLeftClick(click({ shiftKey: true }))).toBe(false);
    expect(isPlainLeftClick(click({ altKey: true }))).toBe(false);
    expect(isPlainLeftClick(click({ button: 1 }))).toBe(false);
    expect(isPlainLeftClick(click({ button: 2 }))).toBe(false);
  });

  it("ignores a click that something else already handled", () => {
    expect(isPlainLeftClick(click({ defaultPrevented: true }))).toBe(false);
  });
});
