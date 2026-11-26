import { EMPTY_TRANSLATIONS, type Translations } from "@/lib/hideout";

/**
 * Parsing the big payloads (items, tasks, ...) is the most expensive thing the
 * pages do. SWR hands every component the same `data` object, so the result can
 * be remembered per (data, translations) pair: a second component, or the same
 * page visited again, reuses the first result instead of parsing again.
 *
 * The cache is weak: when SWR drops a payload, its parsed copy can be garbage
 * collected. Results are shared, so callers must treat them as read-only.
 */
export function memoizeParse<R>(
  parse: (data: unknown, translations?: Translations) => R,
): (data: unknown, translations?: Translations) => R {
  const cache = new WeakMap<object, WeakMap<object, R>>();

  return (data, translations = EMPTY_TRANSLATIONS) => {
    // nothing to key on (not loaded yet, or junk): parsing is trivial
    if (typeof data !== "object" || data === null) {
      return parse(data, translations);
    }

    let byTranslations = cache.get(data);
    if (!byTranslations) {
      byTranslations = new WeakMap();
      cache.set(data, byTranslations);
    }
    if (byTranslations.has(translations)) {
      return byTranslations.get(translations) as R;
    }

    const result = parse(data, translations);
    byTranslations.set(translations, result);
    return result;
  };
}
