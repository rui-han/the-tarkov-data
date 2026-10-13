export interface ItemCategory {
  id?: string;
  name: string;
  normalizedName?: string;
}

export interface Item {
  id: string;
  name: string;
  normalizedName?: string;
  types?: string[];
  category?: ItemCategory | null;
  weight?: number | null;
  lastLowPrice?: number | null;
  gridImageLink?: string;
  iconLink?: string;
  wikiLink?: string;
}

export interface ItemsData {
  items: Item[];
}

/**
 * @deprecated
 */
export type PaginatedItemsData = ItemsData;
