"use client";

import { useEffect, useMemo } from "react";
import { useTarkovData } from "@/hooks/useTarkovData";
import { useTranslations } from "@/hooks/useTranslations";
import { parseMaps, parseTasks } from "@/lib/tasks";

/**
 * All tasks for the game mode picked in the nav bar, normalized, with
 * translated names when the dictionary loads.
 */
export function useTasks() {
  const { data, error, isLoading } = useTarkovData<unknown>("tasks");
  const dictionary = useTranslations("tasks");

  const tasks = useMemo(
    () => parseTasks(data, dictionary.translations),
    [data, dictionary.translations],
  );

  // request succeeded but nothing usable came back
  const shapeError = !isLoading && !error && data != null && tasks.length === 0;

  useEffect(() => {
    if (shapeError) {
      console.warn(
        "[useTasks] no tasks found in payload, top-level keys:",
        Array.isArray(data)
          ? "(array)"
          : Object.keys(data as object).slice(0, 10),
      );
    }
  }, [shapeError, data]);

  return {
    tasks,
    error,
    shapeError,
    // wait for the dictionary so names don't flash from fallback to real,
    // but never block on a dictionary that failed
    isLoading: isLoading || (dictionary.isLoading && !dictionary.error),
  };
}

/** Map id -> map. Never blocks the page; names fall back to normalizedName. */
export function useMapMap() {
  const { data, error, isLoading } = useTarkovData<unknown>("maps");
  const { translations } = useTranslations("maps");
  const mapsById = useMemo(
    () => parseMaps(data, translations),
    [data, translations],
  );
  return { mapsById, error, isLoading };
}
