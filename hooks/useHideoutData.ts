"use client";

import { useEffect, useMemo } from "react";
import { useTarkovData } from "@/hooks/useTarkovData";
import { useTranslations } from "@/hooks/useTranslations";
import {
  parseItems,
  parseSkills,
  parseStations,
  parseTraders,
} from "@/lib/hideout";
import { memoizeParse } from "@/lib/memo";

// parsed once per payload and shared by every component and page visit
const parseStationsOnce = memoizeParse(parseStations);
const parseTradersOnce = memoizeParse(parseTraders);
const parseSkillsOnce = memoizeParse(parseSkills);

/** Hideout stations, normalized and sorted in in-game order. */
export function useHideoutStations() {
  const { data, error, isLoading } = useTarkovData<unknown>("hideout");
  const { translations } = useTranslations("hideout");

  const hideoutStations = useMemo(
    () => parseStationsOnce(data, translations),
    [data, translations],
  );

  // request succeeded but nothing usable came back
  const shapeError =
    !isLoading && !error && data != null && hideoutStations.length === 0;

  useEffect(() => {
    if (shapeError) {
      console.warn(
        "[useHideoutStations] no stations found in payload, top-level keys:",
        Array.isArray(data)
          ? "(array)"
          : Object.keys(data as object).slice(0, 10),
      );
    }
  }, [shapeError, data]);

  return { hideoutStations, error, isLoading, shapeError };
}

export function useTraderMap() {
  const { data, error, isLoading } = useTarkovData<unknown>("traders");
  const { translations } = useTranslations("traders");
  const tradersById = useMemo(
    () => parseTradersOnce(data, translations),
    [data, translations],
  );
  return { tradersById, error, isLoading };
}

/**
 * Looks up only `itemIds` from the items payload. Pass a referentially
 * stable Set (useMemo) so the lookup isn't rebuilt on every render.
 */
export function useItemMap(itemIds: ReadonlySet<string>) {
  const { data, error, isLoading } = useTarkovData<unknown>("items");
  const { translations } = useTranslations("items");
  const itemsById = useMemo(
    () => parseItems(data, itemIds, translations),
    [data, itemIds, translations],
  );
  return { itemsById, error, isLoading };
}

/**
 * Skill id -> skill. The list ships inside the items payload, so this shares
 * its download with useItemMap through the SWR cache. Never blocks a page:
 * until it arrives, skill ids are shown in a humanized form.
 */
export function useSkillMap() {
  const { data, error, isLoading } = useTarkovData<unknown>("items");
  const { translations } = useTranslations("items");
  const skillsById = useMemo(
    () => parseSkillsOnce(data, translations),
    [data, translations],
  );
  return { skillsById, error, isLoading };
}
