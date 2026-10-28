import { toArray } from "@/lib/tarkovApi";
import {
  displayName,
  looksUntranslated,
  prettifyName,
  translate,
  type Translations,
} from "@/lib/hideout";
import type { SortOrder } from "@/types/item";
import type {
  Achievement,
  AchievementFilters,
  AchievementSortKey,
  FilterOption,
} from "@/types/achievement";

type UnknownRecord = Record<string, unknown>;

const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const numOrNull = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

/* ------------------------------------------------------------------ */
/* labels                                                             */
/* ------------------------------------------------------------------ */

const RARITY_ORDER = ["common", "rare", "legendary"];

/** common < rare < legendary; unknown rarities rank after the known ones */
export function rarityRank(normalizedRarity: string): number {
  const index = RARITY_ORDER.indexOf(normalizedRarity.toLowerCase());
  return index === -1 ? RARITY_ORDER.length : index;
}

export function sideLabel(normalizedSide: string, rawSide: string): string {
  const key = (normalizedSide || rawSide).toLowerCase();
  if (!key) return "Unknown";
  if (key === "pmc") return "PMC";
  if (key === "scav" || key === "scavs") return "Scav";
  if (key === "all") return "All";
  return prettifyName(key);
}

/**
 * `rarity` is a localization key ("Achievements/Tab/CommonRarity"), so it is
 * only shown when the dictionary has it; otherwise the label comes from
 * `normalizedRarity`.
 */
function rarityLabel(
  rawRarity: string,
  normalizedRarity: string,
  translations?: Translations,
): string {
  return (
    translate(translations, rawRarity) ??
    (normalizedRarity ? prettifyName(normalizedRarity) : rawRarity || "Unknown")
  );
}

/* ------------------------------------------------------------------ */
/* parsing                                                            */
/* ------------------------------------------------------------------ */

/**
 * Achievements live inside the `tasks` payload: `{ tasks: {...},
 * achievements: { <id>: {...} } }`. A bare array is accepted too. Anything
 * else (e.g. a translation dictionary) yields nothing.
 */
function achievementList(data: unknown): unknown[] {
  if (isRecord(data) && data.achievements != null) {
    return toArray<unknown>(data.achievements);
  }
  return Array.isArray(data) ? data : [];
}

export function parseAchievements(
  data: unknown,
  translations?: Translations,
): Achievement[] {
  const achievements: Achievement[] = [];

  for (const raw of achievementList(data)) {
    if (!isRecord(raw) || typeof raw.id !== "string") continue;

    const normalizedName = str(raw.normalizedName);
    const name = displayName(
      str(raw.name),
      normalizedName,
      raw.id,
      translations,
    );

    const descriptionKey = str(raw.description);
    const description =
      translate(translations, descriptionKey) ??
      (looksUntranslated(descriptionKey) ? "" : descriptionKey);

    const normalizedRarity = str(raw.normalizedRarity).toLowerCase();
    const normalizedSide = str(raw.normalizedSide).toLowerCase();

    achievements.push({
      id: raw.id,
      name,
      normalizedName,
      description,
      hidden: raw.hidden === true,
      side: sideLabel(normalizedSide, str(raw.side)),
      normalizedSide,
      rarity: rarityLabel(str(raw.rarity), normalizedRarity, translations),
      normalizedRarity,
      playersCompletedPercent: numOrNull(raw.playersCompletedPercent),
      adjustedPlayersCompletedPercent: numOrNull(
        raw.adjustedPlayersCompletedPercent,
      ),
      imageLink: str(raw.imageLink) || undefined,
      searchText: `${name} ${description} ${normalizedName.replace(
        /-/g,
        " ",
      )}`.toLowerCase(),
    });
  }

  return achievements;
}

/* ------------------------------------------------------------------ */
/* filter & options                                                   */
/* ------------------------------------------------------------------ */

/** Every word of the query must appear in the name or description. */
export function filterAchievements(
  items: Achievement[],
  f: AchievementFilters,
): Achievement[] {
  const words = f.query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0 && !f.rarity && !f.side && f.visibility === "all") {
    return items;
  }

  return items.filter(
    (a) =>
      (!f.rarity || a.normalizedRarity === f.rarity) &&
      (!f.side || a.normalizedSide === f.side) &&
      (f.visibility === "all" ||
        (f.visibility === "hidden" ? a.hidden : !a.hidden)) &&
      words.every((w) => a.searchText.includes(w)),
  );
}

function buildOptions(
  items: Achievement[],
  valueOf: (a: Achievement) => string,
  labelOf: (a: Achievement) => string,
): FilterOption[] {
  const options = new Map<string, FilterOption>();
  for (const item of items) {
    const value = valueOf(item);
    if (!value) continue;
    const existing = options.get(value);
    if (existing) existing.count++;
    else options.set(value, { value, label: labelOf(item), count: 1 });
  }
  return [...options.values()];
}

/** Rarities that occur, in rank order (common first). */
export function listRarities(items: Achievement[]): FilterOption[] {
  return buildOptions(
    items,
    (a) => a.normalizedRarity,
    (a) => a.rarity,
  ).sort(
    (a, b) =>
      rarityRank(a.value) - rarityRank(b.value) ||
      a.label.localeCompare(b.label),
  );
}

export function listSides(items: Achievement[]): FilterOption[] {
  return buildOptions(
    items,
    (a) => a.normalizedSide,
    (a) => a.side,
  ).sort((a, b) => a.label.localeCompare(b.label));
}

/* ------------------------------------------------------------------ */
/* sort                                                               */
/* ------------------------------------------------------------------ */

const collator = new Intl.Collator(undefined, { sensitivity: "base" });

function sortValue(
  a: Achievement,
  key: AchievementSortKey,
): string | number | null {
  switch (key) {
    case "name":
      return a.name;
    case "rarity":
      return rarityRank(a.normalizedRarity);
    case "side":
      return a.side;
    case "playersCompletedPercent":
      return a.playersCompletedPercent;
  }
}

/**
 * Returns a sorted copy. Rarity sorts by rank (not alphabetically), items
 * without a value always go last in both directions, ties are broken by name.
 */
export function sortAchievements(
  items: Achievement[],
  key: AchievementSortKey,
  order: SortOrder,
): Achievement[] {
  const dir = order === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    const va = sortValue(a, key);
    const vb = sortValue(b, key);

    if (va == null && vb == null) return collator.compare(a.name, b.name);
    if (va == null) return 1;
    if (vb == null) return -1;

    const cmp =
      typeof va === "string" && typeof vb === "string"
        ? collator.compare(va, vb)
        : (va as number) - (vb as number);

    return cmp * dir || collator.compare(a.name, b.name);
  });
}

/* ------------------------------------------------------------------ */
/* formatting                                                         */
/* ------------------------------------------------------------------ */

/** Small percentages keep two decimals: 0.09%, 2.1%, 14%. */
export function formatPercent(percent: number | null): string {
  if (percent == null) return "—";
  return `${percent.toFixed(percent < 1 ? 2 : 1)}%`;
}
