import { Order, Item, Ammo } from "@/types/ammo";

// basic comparator used to compare two elements (a and b, eg. M855A1 and M995)
// based on a specified property (orderBy, eg. damage)
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (orderBy == "item") return 0; // we don't sort names
  if (b[orderBy] < a[orderBy]) {
    return -1; // b should come before a in the sorted order
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0; // elements are considered equal in terms of the sorting criteria
}

// generate a comparator function based on the desired sorting order (order) and the property (orderBy)
export function getComparator<Key extends keyof any>(
  order: Order, // "asc" | "desc"
  orderBy: Key,
): (
  a: { [key in Key]: number | string | Item },
  b: { [key in Key]: number | string | Item },
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

/**
 * Filter a single ammo item based on caliber and search text
 *
 * @param ammoItem - The individual ammo item to check against filters
 * @param currentCaliber - Currently selected caliber filter (empty string means no filter)
 * @param inputText - Search text to match against ammo name (case insensitive)
 * @returns boolean - True if the item should be included, false if it should be filtered out
 *
 * The function implements three filter scenarios:
 * 1. Both caliber and search text are provided (AND condition)
 * 2. Only caliber is provided
 * 3. Only search text is provided
 * If no filters are active, returns true for all items
 */
export function filterAmmo(
  ammoItem: Ammo,
  currentCaliber: string,
  inputText: string,
): boolean {
  if (currentCaliber && inputText) {
    return (
      ammoItem.caliber === currentCaliber &&
      ammoItem.item.name.toLowerCase().includes(inputText.toLowerCase())
    );
  } else if (currentCaliber) {
    return ammoItem.caliber === currentCaliber;
  } else if (inputText) {
    return ammoItem.item.name.toLowerCase().includes(inputText.toLowerCase());
  }
  return true;
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
 * This function performs two operations in sequence:
 * 1. Filters the input array using the filterAmmo function
 * 2. Sorts the filtered results using the getComparator function
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

// calculate the number of empty rows to display in the table
export function calculateEmptyRows(
  page: number,
  rowsPerPage: number,
  totalRows: number,
): number {
  return page > 0 ? Math.max(0, (page + 1) * rowsPerPage - totalRows) : 0;
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
