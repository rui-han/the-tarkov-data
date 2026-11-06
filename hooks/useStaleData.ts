"use client";

import { useMemo, useSyncExternalStore } from "react";
import { mutate } from "swr";
import { useGameMode } from "@/contexts/GameModeContext";
import {
  getServerStaleEntries,
  getStaleEntries,
  isStale,
  subscribeStale,
  summarizeStale,
  type StaleSummary,
} from "@/lib/cacheStatus";
import { DEFAULT_GAME_MODE, isGameMode, tarkovPath } from "@/lib/tarkovApi";

/** Whether the current game mode is showing saved copies, and how old. */
export function useStaleData(): StaleSummary {
  const { gameMode } = useGameMode();
  const entries = useSyncExternalStore(
    subscribeStale,
    getStaleEntries,
    getServerStaleEntries,
  );
  return useMemo(() => summarizeStale(entries, gameMode), [entries, gameMode]);
}

/**
 * Does this SWR key (`[endpoint, gameMode, lang]`, see useTarkovData) belong
 * to a request that is currently served from a saved copy?
 */
export function isStaleKey(key: unknown): boolean {
  if (!Array.isArray(key) || typeof key[0] !== "string") return false;
  const gameMode = isGameMode(key[1]) ? key[1] : DEFAULT_GAME_MODE;
  const lang = typeof key[2] === "string" ? key[2] : undefined;
  return isStale(tarkovPath(key[0], gameMode, lang));
}

/** Revalidates only the requests that fell back, not the whole cache. */
export function retryStaleRequests(): Promise<unknown> {
  return mutate(isStaleKey);
}
