"use client";

import { useEffect, useMemo } from "react";
import { useTarkovData } from "@/hooks/useTarkovData";
import {
  parseItems,
  parseStations,
  parseTraders,
  parseTranslations,
  type Translations,
} from "@/lib/hideout";

// Language of the translation dictionaries (hideout_en, traders_en,
// items_en). These files are key -> text maps, NOT translated copies of the
// data, so the structure is always loaded from the untranslated endpoint.
const LANG = "en";

/**
 * Loads `<endpoint>_<LANG>`. Never blocks or fails the caller: until it
 * arrives (or if it fails) the dictionary is empty and names fall back to
 * prettified normalizedName values.
 */
function useTranslations(endpoint: string): Translations {
  const { data } = useTarkovData<unknown>(endpoint, { lang: LANG });
  return useMemo(() => parseTranslations(data), [data]);
}

/** Hideout stations, normalized and sorted in in-game order. */
export function useHideoutStations() {
  const { data, error, isLoading } = useTarkovData<unknown>("hideout");
  const translations = useTranslations("hideout");

  const hideoutStations = useMemo(
    () => parseStations(data, translations),
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
  const translations = useTranslations("traders");
  const tradersById = useMemo(
    () => parseTraders(data, translations),
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
  const translations = useTranslations("items");
  const itemsById = useMemo(
    () => parseItems(data, itemIds, translations),
    [data, itemIds, translations],
  );
  return { itemsById, error, isLoading };
}
