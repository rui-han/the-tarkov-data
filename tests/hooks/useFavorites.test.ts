import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  FavoriteLimitError,
  favoriteErrorMessage,
  useFavorites,
} from "@/hooks/useFavorites";

const fetchMock = vi.fn();

const response = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("loadFavorites", () => {
  it("stores the list and marks it loaded", async () => {
    fetchMock.mockResolvedValueOnce(
      response([{ itemId: "a" }, { itemId: "b" }]),
    );
    const { result } = renderHook(() => useFavorites());

    await act(async () => {
      expect(await result.current.loadFavorites()).toBe(true);
    });

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.loadFailed).toBe(false);
    expect([...result.current.favoriteIds]).toEqual(["a", "b"]);
  });

  it("never stores an error body", async () => {
    fetchMock.mockResolvedValueOnce(response({ error: "Too many requests" }));
    const { result } = renderHook(() => useFavorites());

    await act(async () => {
      expect(await result.current.loadFavorites()).toBe(false);
    });

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.loadFailed).toBe(true);
    expect(result.current.favoriteIds.size).toBe(0);
  });

  it("treats a non-2xx status as a failure", async () => {
    fetchMock.mockResolvedValueOnce(response({ error: "Unauthorized" }, 401));
    const { result } = renderHook(() => useFavorites());

    await act(async () => {
      await result.current.loadFavorites();
    });
    expect(result.current.loadFailed).toBe(true);
  });
});

describe("addFavorite / removeFavorite", () => {
  it("adds optimistically and keeps it on success", async () => {
    let finish!: (value: unknown) => void;
    fetchMock.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
    const { result } = renderHook(() => useFavorites());

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.addFavorite("a");
    });
    // visible before the request completes
    expect(result.current.favoriteIds.has("a")).toBe(true);

    await act(async () => {
      finish(response({ success: true }, 201));
      await pending;
    });
    expect(result.current.favoriteIds.has("a")).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/users/ammo/add-favorite-ammo",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("rolls an add back when the request fails", async () => {
    fetchMock.mockResolvedValueOnce(response({}, 500));
    const { result } = renderHook(() => useFavorites());

    await act(async () => {
      await expect(result.current.addFavorite("a")).rejects.toThrow();
    });
    expect(result.current.favoriteIds.has("a")).toBe(false);
  });

  it("throws a FavoriteLimitError with the server message on 409", async () => {
    fetchMock.mockResolvedValueOnce(
      response({ error: "You can favorite up to 200 items" }, 409),
    );
    const { result } = renderHook(() => useFavorites());

    let caught: unknown;
    await act(async () => {
      caught = await result.current.addFavorite("a").catch((e) => e);
    });

    expect(caught).toBeInstanceOf(FavoriteLimitError);
    expect(favoriteErrorMessage(caught)).toBe(
      "You can favorite up to 200 items",
    );
    expect(result.current.favoriteIds.has("a")).toBe(false);
  });

  it("removes optimistically and restores the item on failure", async () => {
    fetchMock.mockResolvedValueOnce(response([{ itemId: "a" }]));
    const { result } = renderHook(() => useFavorites());
    await act(async () => {
      await result.current.loadFavorites();
    });

    fetchMock.mockResolvedValueOnce(response({}, 500));
    await act(async () => {
      await expect(result.current.removeFavorite("a")).rejects.toThrow();
    });
    expect(result.current.favoriteIds.has("a")).toBe(true);

    fetchMock.mockResolvedValueOnce(response({ success: true }));
    await act(async () => {
      await result.current.removeFavorite("a");
    });
    expect(result.current.favoriteIds.has("a")).toBe(false);
  });

  it("does not drop an existing favorite when re-adding it fails", async () => {
    fetchMock.mockResolvedValueOnce(response([{ itemId: "a" }]));
    const { result } = renderHook(() => useFavorites());
    await act(async () => {
      await result.current.loadFavorites();
    });

    fetchMock.mockResolvedValueOnce(response({}, 500));
    await act(async () => {
      await expect(result.current.addFavorite("a")).rejects.toThrow();
    });
    expect(result.current.favoriteIds.has("a")).toBe(true);
  });
});

describe("toggleFavorite", () => {
  it("resolves to the new favorite state", async () => {
    fetchMock.mockResolvedValue(response({ success: true }));
    const { result } = renderHook(() => useFavorites());

    let first = false;
    let second = true;
    await act(async () => {
      first = await result.current.toggleFavorite("a");
    });
    await act(async () => {
      second = await result.current.toggleFavorite("a");
    });

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(result.current.favoriteIds.has("a")).toBe(false);
  });
});

describe("favoriteErrorMessage", () => {
  it("hides raw errors behind a generic message", () => {
    expect(
      favoriteErrorMessage(new Error("Failed to add favorite (500)")),
    ).toBe("Failed to update favorite status, please try again");
  });
});
