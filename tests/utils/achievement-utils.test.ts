import { describe, it, expect } from "vitest";
import {
  createChipStyle,
  rarityTheme,
  sideTheme,
} from "@/utils/achievement-utils";

describe("createChipStyle", () => {
  it("returns the matching theme color for a known key", () => {
    const style = createChipStyle(rarityTheme, "legendary");
    expect(style.backgroundColor).toBe(rarityTheme.legendary.bg);
    expect(style.color).toBe(rarityTheme.legendary.color);
  });

  it("is case-insensitive when matching keys", () => {
    const style = createChipStyle(sideTheme, "PMC");
    expect(style.backgroundColor).toBe(sideTheme.pmc.bg);
  });

  it("falls back to a default style for unknown keys", () => {
    const style = createChipStyle(rarityTheme, "unknown-rarity");
    expect(style.backgroundColor).toBe("#333");
    expect(style.color).toBe("#bbb");
  });

  it("always includes the base border style", () => {
    const style = createChipStyle(rarityTheme, "common");
    expect(style.border).toBe("1px solid #555");
  });
});
