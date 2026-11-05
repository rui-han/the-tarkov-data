/** A hideout station, normalized from json.tarkov.dev (see lib/hideout.ts) */
export interface HideoutStation {
  id: string;
  name: string;
  normalizedName: string;
  areaType: number | null;
  imageLink?: string;
  levels: HideoutLevel[];
}

export interface HideoutLevel {
  id: string;
  level: number;
  /** seconds */
  constructionTime: number;
  /** empty when the description is an untranslated key */
  description: string;
  stationRequirements: StationRequirement[];
  traderRequirements: TraderRequirement[];
  itemRequirements: ItemRequirement[];
  skillRequirements: SkillRequirement[];
}

export interface StationRequirement {
  id: string;
  stationId: string;
  level: number;
}

export interface TraderRequirement {
  id: string;
  traderId: string;
  level: number;
}

export interface ItemRequirement {
  id: string;
  itemId: string;
  count: number;
  foundInRaid: boolean;
}

export interface SkillRequirement {
  id: string;
  name: string;
  level: number;
}

export interface Trader {
  id: string;
  name: string;
  normalizedName: string;
  imageLink?: string;
}

/** The few item fields the hideout pages need */
export interface HideoutItem {
  id: string;
  name: string;
  iconLink?: string;
  lowPrice: number | null;
  avgPrice: number | null;
}

export interface FetchedData {
  hideoutStations: HideoutStation[];
}

export interface HideoutParams {
  params: {
    hideoutId: string;
  };
  searchParams: {};
}

/** One row of the "all levels" overview of a station */
export interface LevelSummary {
  level: number;
  /** seconds */
  constructionTime: number;
  itemCount: number;
  /** requirements that must be found in raid */
  firCount: number;
  cost: number;
  /** items without a price, not included in `cost` */
  missing: number;
  /** cost / time of this level and every lower one */
  cumulativeCost: number;
  cumulativeMissing: number;
  cumulativeTime: number;
}

/** A station level that needs another station at a given level */
export interface StationDependent {
  stationId: string;
  stationName: string;
  level: number;
}
