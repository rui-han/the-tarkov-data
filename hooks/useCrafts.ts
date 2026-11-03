"use client";

import { useEffect, useMemo } from "react";
import { useTarkovData } from "@/hooks/useTarkovData";
import { parseCrafts } from "@/lib/crafts";

/**
 * All crafts for the game mode picked in the nav bar. Crafts have no text
 * fields, so there is no dictionary: names come from items, hideout and tasks.
 */
export function useCrafts() {
  const { data, error, isLoading } = useTarkovData<unknown>("crafts");

  const crafts = useMemo(() => parseCrafts(data), [data]);

  // request succeeded but nothing usable came back
  const shapeError =
    !isLoading && !error && data != null && crafts.length === 0;

  useEffect(() => {
    if (shapeError) {
      console.warn(
        "[useCrafts] no crafts found in payload, top-level keys:",
        Array.isArray(data)
          ? "(array)"
          : Object.keys(data as object).slice(0, 10),
      );
    }
  }, [shapeError, data]);

  return { crafts, error, shapeError, isLoading };
}
