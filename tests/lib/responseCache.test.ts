import { describe, it, expect } from "vitest";
import {
  MAX_CACHE_AGE_MS,
  hasCached,
  isUsable,
  loadCached,
  saveCached,
} from "@/lib/responseCache";

describe("isUsable", () => {
  const now = 1_000_000_000_000;

  it("accepts a recent entry", () => {
    expect(isUsable({ savedAt: now - 1000, text: "{}" }, now)).toBe(true);
  });

  it("rejects malformed entries", () => {
    expect(isUsable(null, now)).toBe(false);
    expect(isUsable("text", now)).toBe(false);
    expect(isUsable({ savedAt: now }, now)).toBe(false);
    expect(isUsable({ savedAt: "x", text: "{}" }, now)).toBe(false);
    expect(isUsable({ savedAt: now, text: "" }, now)).toBe(false);
  });

  it("rejects copies older than the maximum age", () => {
    expect(isUsable({ savedAt: now - MAX_CACHE_AGE_MS, text: "{}" }, now)).toBe(
      true,
    );
    expect(
      isUsable({ savedAt: now - MAX_CACHE_AGE_MS - 1, text: "{}" }, now),
    ).toBe(false);
  });
});

describe("without IndexedDB", () => {
  it("never throws and reports nothing saved", async () => {
    await expect(saveCached("regular/items", "{}")).resolves.toBeUndefined();
    await expect(loadCached("regular/items")).resolves.toBeNull();
    await expect(hasCached("regular/items")).resolves.toBe(false);
  });
});
