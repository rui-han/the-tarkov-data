"use client";

import { useMemo } from "react";
import { useTarkovData } from "@/hooks/useTarkovData";
import { parseTranslations } from "@/lib/hideout";
import { parseItemList } from "@/lib/items";
import type { GameMode } from "@/lib/tarkovApi";

const LANG = "en";

/** All items, normalized, with translated names when the dictionary loads. */
export function useItems(gameMode: GameMode = "regular") {
  const { data, error, isLoading } = useTarkovData<unknown>("items", {
    gameMode,
  });

  // The dictionary is a key -> text map shared by all game modes, so it is
  // always read from "regular" (one download, and no dependency on whether
  // pve/items_en exists).
  const {
    data: dictionary,
    error: dictionaryError,
    isLoading: dictionaryLoading,
  } = useTarkovData<unknown>("items", { gameMode: "regular", lang: LANG });

  const translations = useMemo(
    () => parseTranslations(dictionary),
    [dictionary],
  );
  const items = useMemo(
    () => parseItemList(data, translations),
    [data, translations],
  );

  return {
    items,
    error,
    // wait for the dictionary so names don't flash from fallback to real,
    // but never block on a dictionary that failed
    isLoading: isLoading || (dictionaryLoading && !dictionaryError),
  };
}
