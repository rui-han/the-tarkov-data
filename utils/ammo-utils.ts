import { Order, Item, Ammo } from "@/types/ammo";

type SortValue = number | string | Item | null | undefined;

// generate a comparator function based on the desired sorting order (order) and the property (orderBy).
// Rows without a value (e.g. no flea price) always go last, in both directions.
export function getComparator<Key extends keyof any>(
  order: Order, // "asc" | "desc"
  orderBy: Key,
): (a: { [key in Key]: SortValue }, b: { [key in Key]: SortValue }) => number {
  return (a, b) => {
    if (orderBy === "item") return 0; // we don't sort names

    const va = a[orderBy];
    const vb = b[orderBy];
    const aMissing = va == null;
    const bMissing = vb == null;
    if (aMissing || bMissing) {
      return aMissing && bMissing ? 0 : aMissing ? 1 : -1;
    }

    const x = va as number | string;
    const y = vb as number | string;
    const cmp = x < y ? -1 : x > y ? 1 : 0; // ascending
    return order === "desc" ? -cmp || 0 : cmp;
  };
}

/** Every word of the search text must appear in the ammo's search text. */
function matchesText(ammoItem: Ammo, inputText: string): boolean {
  const words = inputText.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = (ammoItem.searchText || ammoItem.item.name).toLowerCase();
  return words.every((word) => haystack.includes(word));
}

/**
 * Filter a single ammo item based on caliber and search text
 *
 * @param ammoItem - The individual ammo item to check against filters
 * @param currentCaliber - Currently selected caliber filter (empty string means no filter)
 * @param inputText - Search words (case insensitive); every word has to match the name or short name
 * @returns boolean - True if the item should be included, false if it should be filtered out
 *
 * If no filters are active, returns true for all items
 */
export function filterAmmo(
  ammoItem: Ammo,
  currentCaliber: string,
  inputText: string,
): boolean {
  if (currentCaliber && ammoItem.caliber !== currentCaliber) return false;
  return matchesText(ammoItem, inputText);
}

/**
 * Filter and sort an array of ammo items
 *
 * @param ammo - The complete array of ammo items
 * @param currentCaliber - Currently selected caliber filter
 * @param inputText - Search text for filtering
 * @param order - Sort order ('asc' or 'desc')
 * @param orderBy - Property to sort by (e.g., 'damage', 'penetrationPower')
 * @returns Ammo[] - A new array containing filtered and sorted ammo items
 *
 * Note: Creates a shallow copy of the input array to avoid mutating the original data
 */
export function filterAndSortAmmo(
  ammo: Ammo[],
  currentCaliber: string,
  inputText: string,
  order: Order,
  orderBy: keyof Ammo,
): Ammo[] {
  return [...ammo]
    .filter((item) => filterAmmo(item, currentCaliber, inputText))
    .sort(getComparator(order, orderBy));
}

// get the color for the ammo property based on its value
export function getAmmoPropertyColor(
  value: number,
  propertyType: "accuracy" | "recoil",
): string {
  if (propertyType === "accuracy") {
    // accuracy, the greater the better
    return value > 0 ? "green" : value === 0 ? "grey" : "red";
  } else if (propertyType === "recoil") {
    // recoil, the greater the worse
    return value > 0 ? "red" : value === 0 ? "grey" : "green";
  }
  return "inherit";
}

/* ------------------------------------------------------------------ */
/* the view kept in the URL                                           */
/* ------------------------------------------------------------------ */

export const DEFAULT_SORT_KEY: keyof Ammo = "damage";
export const DEFAULT_SORT_ORDER: Order = "desc";

/** Columns the table can be sorted by (names are intentionally not sortable). */
export const SORTABLE_KEYS: ReadonlyArray<keyof Ammo> = [
  "damage",
  "penetrationPower",
  "armorClass",
  "armorDamage",
  "accuracyModifier",
  "recoilModifier",
  "fleaPrice",
];

/** Unknown or missing values fall back to the default sort column. */
export function parseSortKey(value: string | null | undefined): keyof Ammo {
  return SORTABLE_KEYS.find((key) => key === value) ?? DEFAULT_SORT_KEY;
}

export function parseSortOrder(value: string | null | undefined): Order {
  return value === "asc" || value === "desc" ? value : DEFAULT_SORT_ORDER;
}

export interface AmmoViewState {
  query: string;
  caliber: string;
  favoritesOnly: boolean;
  sortKey: keyof Ammo;
  order: Order;
}

/**
 * Query string for the current view. Only what differs from the defaults is
 * included, so a plain /ammunition stays clean.
 */
export function ammoQueryString(state: AmmoViewState): string {
  const params = new URLSearchParams();
  const query = state.query.trim();
  if (query) params.set("q", query);
  if (state.caliber) params.set("caliber", state.caliber);
  if (state.favoritesOnly) params.set("fav", "1");
  if (
    state.sortKey !== DEFAULT_SORT_KEY ||
    state.order !== DEFAULT_SORT_ORDER
  ) {
    params.set("sort", state.sortKey);
    params.set("dir", state.order);
  }
  return params.toString();
}
