import { toArray } from "@/lib/tarkovApi";
import {
  displayName,
  looksUntranslated,
  translate,
  type Translations,
} from "@/lib/hideout";
import type { Item, ItemSortKey, SortOrder, TraderSell } from "@/types/item";

type UnknownRecord = Record<string, unknown>;

const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const numOrNull = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;
const positiveOrNull = (v: unknown): number | null =>
  typeof v === "number" && v > 0 ? v : null;

/* ------------------------------------------------------------------ */
/* categories                                                         */
/* ------------------------------------------------------------------ */

/** Flags in `types` that say something about the item, not what it is. */
const FLAG_TYPES = new Set([
  "any",
  "noFlea",
  "markedOnly",
  "preset",
  "wearable",
]);

/** "ammoBox" -> "Ammo Box" */
export function typeLabel(type: string): string {
  return type
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

/** The first non-flag type, as a label. `categories` only holds ids. */
export function categoryOf(types: string[]): string {
  const main = types.find((t) => !FLAG_TYPES.has(t));
  return main ? typeLabel(main) : "Other";
}

/* ------------------------------------------------------------------ */
/* parsing                                                            */
/* ------------------------------------------------------------------ */

/** The payload is `{ items: { <id>: {...} } }`; also accept arrays. */
function itemList(data: unknown): unknown[] {
  const inner = isRecord(data) && data.items != null ? data.items : data;
  return toArray<unknown>(inner);
}

function bestTraderSell(sellToTrader: unknown): TraderSell | null {
  if (!Array.isArray(sellToTrader)) return null;
  let best: TraderSell | null = null;
  for (const offer of sellToTrader) {
    if (!isRecord(offer)) continue;
    const price = positiveOrNull(offer.priceRUB);
    const traderId =
      typeof offer.trader === "string" ? offer.trader : str(offer.traderId);
    if (price != null && traderId && (!best || price > best.price)) {
      best = { traderId, price };
    }
  }
  return best;
}

export function parseItemList(
  data: unknown,
  translations?: Translations,
): Item[] {
  const items: Item[] = [];

  for (const raw of itemList(data)) {
    if (!isRecord(raw) || typeof raw.id !== "string") continue;

    const normalizedName = str(raw.normalizedName);
    const name = displayName(
      str(raw.name),
      normalizedName,
      raw.id,
      translations,
    );

    const rawShort = str(raw.shortName);
    const shortName =
      translate(translations, rawShort) ??
      (looksUntranslated(rawShort) ? "" : rawShort);

    const types = Array.isArray(raw.types)
      ? raw.types.filter((t): t is string => typeof t === "string")
      : [];

    items.push({
      id: raw.id,
      name,
      shortName,
      normalizedName,
      types,
      category: categoryOf(types),
      weight: numOrNull(raw.weight),
      iconLink: str(raw.iconLink) || undefined,
      gridImageLink: str(raw.gridImageLink) || undefined,
      wikiLink: str(raw.wikiLink) || undefined,
      noFlea: types.includes("noFlea"),
      lastLowPrice: positiveOrNull(raw.lastLowPrice),
      avg24hPrice: positiveOrNull(raw.avg24hPrice),
      changeLast48hPercent: numOrNull(raw.changeLast48hPercent),
      bestSell: bestTraderSell(raw.sellToTrader),
      searchText: `${name} ${shortName} ${normalizedName.replace(
        /-/g,
        " ",
      )}`.toLowerCase(),
    });
  }

  return items;
}

/* ------------------------------------------------------------------ */
/* filter & sort                                                      */
/* ------------------------------------------------------------------ */

/** Every word of the query must appear; an empty category means "all". */
export function filterItems(
  items: Item[],
  query: string,
  category: string,
): Item[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0 && !category) return items;

  return items.filter(
    (item) =>
      (!category || item.category === category) &&
      words.every((w) => item.searchText.includes(w)),
  );
}

export function listCategories(
  items: Item[],
): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }
  return [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

const collator = new Intl.Collator(undefined, { sensitivity: "base" });

function sortValue(item: Item, key: ItemSortKey): string | number | null {
  switch (key) {
    case "name":
      return item.name;
    case "category":
      return item.category;
    case "weight":
      return item.weight;
    case "lastLowPrice":
      return item.lastLowPrice;
    case "changeLast48hPercent":
      return item.changeLast48hPercent;
    case "bestSellPrice":
      return item.bestSell?.price ?? null;
  }
}

/**
 * Returns a sorted copy. Items without a value always go last (in both
 * directions), ties are broken by name.
 */
export function sortItems(
  items: Item[],
  key: ItemSortKey,
  order: SortOrder,
): Item[] {
  const dir = order === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    const va = sortValue(a, key);
    const vb = sortValue(b, key);

    if (va == null && vb == null) return collator.compare(a.name, b.name);
    if (va == null) return 1;
    if (vb == null) return -1;

    const cmp =
      typeof va === "string" && typeof vb === "string"
        ? collator.compare(va, vb)
        : (va as number) - (vb as number);

    return cmp * dir || collator.compare(a.name, b.name);
  });
}

/* ------------------------------------------------------------------ */
/* formatting                                                         */
/* ------------------------------------------------------------------ */

export function formatChange(percent: number | null): string {
  if (percent == null) return "—";
  return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`;
}
