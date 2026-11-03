import { toArray } from "@/lib/tarkovApi";
import { ROUBLES_ID, formatPrice } from "@/lib/hideout";
import type { HideoutStation } from "@/types/hideout";
import type { Item, SortOrder } from "@/types/item";
import type {
  Craft,
  CraftEconomics,
  CraftFilters,
  CraftItemEntry,
  CraftRow,
  CraftSortKey,
} from "@/types/craft";

type UnknownRecord = Record<string, unknown>;

const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const num = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;
/** a reference is either an id string or an object carrying an id */
const refId = (v: unknown): string =>
  typeof v === "string" ? v : isRecord(v) ? str(v.id) : "";

/** `attributes` is `{ tool: true }`; a `[{ name, value }]` list is accepted too. */
function hasFlag(attributes: unknown, name: string): boolean {
  if (Array.isArray(attributes)) {
    return attributes.some(
      (a) => isRecord(a) && a.name === name && String(a.value) === "true",
    );
  }
  return isRecord(attributes) && attributes[name] === true;
}

/* ------------------------------------------------------------------ */
/* parsing                                                            */
/* ------------------------------------------------------------------ */

/** The payload is a bare array; `{ crafts: [...] }` and id-keyed objects work too. */
function craftList(data: unknown): unknown[] {
  const inner = isRecord(data) && data.crafts != null ? data.crafts : data;
  return toArray<unknown>(inner);
}

export function parseCrafts(data: unknown): Craft[] {
  const crafts: Craft[] = [];

  for (const raw of craftList(data)) {
    if (!isRecord(raw) || typeof raw.id !== "string") continue;

    const product = isRecord(raw.productItem) ? raw.productItem : null;
    const productItemId = product ? refId(product.item) : "";
    if (!product || !productItemId) continue;

    const ingredients: CraftItemEntry[] = [];
    const tools: CraftItemEntry[] = [];
    const required = Array.isArray(raw.requiredItems) ? raw.requiredItems : [];
    for (const r of required) {
      if (!isRecord(r)) continue;
      const itemId = refId(r.item);
      if (!itemId) continue;
      const entry = { itemId, count: num(r.count, 1) };
      (hasFlag(r.attributes, "tool") ? tools : ingredients).push(entry);
    }

    crafts.push({
      id: raw.id,
      stationId: refId(raw.station),
      stationLevel: num(raw.level, 1),
      duration: num(raw.duration),
      ingredients,
      tools,
      productItemId,
      productCount: num(product.count, 1),
      taskUnlockId: refId(raw.taskUnlock) || null,
    });
  }

  return crafts;
}

/* ------------------------------------------------------------------ */
/* economics                                                          */
/* ------------------------------------------------------------------ */

/** Flea price: the last lowest offer, else the 24h average. */
function fleaPrice(item: Item | undefined): number | null {
  return item ? item.lastLowPrice ?? item.avg24hPrice : null;
}

/** What it costs to get one: roubles are worth 1, everything else is bought on the flea. */
function unitCost(itemId: string, item: Item | undefined): number | null {
  return itemId === ROUBLES_ID ? 1 : fleaPrice(item);
}

/** What one is worth: the flea price, else what a trader pays for it. */
function unitValue(itemId: string, item: Item | undefined): number | null {
  if (itemId === ROUBLES_ID) return 1;
  if (!item) return null;
  return fleaPrice(item) ?? item.bestSell?.price ?? null;
}

/**
 * Tools are not consumed, so they are not part of the cost. Flea market fees
 * are not included either, which makes the profit an upper estimate.
 */
export function computeEconomics(
  craft: Craft,
  itemsById: ReadonlyMap<string, Item>,
): CraftEconomics {
  let total = 0;
  let missing = 0;
  for (const ingredient of craft.ingredients) {
    const price = unitCost(ingredient.itemId, itemsById.get(ingredient.itemId));
    if (price == null) missing++;
    else total += price * ingredient.count;
  }
  const cost = missing === 0 ? total : null;

  const productPrice = unitValue(
    craft.productItemId,
    itemsById.get(craft.productItemId),
  );
  const value = productPrice == null ? null : productPrice * craft.productCount;

  const profit = cost != null && value != null ? value - cost : null;
  const hours = craft.duration / 3600;
  const profitPerHour = profit != null && hours > 0 ? profit / hours : null;

  return { cost, missingPrices: missing, value, profit, profitPerHour };
}

export function buildRows(
  crafts: Craft[],
  itemsById: ReadonlyMap<string, Item>,
  stationsById: ReadonlyMap<string, HideoutStation>,
): CraftRow[] {
  return crafts.map((craft) => {
    const product = itemsById.get(craft.productItemId);
    const productName = product?.name ?? "Unknown item";
    const stationName =
      stationsById.get(craft.stationId)?.name ?? "Unknown station";
    const materialNames = [...craft.ingredients, ...craft.tools]
      .map((entry) => itemsById.get(entry.itemId)?.name ?? "")
      .join(" ");

    return {
      craft,
      productName,
      stationName,
      searchText: `${productName} ${
        product?.shortName ?? ""
      } ${materialNames}`.toLowerCase(),
      econ: computeEconomics(craft, itemsById),
    };
  });
}

/* ------------------------------------------------------------------ */
/* filter & sort                                                      */
/* ------------------------------------------------------------------ */

/** Every word of the query must appear in the product or a material name. */
export function filterCrafts(rows: CraftRow[], f: CraftFilters): CraftRow[] {
  const words = f.query.toLowerCase().split(/\s+/).filter(Boolean);
  if (
    words.length === 0 &&
    !f.stationId &&
    !f.profitableOnly &&
    !f.hideTaskLocked
  ) {
    return rows;
  }

  return rows.filter(
    (row) =>
      (!f.stationId || row.craft.stationId === f.stationId) &&
      (!f.profitableOnly || (row.econ.profit != null && row.econ.profit > 0)) &&
      (!f.hideTaskLocked || row.craft.taskUnlockId === null) &&
      words.every((w) => row.searchText.includes(w)),
  );
}

const collator = new Intl.Collator(undefined, { sensitivity: "base" });

function sortValue(row: CraftRow, key: CraftSortKey): string | number | null {
  switch (key) {
    case "product":
      return row.productName;
    case "station":
      return row.stationName;
    case "duration":
      return row.craft.duration;
    case "cost":
      return row.econ.cost;
    case "value":
      return row.econ.value;
    case "profit":
      return row.econ.profit;
    case "profitPerHour":
      return row.econ.profitPerHour;
  }
}

/**
 * Returns a sorted copy. Rows without a value always go last (in both
 * directions); ties are broken by station level, then product name.
 */
export function sortCrafts(
  rows: CraftRow[],
  key: CraftSortKey,
  order: SortOrder,
): CraftRow[] {
  const dir = order === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    const va = sortValue(a, key);
    const vb = sortValue(b, key);

    if (va == null && vb == null) {
      return collator.compare(a.productName, b.productName);
    }
    if (va == null) return 1;
    if (vb == null) return -1;

    const cmp =
      typeof va === "string" && typeof vb === "string"
        ? collator.compare(va, vb)
        : (va as number) - (vb as number);

    return (
      cmp * dir ||
      a.craft.stationLevel - b.craft.stationLevel ||
      collator.compare(a.productName, b.productName)
    );
  });
}

/* ------------------------------------------------------------------ */
/* formatting                                                         */
/* ------------------------------------------------------------------ */

/** "+1,500 ₽", "-250 ₽", "—" when unknown. */
export function formatProfit(value: number | null): string {
  if (value == null) return "—";
  const rounded = Math.round(value) || 0; // avoids "-0"
  return `${rounded > 0 ? "+" : ""}${formatPrice(rounded)}`;
}

export type { SortOrder };
