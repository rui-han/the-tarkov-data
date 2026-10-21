"use client";

import useSWR from "swr";
import { useGameMode } from "@/contexts/GameModeContext";
import { fetchTarkovJson, type GameMode } from "@/lib/tarkovApi";

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
    {
      revalidateOnFocus: false,
      // identical requests within the window hit the cache; polled data needs
      // a window shorter than its interval or the poll would be deduped away
      dedupingInterval: refreshInterval ? 10_000 : 60_000,
      refreshInterval,
    },
  );

  // a disabled key reports isLoading=false, but for the caller we are still
  // waiting for the mode
  return { data, error, isLoading: isLoading || !enabled };
}
