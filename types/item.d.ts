export interface PaginatedItemsData {
  items: Item[];
}

interface Item {
  id: string;
  gridImageLink: string;
  wikiLink: string;
  name: string;
  normalizedName: string;
  category: ItemCategory;
  weight: number;
  lastLowPrice: number;
}

interface ItemCategory {
  id: string;
  name: string;
}
