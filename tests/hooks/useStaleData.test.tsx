import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { GameModeProvider } from "@/contexts/GameModeContext";
import { isStaleKey, useStaleData } from "@/hooks/useStaleData";
import { markFresh, markStale, resetStale } from "@/lib/cacheStatus";

const wrapper = ({ children }: { children: ReactNode }) => (
  <GameModeProvider>{children}</GameModeProvider>
);

beforeEach(() => {
  window.localStorage.clear();
  resetStale();
});

describe("useStaleData", () => {
  it("reports saved copies in use and clears when fresh data arrives", () => {
    const { result } = renderHook(() => useStaleData(), { wrapper });
    expect(result.current).toEqual({ count: 0, savedAt: null });

    act(() =>
      markStale("regular/items", {
        savedAt: 500,
        gameMode: "regular",
        lang: null,
      }),
    );
    expect(result.current).toEqual({ count: 1, savedAt: 500 });

    act(() => markFresh("regular/items"));
    expect(result.current.count).toBe(0);
  });

  it("ignores copies that belong to another game mode", () => {
    const { result } = renderHook(() => useStaleData(), { wrapper });
    act(() =>
      markStale("pve/items", { savedAt: 500, gameMode: "pve", lang: null }),
    );
    expect(result.current.count).toBe(0);
  });
});

describe("isStaleKey", () => {
  it("matches SWR keys of requests served from a saved copy", () => {
    markStale("regular/items", { savedAt: 1, gameMode: "regular", lang: null });
    markStale("regular/tasks_en", {
      savedAt: 1,
      gameMode: "regular",
      lang: "en",
    });

    expect(isStaleKey(["items", "regular", null])).toBe(true);
    expect(isStaleKey(["tasks", "regular", "en"])).toBe(true);
    expect(isStaleKey(["items", "pve", null])).toBe(false);
    expect(isStaleKey(["hideout", "regular", null])).toBe(false);
    expect(isStaleKey("items")).toBe(false);
    expect(isStaleKey(null)).toBe(false);
  });
});
