import { toArray } from "@/lib/tarkovApi";
import type {
  HideoutItem,
  HideoutLevel,
  HideoutStation,
  ItemRequirement,
  Trader,
} from "@/types/hideout";

/** Roubles are an item too; one rouble is worth exactly one rouble. */
export const ROUBLES_ID = "5449016a4bdc2d6f028b456f";

type UnknownRecord = Record<string, unknown>;

/**
 * A translation dictionary, e.g. from `hideout_en`:
 * { "hideout_area_23_name": "Gym", ... }. Values are checked when read.
 */
export type Translations = Readonly<Record<string, unknown>>;

const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const num = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;
const records = (v: unknown): UnknownRecord[] =>
  Array.isArray(v) ? v.filter(isRecord) : [];
/** a reference is either an id string or an object carrying an id */
const refId = (v: unknown): string =>
  typeof v === "string" ? v : isRecord(v) ? str(v.id) : "";
const priceOrNull = (v: unknown): number | null =>
  typeof v === "number" && v > 0 ? v : null;

/* ------------------------------------------------------------------ */
/* translations & names                                               */
/* ------------------------------------------------------------------ */

/** The `*_en` files are plain key -> text objects; anything else is ignored. */
export function parseTranslations(data: unknown): Translations {
  return isRecord(data) ? data : {};
}

/** Look a key up in a dictionary; undefined if missing or not a string. */
export function translate(
  translations: Translations | undefined,
  key: string | undefined,
): string | undefined {
  if (!translations || !key) return undefined;
  const value = translations[key];
  return typeof value === "string" && value !== "" ? value : undefined;
}

/**
 * Untranslated strings look like "hideout_area_23_name" or
 * "54cb50c76803fa8b248b4571 Nickname".
 */
export function looksUntranslated(text: string | null | undefined): boolean {
  if (!text) return true;
  return (
    /^[0-9a-f]{24}(\s|$)/i.test(text) ||
    /^hideout_/i.test(text) ||
    /^[a-z0-9]+(_[a-z0-9]+)+$/.test(text)
  );
}

/** "air-filtering-unit" -> "Air Filtering Unit" */
export function prettifyName(normalizedName: string): string {
  return normalizedName
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Best available display name: the dictionary entry for `name`, then `name`
 * itself if it is already readable, then a prettified normalizedName.
 */
export function displayName(
  name: string | undefined,
  normalizedName: string | undefined,
  fallback = "Unknown",
  translations?: Translations,
): string {
  const translated = translate(translations, name);
  if (translated) return translated;
  if (name && !looksUntranslated(name)) return name;
  if (normalizedName) return prettifyName(normalizedName);
  return name || fallback;
}

/* ------------------------------------------------------------------ */
/* unwrapping the payload                                             */
/* ------------------------------------------------------------------ */

/**
 * The static files may be a bare array, an id-keyed object, `{ [key]: ... }`
 * or wrapped in `{ data: ... }`. Find the part that holds the list.
 */
function unwrap(data: unknown, key: string): unknown {
  let current = data;
  for (let depth = 0; depth < 2 && isRecord(current); depth++) {
    if (current[key] != null) return current[key];
    if (isRecord(current.data) || Array.isArray(current.data)) {
      current = current.data;
    } else {
      break;
    }
  }
  return current;
}

function extractList(data: unknown, key: string): unknown[] {
  return toArray<unknown>(unwrap(data, key));
}

/* ------------------------------------------------------------------ */
/* stations                                                           */
/* ------------------------------------------------------------------ */

function isFoundInRaid(attributes: unknown): boolean {
  if (Array.isArray(attributes)) {
    return attributes.some(
      (a) =>
        isRecord(a) && a.name === "foundInRaid" && String(a.value) === "true",
    );
  }
  return isRecord(attributes) && attributes.foundInRaid === true;
}

function parseLevel(
  raw: UnknownRecord,
  stationId: string,
  index: number,
  translations?: Translations,
): HideoutLevel {
  const level = num(raw.level, index + 1);
  const descriptionKey = str(raw.description);
  const description = translate(translations, descriptionKey) ?? descriptionKey;

  return {
    id: str(raw.id) || `${stationId}-${level}`,
    level,
    constructionTime: num(raw.constructionTime),
    description: looksUntranslated(description) ? "" : description,
    stationRequirements: records(raw.stationLevelRequirements)
      .map((r, i) => ({
        id: str(r.id) || `station-${i}`,
        stationId: refId(r.station),
        level: num(r.level, 1),
      }))
      .filter((r) => r.stationId !== ""),
    traderRequirements: records(raw.traderRequirements)
      .map((r, i) => ({
        id: str(r.id) || `trader-${i}`,
        traderId: refId(r.trader) || str(r.traderId),
        level: num(r.level ?? r.value, 1),
      }))
      .filter((r) => r.traderId !== ""),
    itemRequirements: records(raw.itemRequirements)
      .map((r, i) => ({
        id: str(r.id) || `item-${i}`,
        itemId: refId(r.item),
        count: num(r.count ?? r.quantity, 1),
        foundInRaid: isFoundInRaid(r.attributes),
      }))
      .filter((r) => r.itemId !== ""),
    skillRequirements: records(raw.skillRequirements).map((r, i) => {
      const skill = isRecord(r.skill) ? r.skill.name : r.skill;
      const rawName = str(r.name) || str(skill);
      return {
        id: str(r.id) || `skill-${i}`,
        name: translate(translations, rawName) ?? (rawName || "Skill"),
        level: num(r.level, 1),
      };
    }),
  };
}

function parseStation(
  raw: UnknownRecord,
  translations?: Translations,
): HideoutStation {
  const id = str(raw.id);
  const normalizedName = str(raw.normalizedName);

  return {
    id,
    name: displayName(str(raw.name), normalizedName, id, translations),
    normalizedName,
    areaType: typeof raw.areaType === "number" ? raw.areaType : null,
    imageLink: str(raw.imageLink) || undefined,
    levels: records(raw.levels)
      .map((l, i) => parseLevel(l, id, i, translations))
      .sort((a, b) => a.level - b.level),
  };
}

/** Normalize the `hideout` payload into stations sorted in in-game order. */
export function parseStations(
  data: unknown,
  translations?: Translations,
): HideoutStation[] {
  return extractList(data, "hideoutStations")
    .filter(
      (v): v is UnknownRecord =>
        isRecord(v) && typeof v.id === "string" && Array.isArray(v.levels),
    )
    .map((raw) => parseStation(raw, translations))
    .sort(
      (a, b) =>
        (a.areaType ?? 999) - (b.areaType ?? 999) ||
        a.name.localeCompare(b.name),
    );
}

/** Every item id referenced by any level of any station. */
export function collectItemIds(stations: HideoutStation[]): Set<string> {
  const ids = new Set<string>();
  for (const station of stations) {
    for (const level of station.levels) {
      for (const req of level.itemRequirements) ids.add(req.itemId);
    }
  }
  return ids;
}

/* ------------------------------------------------------------------ */
/* traders & items                                                    */
/* ------------------------------------------------------------------ */

export function parseTraders(
  data: unknown,
  translations?: Translations,
): Map<string, Trader> {
  const map = new Map<string, Trader>();
  for (const raw of extractList(data, "traders")) {
    if (!isRecord(raw) || typeof raw.id !== "string") continue;
    const normalizedName = str(raw.normalizedName);
    map.set(raw.id, {
      id: raw.id,
      name: displayName(str(raw.name), normalizedName, raw.id, translations),
      normalizedName,
      imageLink: str(raw.imageLink) || undefined,
    });
  }
  return map;
}

/**
 * Pick out only the requested items from the (huge) items payload, so we keep
 * a few dozen small objects instead of thousands.
 */
export function parseItems(
  data: unknown,
  ids: ReadonlySet<string>,
  translations?: Translations,
): Map<string, HideoutItem> {
  const map = new Map<string, HideoutItem>();
  if (ids.size === 0) return map;

  for (const raw of extractList(data, "items")) {
    if (!isRecord(raw) || typeof raw.id !== "string" || !ids.has(raw.id)) {
      continue;
    }
    map.set(raw.id, {
      id: raw.id,
      name: displayName(
        str(raw.name),
        str(raw.normalizedName),
        raw.id,
        translations,
      ),
      iconLink: str(raw.iconLink) || str(raw.gridImageLink) || undefined,
      lowPrice: priceOrNull(raw.low24hPrice) ?? priceOrNull(raw.lastLowPrice),
      avgPrice: priceOrNull(raw.avg24hPrice),
    });
  }
  return map;
}

/* ------------------------------------------------------------------ */
/* cost & formatting                                                  */
/* ------------------------------------------------------------------ */

/** Best available unit price: 24h low, else 24h average. */
export function unitPrice(
  item: HideoutItem | undefined,
  itemId: string,
): number | null {
  if (itemId === ROUBLES_ID) return 1;
  if (!item) return null;
  return item.lowPrice ?? item.avgPrice;
}

export function levelCost(
  requirements: ItemRequirement[],
  itemsById: ReadonlyMap<string, HideoutItem>,
): { total: number; missing: number } {
  let total = 0;
  let missing = 0;
  for (const req of requirements) {
    const price = unitPrice(itemsById.get(req.itemId), req.itemId);
    if (price == null) missing++;
    else total += price * req.count;
  }
  return { total, missing };
}

const priceFormatter = new Intl.NumberFormat("en-US");

export function formatPrice(price: number | null | undefined): string {
  return price == null
    ? "N/A"
    : `${priceFormatter.format(Math.round(price))} ₽`;
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "Instant";
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
