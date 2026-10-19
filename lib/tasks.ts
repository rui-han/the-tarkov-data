import { toArray } from "@/lib/tarkovApi";
import {
  displayName,
  looksUntranslated,
  translate,
  type Translations,
} from "@/lib/hideout";
import { typeLabel } from "@/lib/items";
import type { SortOrder } from "@/types/item";
import type {
  GameMap,
  Task,
  TaskFilters,
  TaskLabels,
  TaskObjective,
  TaskRewards,
  TaskSortKey,
} from "@/types/task";

/** Filter value meaning "tasks that aren't tied to a map" */
export const ANY_MAP = "__any__";

type UnknownRecord = Record<string, unknown>;

const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const num = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;
const numOrNull = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;
const records = (v: unknown): UnknownRecord[] =>
  Array.isArray(v) ? v.filter(isRecord) : [];
/** a reference is either an id string or an object carrying an id */
const refId = (v: unknown): string =>
  typeof v === "string" ? v : isRecord(v) ? str(v.id) : "";
const refIds = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(refId).filter(Boolean) : [];
const strings = (v: unknown): string[] =>
  typeof v === "string"
    ? [v]
    : Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string")
    : [];

/** The payload is `{ <key>: { <id>: {...} } }`; also accept bare arrays. */
function listFrom(data: unknown, key: string): unknown[] {
  const inner = isRecord(data) && data[key] != null ? data[key] : data;
  return toArray<unknown>(inner);
}

/* ------------------------------------------------------------------ */
/* parsing                                                            */
/* ------------------------------------------------------------------ */

function parseObjective(
  raw: UnknownRecord,
  index: number,
  translations?: Translations,
): TaskObjective {
  // objective descriptions are keyed by the objective id in the dictionary
  const key = str(raw.description);
  const description =
    translate(translations, key) ?? (looksUntranslated(key) ? "" : key);

  return {
    id: str(raw.id) || `objective-${index}`,
    type: str(raw.type),
    description,
    optional: raw.optional === true,
    count: numOrNull(raw.count),
    itemIds: [
      ...new Set([...refIds(raw.items), refId(raw.item)].filter(Boolean)),
    ],
    mapIds: refIds(raw.maps),
    foundInRaid: raw.foundInRaid === true,
  };
}

/** Reward lists that are only summarised as a count */
const UNLOCKS: Array<[key: string, noun: string]> = [
  ["offerUnlock", "trader offer"],
  ["craftUnlock", "craft"],
  ["traderUnlock", "trader unlock"],
  ["skillLevelReward", "skill reward"],
  ["achievement", "achievement"],
  ["customization", "customization item"],
  ["locationUnlock", "location unlock"],
];

function parseRewards(raw: unknown): TaskRewards {
  const r = isRecord(raw) ? raw : {};

  const unlocks: string[] = [];
  for (const [key, noun] of UNLOCKS) {
    const list = r[key];
    const count = Array.isArray(list) ? list.length : 0;
    if (count > 0) unlocks.push(`${count} ${noun}${count > 1 ? "s" : ""}`);
  }

  return {
    traderStanding: records(r.traderStanding)
      .map((s) => ({
        traderId: refId(s.trader) || str(s.traderId),
        standing: num(s.standing),
      }))
      .filter((s) => s.traderId !== ""),
    items: records(r.items)
      .map((i) => ({ itemId: refId(i.item), count: num(i.count, 1) }))
      .filter((i) => i.itemId !== ""),
    unlocks,
  };
}

export function parseTasks(data: unknown, translations?: Translations): Task[] {
  const tasks: Task[] = [];

  for (const raw of listFrom(data, "tasks")) {
    if (!isRecord(raw) || typeof raw.id !== "string") continue;

    const normalizedName = str(raw.normalizedName);
    const name = displayName(
      str(raw.name),
      normalizedName,
      raw.id,
      translations,
    );

    tasks.push({
      id: raw.id,
      name,
      normalizedName,
      traderId: refId(raw.trader),
      mapId: refId(raw.map) || null,
      minPlayerLevel: num(raw.minPlayerLevel, 1),
      experience: num(raw.experience),
      taskImageLink: str(raw.taskImageLink) || undefined,
      wikiLink: str(raw.wikiLink) || undefined,
      kappaRequired: raw.kappaRequired === true,
      lightkeeperRequired: raw.lightkeeperRequired === true,
      factionName: str(raw.factionName) || "Any",
      taskRequirements: records(raw.taskRequirements)
        .map((r) => ({ taskId: refId(r.task), status: strings(r.status) }))
        .filter((r) => r.taskId !== ""),
      traderRequirements: records(raw.traderRequirements)
        .map((r) => ({
          traderId: refId(r.trader) || str(r.traderId),
          level: num(r.level ?? r.value, 1),
        }))
        .filter((r) => r.traderId !== ""),
      objectives: records(raw.objectives).map((o, i) =>
        parseObjective(o, i, translations),
      ),
      rewards: parseRewards(raw.finishRewards),
      searchText: `${name} ${normalizedName.replace(/-/g, " ")}`.toLowerCase(),
    });
  }

  return tasks;
}

export function parseMaps(
  data: unknown,
  translations?: Translations,
): Map<string, GameMap> {
  const map = new Map<string, GameMap>();
  for (const raw of listFrom(data, "maps")) {
    if (!isRecord(raw) || typeof raw.id !== "string") continue;
    const normalizedName = str(raw.normalizedName);
    map.set(raw.id, {
      id: raw.id,
      name: displayName(str(raw.name), normalizedName, raw.id, translations),
      normalizedName,
    });
  }
  return map;
}

/* ------------------------------------------------------------------ */
/* filter & sort                                                      */
/* ------------------------------------------------------------------ */

/** Every word of the query must appear in the task name. */
export function filterTasks(tasks: Task[], f: TaskFilters): Task[] {
  const words = f.query.toLowerCase().split(/\s+/).filter(Boolean);
  if (
    words.length === 0 &&
    !f.traderId &&
    !f.mapId &&
    !f.kappaOnly &&
    !f.lightkeeperOnly
  ) {
    return tasks;
  }

  return tasks.filter(
    (t) =>
      (!f.traderId || t.traderId === f.traderId) &&
      (!f.mapId ||
        (f.mapId === ANY_MAP ? t.mapId === null : t.mapId === f.mapId)) &&
      (!f.kappaOnly || t.kappaRequired) &&
      (!f.lightkeeperOnly || t.lightkeeperRequired) &&
      words.every((w) => t.searchText.includes(w)),
  );
}

const collator = new Intl.Collator(undefined, { sensitivity: "base" });

function sortValue(
  task: Task,
  key: TaskSortKey,
  labels: TaskLabels,
): string | number {
  switch (key) {
    case "name":
      return task.name;
    case "trader":
      return labels.traderName(task.traderId);
    case "map":
      return labels.mapName(task.mapId);
    case "minPlayerLevel":
      return task.minPlayerLevel;
    case "experience":
      return task.experience;
  }
}

/** Returns a sorted copy; ties are broken by level, then name. */
export function sortTasks(
  tasks: Task[],
  key: TaskSortKey,
  order: SortOrder,
  labels: TaskLabels,
): Task[] {
  const dir = order === "asc" ? 1 : -1;

  return [...tasks].sort((a, b) => {
    const va = sortValue(a, key, labels);
    const vb = sortValue(b, key, labels);
    const cmp =
      typeof va === "string" && typeof vb === "string"
        ? collator.compare(va, vb)
        : (va as number) - (vb as number);

    return (
      cmp * dir ||
      a.minPlayerLevel - b.minPlayerLevel ||
      collator.compare(a.name, b.name)
    );
  });
}

/* ------------------------------------------------------------------ */
/* formatting                                                         */
/* ------------------------------------------------------------------ */

/** Translated text if there is one, otherwise e.g. "Give Item ×3". */
export function objectiveText(objective: TaskObjective): string {
  if (objective.description) return objective.description;
  const base = typeLabel(objective.type || "objective");
  return objective.count && objective.count > 1
    ? `${base} ×${objective.count}`
    : base;
}

export function formatStanding(standing: number): string {
  return `${standing > 0 ? "+" : ""}${standing.toFixed(2)}`;
}
