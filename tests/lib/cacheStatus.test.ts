import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getStaleEntries,
  isStale,
  markFresh,
  markStale,
  resetStale,
  subscribeStale,
  summarizeStale,
} from "@/lib/cacheStatus";

const entry = (
  savedAt: number,
  gameMode = "regular",
  lang: string | null = null,
) => ({
  savedAt,
  gameMode,
  lang,
});

beforeEach(() => resetStale());

describe("markStale / markFresh", () => {
  it("tracks which paths use a saved copy", () => {
    markStale("regular/items", entry(1000));
    expect(isStale("regular/items")).toBe(true);
    expect(isStale("regular/tasks")).toBe(false);

    markFresh("regular/items");
    expect(isStale("regular/items")).toBe(false);
  });

  it("only notifies subscribers when something changed", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeStale(listener);

    markStale("regular/items", entry(1000));
    expect(listener).toHaveBeenCalledTimes(1);

    markStale("regular/items", entry(1000)); // same copy again
    markFresh("regular/tasks"); // was never stale
    expect(listener).toHaveBeenCalledTimes(1);

    markFresh("regular/items");
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    markStale("regular/items", entry(2000));
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("keeps the snapshot identity until something changes", () => {
    const before = getStaleEntries();
    markFresh("nothing/here");
    expect(getStaleEntries()).toBe(before);
    markStale("regular/items", entry(1000));
    expect(getStaleEntries()).not.toBe(before);
  });
});

describe("summarizeStale", () => {
  beforeEach(() => {
    markStale("regular/items", entry(3000, "regular"));
    markStale("pve/tasks", entry(2000, "pve"));
    markStale("regular/items_en", entry(1000, "regular", "en"));
  });

  it("counts the mode's own entries plus the dictionaries", () => {
    expect(summarizeStale(getStaleEntries(), "regular")).toEqual({
      count: 2,
      savedAt: 1000,
    });
    expect(summarizeStale(getStaleEntries(), "pve")).toEqual({
      count: 2,
      savedAt: 1000,
    });
    expect(summarizeStale(getStaleEntries(), "pvp-season")).toEqual({
      count: 1,
      savedAt: 1000,
    });
  });

  it("is empty when nothing is stale", () => {
    resetStale();
    expect(summarizeStale(getStaleEntries(), "regular")).toEqual({
      count: 0,
      savedAt: null,
    });
  });
});
