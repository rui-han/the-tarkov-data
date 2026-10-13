"use client";

import useSWR from "swr";
import { fetchTarkovJson, GameMode } from "@/lib/tarkovApi";

export function useTarkovData<T>(
  endpoint: string,
  opts?: { gameMode?: GameMode; lang?: string },
) {
  const { data, error, isLoading } = useSWR<T>(
    [endpoint, opts?.gameMode ?? "regular", opts?.lang ?? null],
    () => fetchTarkovJson<T>(endpoint, opts),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000, // identical requests within 60s hit the cache, similar to Apollo cache
    },
  );

  return { data, error, isLoading };
}
