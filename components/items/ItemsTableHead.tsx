import { TableCell, TableHead, TableRow, TableSortLabel } from "@mui/material";
import type { ItemSortKey, SortOrder } from "@/types/item";

interface Column {
  id: string;
  label: string;
  sortKey?: ItemSortKey;
  align?: "left" | "right";
}

export const ITEM_COLUMNS: Column[] = [
  { id: "favorite", label: "" },
  { id: "image", label: "" },
  { id: "name", label: "Name", sortKey: "name" },
  { id: "category", label: "Category", sortKey: "category" },
  { id: "weight", label: "Weight", sortKey: "weight", align: "right" },
  {
    id: "lastLowPrice",
    label: "Flea price",
    sortKey: "lastLowPrice",
    align: "right",
  },
  {
    id: "changeLast48hPercent",
    label: "48h change",
    sortKey: "changeLast48hPercent",
    align: "right",
  },
  {
    id: "bestSellPrice",
    label: "Best trader sell",
    sortKey: "bestSellPrice",
    align: "right",
  },
];

export const ITEM_COLUMN_COUNT = ITEM_COLUMNS.length;

interface ItemsTableHeadProps {
  sortKey: ItemSortKey;
  order: SortOrder;
  onSort: (key: ItemSortKey) => void;
}

export default function ItemsTableHead({
  sortKey,
  order,
  onSort,
}: ItemsTableHeadProps) {
  return (
    <TableHead>
      <TableRow>
        {ITEM_COLUMNS.map((column) => (
          <TableCell
            key={column.id}
            align={column.align}
            sortDirection={
              column.sortKey && sortKey === column.sortKey ? order : false
            }
          >
            {column.sortKey ? (
              <TableSortLabel
                active={sortKey === column.sortKey}
                direction={sortKey === column.sortKey ? order : "asc"}
                onClick={() => onSort(column.sortKey!)}
              >
                {column.label}
              </TableSortLabel>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
