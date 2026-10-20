"use client";

import { useMemo } from "react";
import { useTarkovData } from "@/hooks/useTarkovData";
import { useTranslations } from "@/hooks/useTranslations";
import { parseItemList } from "@/lib/items";

/**
 * All items for the game mode picked in the nav bar, normalized, with
 * translated names when the dictionary loads.
 */
export function useItems() {
  const { data, error, isLoading } = useTarkovData<unknown>("items");
  const dictionary = useTranslations("items");

  const items = useMemo(
    () => parseItemList(data, dictionary.translations),
    [data, dictionary.translations],
  );

  return {
    items,
    error,
    // wait for the dictionary so names don't flash from fallback to real,
    // but never block on a dictionary that failed
    isLoading: isLoading || (dictionary.isLoading && !dictionary.error),
  };
}
