/** A normalized entry of `achievements` (see lib/achievements.ts) */
export interface Achievement {
  id: string;
  /** translated when the dictionary is available */
  name: string;
  normalizedName: string;
  /** empty when no translation is available */
  description: string;
  hidden: boolean;
  /** display label, e.g. "PMC" */
  side: string;
  /** lowercase, e.g. "pmc"; used for filtering and chip colors */
  normalizedSide: string;
  /** display label, e.g. "Common" */
  rarity: string;
  /** lowercase, e.g. "common"; used for filtering, ranking and colors */
  normalizedRarity: string;
  /** percent of players (0-100); null when missing */
  playersCompletedPercent: number | null;
  adjustedPlayersCompletedPercent: number | null;
  imageLink?: string;
  /** lowercased text used by the search box */
  searchText: string;
}

export type AchievementSortKey =
  | "name"
  | "rarity"
  | "side"
  | "playersCompletedPercent";

export type VisibilityFilter = "all" | "visible" | "hidden";

export interface AchievementFilters {
  query: string;
  /** normalizedRarity, "" = all */
  rarity: string;
  /** normalizedSide, "" = all */
  side: string;
  visibility: VisibilityFilter;
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}
