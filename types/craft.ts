export interface CraftItemEntry {
  itemId: string;
  count: number;
}

export interface Craft {
  id: string;
  stationId: string;
  /** hideout station level required for this craft */
  stationLevel: number;
  /** seconds */
  duration: number;
  /** consumed by the craft */
  ingredients: CraftItemEntry[];
  /** required but not consumed */
  tools: CraftItemEntry[];
  productItemId: string;
  productCount: number;
  /** a task that has to be completed before the craft is available */
  taskUnlockId: string | null;
}

export interface CraftEconomics {
  /** flea price of the consumed ingredients; null when any has no price */
  cost: number | null;
  /** ingredients without a price */
  missingPrices: number;
  /** price of the product, null when unknown */
  value: number | null;
  profit: number | null;
  profitPerHour: number | null;
}

/** A craft joined with names and prices, ready to filter and sort */
export interface CraftRow {
  craft: Craft;
  productName: string;
  stationName: string;
  /** lowercased text used by the search box */
  searchText: string;
  econ: CraftEconomics;
}

export type CraftSortKey =
  | "product"
  | "station"
  | "duration"
  | "cost"
  | "value"
  | "profit"
  | "profitPerHour";

export interface CraftFilters {
  query: string;
  /** "" = all stations */
  stationId: string;
  profitableOnly: boolean;
  hideTaskLocked: boolean;
}
