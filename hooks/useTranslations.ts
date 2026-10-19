"use client";

import { useMemo } from "react";
import { useTarkovData } from "@/hooks/useTarkovData";
import { parseTranslations, type Translations } from "@/lib/hideout";

const LANG = "en";

/**
 * Loads `<endpoint>_en`, a plain key -> text dictionary. Until it arrives (or
 * if it fails) `translations` is empty and names fall back to prettified
 * normalizedName values.
 */
export function useTranslations(endpoint: string): {
  translations: Translations;
  isLoading: boolean;
  error: unknown;
} {
  const { data, error, isLoading } = useTarkovData<unknown>(endpoint, {
    gameMode: "regular",
    lang: LANG,
  });
  const translations = useMemo(() => parseTranslations(data), [data]);
  return { translations, isLoading, error };
}
