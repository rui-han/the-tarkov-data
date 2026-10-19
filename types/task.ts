export interface TaskPrerequisite {
  taskId: string;
  /** e.g. ["complete"]; empty when the data doesn't say */
  status: string[];
}

export interface TaskTraderRequirement {
  traderId: string;
  level: number;
}

export interface TaskObjective {
  id: string;
  /** e.g. "visit", "giveItem" */
  type: string;
  /** translated text; empty when no translation is available */
  description: string;
  optional: boolean;
  count: number | null;
  itemIds: string[];
  mapIds: string[];
  foundInRaid: boolean;
}

export interface TaskRewards {
  traderStanding: Array<{ traderId: string; standing: number }>;
  items: Array<{ itemId: string; count: number }>;
  /** e.g. ["2 trader offers", "1 craft"] */
  unlocks: string[];
}

export interface Task {
  id: string;
  name: string;
  normalizedName: string;
  traderId: string;
  /** null = can be done on any map */
  mapId: string | null;
  minPlayerLevel: number;
  experience: number;
  taskImageLink?: string;
  wikiLink?: string;
  kappaRequired: boolean;
  lightkeeperRequired: boolean;
  /** "Any", "USEC" or "BEAR" */
  factionName: string;
  taskRequirements: TaskPrerequisite[];
  traderRequirements: TaskTraderRequirement[];
  objectives: TaskObjective[];
  rewards: TaskRewards;
  /** lowercased text used by the search box */
  searchText: string;
}

export interface GameMap {
  id: string;
  name: string;
  normalizedName: string;
}

export type TaskSortKey =
  | "name"
  | "trader"
  | "map"
  | "minPlayerLevel"
  | "experience";

export interface TaskFilters {
  query: string;
  /** "" = all traders */
  traderId: string;
  /** "" = all maps, ANY_MAP = tasks without a map */
  mapId: string;
  kappaOnly: boolean;
  lightkeeperOnly: boolean;
}

/** Names the sort needs but a Task only stores as ids */
export interface TaskLabels {
  traderName(id: string): string;
  mapName(id: string | null): string;
}
