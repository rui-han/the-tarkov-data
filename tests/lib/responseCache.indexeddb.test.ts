import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The module keeps its database connection in a variable, so every test gets a
// fresh copy of it and an empty database.
async function freshCache() {
  vi.resetModules();
  (globalThis as any).indexedDB = new IDBFactory();
  return import("@/lib/responseCache");
}

const T0 = 1_000_000_000_000;

describe("responseCache (IndexedDB)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("saves a response and loads it back", async () => {
    const cache = await freshCache();

    await cache.saveCached("regular/items", '{"data":1}', T0);

    expect(await cache.hasCached("regular/items", T0)).toBe(true);
    expect(await cache.loadCached("regular/items", T0)).toEqual({
      savedAt: T0,
      text: '{"data":1}',
    });
    expect(await cache.hasCached("regular/tasks", T0)).toBe(false);
  });

  it("skips the write when a copy was saved recently, then replaces it", async () => {
    const cache = await freshCache();

    await cache.saveCached("regular/items", "old", T0);
    await cache.saveCached("regular/items", "new", T0 + 1000);
    expect((await cache.loadCached("regular/items", T0 + 1000))?.text).toBe(
      "old",
    );

    const later = T0 + cache.MIN_SAVE_INTERVAL_MS;
    await cache.saveCached("regular/items", "new", later);
    expect(await cache.loadCached("regular/items", later)).toEqual({
      savedAt: later,
      text: "new",
    });
  });

  it("does not count an expired copy", async () => {
    const cache = await freshCache();

    await cache.saveCached("regular/items", "x", T0);

    expect(
      await cache.hasCached("regular/items", T0 + cache.MAX_CACHE_AGE_MS),
    ).toBe(true);
    expect(
      await cache.hasCached("regular/items", T0 + cache.MAX_CACHE_AGE_MS + 1),
    ).toBe(false);
  });

  it("deletes expired copies and keeps recent ones", async () => {
    const cache = await freshCache();

    await cache.saveCached("old", "x", T0);
    await cache.saveCached("recent", "y", T0 + cache.MAX_CACHE_AGE_MS);

    await cache.pruneExpired(T0 + cache.MAX_CACHE_AGE_MS + 10);

    // asked "as of" T0 + 1, so a copy that still existed would be usable:
    // null means it was really deleted
    expect(await cache.loadCached("old", T0 + 1)).toBeNull();
    expect(
      (await cache.loadCached("recent", T0 + cache.MAX_CACHE_AGE_MS))?.text,
    ).toBe("y");
  });
});
