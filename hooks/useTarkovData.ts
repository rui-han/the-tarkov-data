"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { useGameMode } from "@/contexts/GameModeContext";
import { fetchTarkovJson, type GameMode } from "@/lib/tarkovApi";

/** The big static files change slowly: a response counts as fresh this long. */
export const FRESH_MS = 10 * 60_000;
const POLL_DEDUPE_MS = 10_000;

/**
 * SWR options for a json.tarkov.dev request.
 *
 * - Static files: a response is reused for FRESH_MS, so moving between pages
 *   doesn't re-download multi-MB files, and reconnecting doesn't either.
 * - Polled data (server status): the dedupe window must be shorter than the
 *   interval or the poll would be deduped away, and a reconnect does refresh
 *   it.
 */
export function tarkovSwrConfig(refreshInterval?: number): SWRConfiguration {
  const polled = Boolean(refreshInterval);
  return {
    revalidateOnFocus: false,
    revalidateOnReconnect: polled,
    dedupingInterval: polled ? POLL_DEDUPE_MS : FRESH_MS,
    refreshInterval,
  };
}

/**
 * Loads a json.tarkov.dev endpoint.
 *
 * - Without `opts.gameMode` it follows the game mode picked in the nav bar,
 *   and waits until the saved mode has been read, so no request is made for
 *   the wrong mode.
 * - Pass `gameMode` explicitly for data that doesn't depend on the mode
 *   (e.g. the `*_en` translation dictionaries use "regular").
 * - `status` is not per-mode.
 * - `refreshInterval` (ms) polls the endpoint; SWR pauses it while the tab
 *   is hidden.
 */
export function useTarkovData<T>(
  endpoint: string,
  opts?: { gameMode?: GameMode; lang?: string; refreshInterval?: number },
) {
  const { gameMode: currentMode, isReady } = useGameMode();

  const isModeIndependent = endpoint === "status";
  const gameMode: GameMode = isModeIndependent
    ? "regular"
    : opts?.gameMode ?? currentMode;
  const mustWaitForMode = !isModeIndependent && opts?.gameMode == null;
  const enabled = !mustWaitForMode || isReady;
  const lang = opts?.lang;
  const refreshInterval = opts?.refreshInterval;

  const { data, error, isLoading } = useSWR<T>(
    enabled ? [endpoint, gameMode, lang ?? null] : null,
    () => fetchTarkovJson<T>(endpoint, { gameMode, lang }),
    tarkovSwrConfig(refreshInterval),
  );

  // a disabled key reports isLoading=false, but for the caller we are still
  // waiting for the mode
  return { data, error, isLoading: isLoading || !enabled };
}
