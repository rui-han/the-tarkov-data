export interface TraderSell {
  traderId: string;
  /** best sell price, in roubles */
  price: number;
}

/** A normalized entry of the `items` endpoint (see lib/items.ts) */
export interface Item {
  id: string;
  /** display name, translated when the dictionary is available */
  name: string;
  /** short name; empty when it is not available / not translated */
  shortName: string;
  normalizedName: string;
  /** types as delivered, e.g. ["ammoBox"] */
  types: string[];
  /** display label derived from `types`, e.g. "Ammo Box" */
  category: string;
  weight: number | null;
  iconLink?: string;
  gridImageLink?: string;
  wikiLink?: string;
  /** cannot be sold on the flea market */
  noFlea: boolean;
  lastLowPrice: number | null;
  avg24hPrice: number | null;
  changeLast48hPercent: number | null;
  /** highest trader buy-back price */
  bestSell: TraderSell | null;
  /** lowercased text used by the search box */
  searchText: string;
}

export type ItemSortKey =
  | "name"
  | "category"
  | "weight"
  | "lastLowPrice"
  | "changeLast48hPercent"
  | "bestSellPrice";

export type SortOrder = "asc" | "desc";
