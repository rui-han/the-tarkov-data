"use client";

import { useMemo } from "react";
import { useTarkovData } from "@/hooks/useTarkovData";
import { useTranslations } from "@/hooks/useTranslations";
import { parseAmmo } from "@/lib/ammo";

/**
 * All ammunition for the game mode picked in the nav bar, with real names from
 * the items dictionary. Shares its downloads with the Items and Dashboard
 * pages through the SWR cache.
 */
export function useAmmoData() {
  const { data, error, isLoading } = useTarkovData<unknown>("items");
  const dictionary = useTranslations("items");

  const ammo = useMemo(
    () => parseAmmo(data, dictionary.translations),
    [data, dictionary.translations],
  );

  return {
    ammo,
    error,
    // wait for the dictionary so names don't flash from fallback to real,
    // but never block on a dictionary that failed
    isLoading: isLoading || (dictionary.isLoading && !dictionary.error),
  };
}
