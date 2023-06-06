export interface FetchedData {
  hideoutStations: HideoutStation[];
}

export interface HideoutStation {
  id: string;
  name: string;
  normalizedName: string;
  levels: HideoutLevel[];
}

interface HideoutLevel {
  id: string;
  level: number;
  constructionTime: number;
  stationLevelRequirements: StationLevelRequirement[];
  traderRequirements: TraderRequirement[];
  itemRequirements: ItemRequirement[];
}

interface StationLevelRequirement {
  id: string;
  station: Station;
  level: number;
}

interface Station {
  name: string;
  normalizedName: string;
}

interface TraderRequirement {
  trader: Trader;
  level: number;
}

interface Trader {
  id: string;
  name: string;
  normalizedName: string;
}

interface ItemRequirement {
  id: string;
  item: Item;
  quantity: number;
}

interface Item {
  name: string;
  iconLink: string;
  low24hPrice: number | null;
  avg24hPrice: number;
}
