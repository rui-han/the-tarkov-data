export interface FetchedData {
  items: Item[];
}

interface Item {
  id: string;
  name: string;
  lastLowPrice: number;
  sellFor: SellFor[];
  iconLink: string;
}

interface SellFor {
  vendor: Vendor;
  priceRUB: number;
}

interface Vendor {
  name: string;
}
