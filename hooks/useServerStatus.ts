"use client";

import { useMemo } from "react";
import { useTarkovData } from "@/hooks/useTarkovData";
import { parseServerStatus } from "@/lib/serverStatus";

const REFRESH_MS = 60_000;

/**
 * Server status, refreshed every minute. If a refresh fails, the last good
 * status stays on screen. `status` is null while loading or when nothing
 * usable has arrived.
 */
export function useServerStatus() {
  const { data, isLoading } = useTarkovData<unknown>("status", {
    refreshInterval: REFRESH_MS,
  });
  const status = useMemo(() => parseServerStatus(data), [data]);
  return { status, isLoading };
}
