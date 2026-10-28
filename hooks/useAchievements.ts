"use client";

import { useEffect, useMemo } from "react";
import { useTarkovData } from "@/hooks/useTarkovData";
import { useTranslations } from "@/hooks/useTranslations";
import { parseAchievements } from "@/lib/achievements";

/**
 * Achievements for the game mode picked in the nav bar. They are part of the
 * `tasks` payload, so this shares its download (and the `tasks_en`
 * dictionary) with the tasks page through the SWR cache.
 */
export function useAchievements() {
  const { data, error, isLoading } = useTarkovData<unknown>("tasks");
  const dictionary = useTranslations("tasks");

  const achievements = useMemo(
    () => parseAchievements(data, dictionary.translations),
    [data, dictionary.translations],
  );

  // request succeeded but nothing usable came back
  const shapeError =
    !isLoading && !error && data != null && achievements.length === 0;

  useEffect(() => {
    if (shapeError) {
      console.warn(
        "[useAchievements] no achievements found in payload, top-level keys:",
        Array.isArray(data)
          ? "(array)"
          : Object.keys(data as object).slice(0, 10),
      );
    }
  }, [shapeError, data]);

  return {
    achievements,
    error,
    shapeError,
    // wait for the dictionary so names don't flash from fallback to real,
    // but never block on a dictionary that failed
    isLoading: isLoading || (dictionary.isLoading && !dictionary.error),
  };
}
