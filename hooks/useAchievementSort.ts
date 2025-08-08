/**
 * Custom hook for sorting achievements (or any table-like data).
 *
 * @template T - The type of data items in the array.
 * @param data - The original array of data.
 * @param options - Optional configuration:
 *   - defaultOrder: Initial sort direction ("asc" | "desc"), defaults to "asc".
 *   - defaultOrderBy: Initial sort key (keyof T), defaults to null (no sorting).
 *
 * @returns An object containing:
 *   - orderBy: The current sort key.
 *   - order: The current sort direction.
 *   - handleSort: A function to change the sorting based on a column key.
 *   - sortedAchievements: The sorted array of data.
 */

import { useState, useMemo } from "react";

export function useAchievementSort<T>(
  data: T[],
  options: { defaultOrder?: "asc" | "desc"; defaultOrderBy?: keyof T } = {},
) {
  // State for the currently sorted column
  const [orderBy, setOrderBy] = useState<keyof T | null>(
    options.defaultOrderBy || null,
  );

  // State for the current sort direction
  const [order, setOrder] = useState<"asc" | "desc">(
    options.defaultOrder || "asc",
  );

  /**
   * Toggles sorting for the given property:
   * - If it's a new column, start with ascending order.
   * - If it's the same column, toggle between asc/desc.
   */
  const handleSort = (property: keyof T) => {
    if (orderBy !== property) {
      setOrder("asc");
      setOrderBy(property);
    } else {
      setOrder(order === "asc" ? "desc" : "asc");
    }
  };

  /**
   * Returns a sorted version of the data.
   * Sorting is case-insensitive for strings.
   * Sorting is stable because we spread into a new array before sorting.
   */
  const sortedAchievements = useMemo(() => {
    if (!orderBy) return data;

    return [...data].sort((a, b) => {
      const valA =
        typeof a[orderBy] === "string"
          ? (a[orderBy] as string).toLowerCase()
          : a[orderBy];
      const valB =
        typeof b[orderBy] === "string"
          ? (b[orderBy] as string).toLowerCase()
          : b[orderBy];

      // Compare values based on current order
      return order === "asc" ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });
  }, [data, orderBy, order]);

  return { orderBy, order, handleSort, sortedAchievements };
}
