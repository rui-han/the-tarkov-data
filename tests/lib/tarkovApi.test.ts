import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/responseCache", () => ({
  hasCached: vi.fn(),
  loadCached: vi.fn(),
  saveCached: vi.fn(),
}));

import { hasCached, loadCached, saveCached } from "@/lib/responseCache";
import { getStaleEntries, isStale, resetStale } from "@/lib/cacheStatus";
import {
  REQUEST_TIMEOUT_MS,
  TarkovFetchError,
  canUseSavedCopy,
  fetchTarkovJson,
  tarkovPath,
} from "@/lib/tarkovApi";

const fetchMock = vi.fn();

const textResponse = (body: string, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => body,
});

const saved = (data: unknown, savedAt = 123) => ({
  savedAt,
  text: JSON.stringify({ data }),
});

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(hasCached).mockReset().mockResolvedValue(true);
  vi.mocked(loadCached).mockReset().mockResolvedValue(null);
  vi.mocked(saveCached).mockReset().mockResolvedValue(undefined);
  resetStale();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("tarkovPath", () => {
  it("builds the path from mode, endpoint and language", () => {
    expect(tarkovPath("items")).toBe("regular/items");
    expect(tarkovPath("tasks", "pve", "en")).toBe("pve/tasks_en");
    expect(tarkovPath("status", "pve")).toBe("status");
  });
});

describe("fetchTarkovJson", () => {
  it("unwraps the data envelope and saves the response", async () => {
    const body = JSON.stringify({ data: { a: 1 } });
    fetchMock.mockResolvedValueOnce(textResponse(body));

    await expect(fetchTarkovJson("items")).resolves.toEqual({ a: 1 });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://json.tarkov.dev/regular/items",
    );
    expect(saveCached).toHaveBeenCalledWith("regular/items", body);
  });

  it("requests the translation file of the chosen mode", async () => {
    fetchMock.mockResolvedValueOnce(textResponse("{}"));
    await fetchTarkovJson("tasks", { gameMode: "pve", lang: "en" });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://json.tarkov.dev/pve/tasks_en",
    );
  });

  it("falls back to the saved copy on a network error", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    vi.mocked(loadCached).mockResolvedValueOnce(saved({ items: {} }, 123));

    await expect(fetchTarkovJson("items")).resolves.toEqual({ items: {} });
    expect(isStale("regular/items")).toBe(true);
    expect(getStaleEntries().get("regular/items")).toEqual({
      savedAt: 123,
      gameMode: "regular",
      lang: null,
    });
  });

  it("falls back on a server error", async () => {
    fetchMock.mockResolvedValueOnce(textResponse("oops", 503));
    vi.mocked(loadCached).mockResolvedValueOnce(saved({ ok: true }));

    await expect(fetchTarkovJson("items")).resolves.toEqual({ ok: true });
    expect(isStale("regular/items")).toBe(true);
  });

  it("falls back when the response is not valid JSON", async () => {
    fetchMock.mockResolvedValueOnce(textResponse("<html>bad gateway</html>"));
    vi.mocked(loadCached).mockResolvedValueOnce(saved({ ok: true }));

    await expect(fetchTarkovJson("items")).resolves.toEqual({ ok: true });
  });

  it("does not use the saved copy for a 404", async () => {
    fetchMock.mockResolvedValueOnce(textResponse("nope", 404));
    vi.mocked(loadCached).mockResolvedValue(saved({ ok: true }));

    await expect(
      fetchTarkovJson("items", { gameMode: "pvp-season" }),
    ).rejects.toThrow(/404/);
    expect(loadCached).not.toHaveBeenCalled();
    expect(isStale("pvp-season/items")).toBe(false);
  });

  it("rethrows the original error when nothing was saved", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    await expect(fetchTarkovJson("items")).rejects.toThrow("fetch failed");
  });

  it("rethrows the original error when the saved copy is corrupt", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    vi.mocked(loadCached).mockResolvedValueOnce({
      savedAt: 1,
      text: "{not json",
    });

    await expect(fetchTarkovJson("items")).rejects.toThrow("fetch failed");
    expect(isStale("regular/items")).toBe(false);
  });

  it("clears the stale flag once the API answers again", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    vi.mocked(loadCached).mockResolvedValueOnce(saved({ old: true }));
    await fetchTarkovJson("items");
    expect(isStale("regular/items")).toBe(true);

    fetchMock.mockResolvedValueOnce(
      textResponse(JSON.stringify({ data: { fresh: true } })),
    );
    await expect(fetchTarkovJson("items")).resolves.toEqual({ fresh: true });
    expect(isStale("regular/items")).toBe(false);
  });

  it("never saves or falls back for the status endpoint", async () => {
    fetchMock.mockResolvedValueOnce(textResponse(JSON.stringify({ data: {} })));
    await fetchTarkovJson("status");
    expect(saveCached).not.toHaveBeenCalled();

    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    await expect(fetchTarkovJson("status")).rejects.toThrow("fetch failed");
    expect(loadCached).not.toHaveBeenCalled();
  });

  it("gives up on a hung request when a saved copy exists", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_, reject) => {
          init.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );
    vi.mocked(loadCached).mockResolvedValueOnce(saved({ ok: true }));

    const promise = fetchTarkovJson("items");
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS + 1);

    await expect(promise).resolves.toEqual({ ok: true });
    expect(isStale("regular/items")).toBe(true);
  });

  it("keeps waiting when there is no saved copy to show", async () => {
    vi.useFakeTimers();
    vi.mocked(hasCached).mockResolvedValue(false);
    fetchMock.mockImplementation(() => new Promise(() => {}));

    let settled = false;
    fetchTarkovJson("items").then(
      () => (settled = true),
      () => (settled = true),
    );
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS * 3);

    expect(settled).toBe(false);
  });
});

describe("canUseSavedCopy", () => {
  it("treats outages as fallback-worthy, definite answers as not", () => {
    expect(canUseSavedCopy(new TypeError("fetch failed"))).toBe(true);
    expect(canUseSavedCopy(new SyntaxError("bad json"))).toBe(true);
    expect(canUseSavedCopy(new TarkovFetchError("x", 500))).toBe(true);
    expect(canUseSavedCopy(new TarkovFetchError("x", 503))).toBe(true);
    expect(canUseSavedCopy(new TarkovFetchError("x", 429))).toBe(true);
    expect(canUseSavedCopy(new TarkovFetchError("x", 404))).toBe(false);
    expect(canUseSavedCopy(new TarkovFetchError("x", 403))).toBe(false);
  });
});
