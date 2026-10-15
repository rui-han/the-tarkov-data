"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useItems } from "@/hooks/useItems";
import { useTraderMap } from "@/hooks/useHideoutData";
import FallbackImage from "@/components/hideout/FallbackImage";
import {
  filterItems,
  formatChange,
  listCategories,
  sortItems,
} from "@/lib/items";
import { formatPrice } from "@/lib/hideout";
import type { GameMode } from "@/lib/tarkovApi";
import type { Item, ItemSortKey, SortOrder } from "@/types/item";
import {
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  Link as MuiLink,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const DEFAULT_ITEMS_PER_PAGE = 20;

interface Column {
  id: string;
  label: string;
  sortKey?: ItemSortKey;
  align?: "left" | "right";
}

const columns: Column[] = [
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

// text columns start ascending, numeric columns start with the biggest value
const TEXT_KEYS = new Set<ItemSortKey>(["name", "category"]);

const ItemRow = React.memo(function ItemRow({
  item,
  traderName,
}: {
  item: Item;
  traderName?: string;
}) {
  const change = item.changeLast48hPercent;

  return (
    <TableRow hover>
      <TableCell sx={{ width: 80, p: 1 }}>
        <FallbackImage
          sources={[item.iconLink, item.gridImageLink]}
          alt={item.name}
          size={56}
        />
      </TableCell>

      <TableCell>
        {item.wikiLink ? (
          <MuiLink
            href={item.wikiLink}
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="hover"
            sx={{ fontWeight: 600 }}
          >
            {item.name}
          </MuiLink>
        ) : (
          <Typography component="span" sx={{ fontWeight: 600 }}>
            {item.name}
          </Typography>
        )}
        {item.shortName && item.shortName !== item.name && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            {item.shortName}
          </Typography>
        )}
      </TableCell>

      <TableCell>
        <Chip label={item.category} size="small" variant="outlined" />
      </TableCell>

      <TableCell align="right">
        {item.weight != null ? `${item.weight.toFixed(2)} kg` : "—"}
      </TableCell>

      <TableCell align="right">
        {item.lastLowPrice != null ? (
          <Tooltip
            title={
              item.avg24hPrice != null
                ? `24h average: ${formatPrice(item.avg24hPrice)}`
                : ""
            }
          >
            <span>{formatPrice(item.lastLowPrice)}</span>
          </Tooltip>
        ) : item.noFlea ? (
          <Chip label="No flea" size="small" variant="outlined" />
        ) : (
          "N/A"
        )}
      </TableCell>

      <TableCell
        align="right"
        sx={{
          color:
            change == null || change === 0
              ? "text.secondary"
              : change > 0
              ? "success.main"
              : "error.main",
        }}
      >
        {item.lastLowPrice != null ? formatChange(change) : "—"}
      </TableCell>

      <TableCell align="right">
        {item.bestSell ? (
          <>
            {formatPrice(item.bestSell.price)}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              {traderName ?? "…"}
            </Typography>
          </>
        ) : (
          "—"
        )}
      </TableCell>
    </TableRow>
  );
});

type ItemsTableProps = {
  itemsPerPage?: number;
};

export default function ItemsTable({
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
}: ItemsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [category, setCategory] = useState("");
  const [sortKey, setSortKey] = useState<ItemSortKey>("name");
  const [order, setOrder] = useState<SortOrder>("asc");
  const [gameMode, setGameMode] = useState<GameMode>("regular");

  // json.tarkov.dev ships the full items file (no server-side search or
  // pagination), so filtering, sorting and "infinite scroll" slicing all
  // happen on the client.
  const { items: allItems, error, isLoading } = useItems(gameMode);
  // used only for the trader names; never blocks the page
  const { tradersById } = useTraderMap();

  const categories = useMemo(() => listCategories(allItems), [allItems]);

  // sort once per sort change; filtering keeps that order
  const sortedItems = useMemo(
    () => sortItems(allItems, sortKey, order),
    [allItems, sortKey, order],
  );
  const filteredItems = useMemo(
    () => filterItems(sortedItems, debouncedSearch, category),
    [sortedItems, debouncedSearch, category],
  );

  const [visibleCount, setVisibleCount] = useState(itemsPerPage);

  // start from the top whenever the result list changes
  useEffect(() => {
    setVisibleCount(itemsPerPage);
  }, [debouncedSearch, category, sortKey, order, gameMode, itemsPerPage]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const loadMoreItems = useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + itemsPerPage, filteredItems.length),
    );
  }, [filteredItems.length, itemsPerPage]);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) loadMoreItems();
      },
      { rootMargin: "100px", threshold: 0.1 },
    );

    const el = loaderRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [loadMoreItems, hasMore]);

  const handleSort = (key: ItemSortKey) => {
    if (key === sortKey) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setOrder(TEXT_KEYS.has(key) ? "asc" : "desc");
    }
  };

  if (error) {
    return (
      <Box m={3}>
        <Typography color="error">
          Error loading items: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, margin: "auto", mt: 4, px: 2 }}>
      {/* controls */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <TextField
          variant="outlined"
          label="Search Items"
          placeholder="Name or short name, e.g. m855 pack"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: "1 1 280px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ flex: "0 1 220px" }}
          InputLabelProps={{ shrink: true }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">All categories</MenuItem>
          {categories.map(({ label, count }) => (
            <MenuItem key={label} value={label}>
              {label} ({count})
            </MenuItem>
          ))}
        </TextField>

        <ToggleButtonGroup
          exclusive
          color="primary"
          value={gameMode}
          onChange={(_, value: GameMode | null) => {
            if (value) setGameMode(value);
          }}
          aria-label="Game mode"
        >
          <ToggleButton value="regular">PvP</ToggleButton>
          <ToggleButton value="pve">PvE</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {isLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40vh"
        >
          <CircularProgress size={40} />
        </Box>
      ) : filteredItems.length === 0 ? (
        <Box m={3} textAlign="center" component={Paper} py={4}>
          <Typography>
            {debouncedSearch || category
              ? "No items match your filters."
              : "No items available."}
          </Typography>
        </Box>
      ) : (
        <>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 1 }}
          >
            {filteredItems.length.toLocaleString("en-US")} items
          </Typography>

          <TableContainer component={Paper}>
            <Table aria-label="Items Table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      sortDirection={
                        column.sortKey && sortKey === column.sortKey
                          ? order
                          : false
                      }
                    >
                      {column.sortKey ? (
                        <TableSortLabel
                          active={sortKey === column.sortKey}
                          direction={sortKey === column.sortKey ? order : "asc"}
                          onClick={() => handleSort(column.sortKey!)}
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

              <TableBody>
                {visibleItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    traderName={
                      item.bestSell
                        ? tradersById.get(item.bestSell.traderId)?.name
                        : undefined
                    }
                  />
                ))}
              </TableBody>
            </Table>

            <Box ref={loaderRef} display="flex" justifyContent="center" p={2}>
              {hasMore && <CircularProgress size={24} />}
              {!hasMore && (
                <Typography variant="caption" color="textSecondary">
                  End of results
                </Typography>
              )}
            </Box>
          </TableContainer>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            Flea price is the last lowest offer (hover for the 24h average); 48h
            change is the flea price change over the last 48 hours.
          </Typography>
        </>
      )}
    </Box>
  );
}
