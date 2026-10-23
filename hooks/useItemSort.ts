"use client";

import { useCallback, useState } from "react";
import type { ItemSortKey, SortOrder } from "@/types/item";

// text columns start ascending, numeric columns start with the biggest value
const TEXT_KEYS = new Set<ItemSortKey>(["name", "category"]);

export function useItemSort(
  initialKey: ItemSortKey = "name",
  initialOrder: SortOrder = "asc",
) {
  const [sortKey, setSortKey] = useState<ItemSortKey>(initialKey);
  const [order, setOrder] = useState<SortOrder>(initialOrder);

  const handleSort = useCallback(
    (key: ItemSortKey) => {
      if (key === sortKey) {
        setOrder((o) => (o === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setOrder(TEXT_KEYS.has(key) ? "asc" : "desc");
      }
    },
    [sortKey],
  );

  return { sortKey, order, handleSort };
}
