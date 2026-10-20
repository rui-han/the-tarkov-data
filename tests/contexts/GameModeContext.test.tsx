import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  GameModeProvider,
  STORAGE_KEY,
  useGameMode,
} from "@/contexts/GameModeContext";
import { isGameMode } from "@/lib/tarkovApi";

const wrapper = ({ children }: { children: ReactNode }) => (
  <GameModeProvider>{children}</GameModeProvider>
);

beforeEach(() => window.localStorage.clear());

describe("isGameMode", () => {
  it("accepts only the three known modes", () => {
    expect(isGameMode("regular")).toBe(true);
    expect(isGameMode("pve")).toBe(true);
    expect(isGameMode("pvp-season")).toBe(true);
    expect(isGameMode("pvp")).toBe(false);
    expect(isGameMode(null)).toBe(false);
  });
});

describe("GameModeProvider", () => {
  it("defaults to regular and becomes ready after mount", () => {
    const { result } = renderHook(() => useGameMode(), { wrapper });
    expect(result.current.gameMode).toBe("regular");
    expect(result.current.isReady).toBe(true);
  });

  it("restores the saved mode", () => {
    window.localStorage.setItem(STORAGE_KEY, "pve");
    const { result } = renderHook(() => useGameMode(), { wrapper });
    expect(result.current.gameMode).toBe("pve");
  });

  it("ignores an unknown saved value", () => {
    window.localStorage.setItem(STORAGE_KEY, "nonsense");
    const { result } = renderHook(() => useGameMode(), { wrapper });
    expect(result.current.gameMode).toBe("regular");
  });

  it("persists changes", () => {
    const { result } = renderHook(() => useGameMode(), { wrapper });
    act(() => result.current.setGameMode("pvp-season"));
    expect(result.current.gameMode).toBe("pvp-season");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("pvp-season");
  });
});
