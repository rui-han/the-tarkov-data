"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useItemSort } from "@/hooks/useItemSort";
import ItemRow from "@/components/items/ItemRow";
import ItemsTableHead, {
  ITEM_COLUMN_COUNT,
} from "@/components/items/ItemsTableHead";
import { filterItems, sortItems, summarizeWatchlist } from "@/lib/items";
import { formatPrice } from "@/lib/hideout";
import type { Trader } from "@/types/hideout";
import type { Item } from "@/types/item";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";

interface WatchlistProps {
  favoriteIds: ReadonlySet<string>;
  items: Item[];
  itemsLoading: boolean;
  itemsError: unknown;
  tradersById: ReadonlyMap<string, Trader>;
  /** removes the favorite; must be referentially stable */
  onRemove: (itemId: string, name: string) => void;
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Paper variant="outlined" sx={{ px: 2, py: 1.5, flex: "1 1 160px" }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" sx={{ color }}>
        {value}
      </Typography>
    </Paper>
  );
}

/** A favorite that isn't in the current game mode's item data. */
function UnavailableRow({
  itemId,
  onRemove,
}: {
  itemId: string;
  onRemove: (itemId: string, name: string) => void;
}) {
  return (
    <TableRow>
      <TableCell sx={{ width: 48, p: 0.5 }}>
        <IconButton
          color="inherit"
          size="small"
          aria-label="Remove from favorites"
          onClick={() => onRemove(itemId, "Unavailable item")}
        >
          <FavoriteIcon />
        </IconButton>
      </TableCell>
      <TableCell colSpan={ITEM_COLUMN_COUNT - 1}>
        <Typography variant="body2" color="text.secondary">
          Item details unavailable ({itemId})
        </Typography>
      </TableCell>
    </TableRow>
  );
}

const noPending: ReadonlySet<string> = new Set();

export default function Watchlist({
  favoriteIds,
  items,
  itemsLoading,
  itemsError,
  tradersById,
  onRemove,
}: WatchlistProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  // default: biggest risers first
  const { sortKey, order, handleSort } = useItemSort(
    "changeLast48hPercent",
    "desc",
  );

  const watched = useMemo(
    () => items.filter((item) => favoriteIds.has(item.id)),
    [items, favoriteIds],
  );
  const namesById = useMemo(
    () => new Map(watched.map((item) => [item.id, item.name])),
    [watched],
  );
  // favorites with no matching item: removed from the game, not in this game
  // mode, or the items failed to load
  const unavailableIds = useMemo(
    () => [...favoriteIds].filter((id) => !namesById.has(id)),
    [favoriteIds, namesById],
  );

  const summary = useMemo(() => summarizeWatchlist(watched), [watched]);
  const visibleItems = useMemo(
    () => filterItems(sortItems(watched, sortKey, order), debouncedSearch, ""),
    [watched, sortKey, order, debouncedSearch],
  );

  const handleToggle = useCallback(
    (itemId: string) => onRemove(itemId, namesById.get(itemId) ?? itemId),
    [onRemove, namesById],
  );

  if (favoriteIds.size === 0) {
    return (
      <Box
        component={Paper}
        variant="outlined"
        sx={{ p: 4, textAlign: "center" }}
      >
        <Typography variant="h6" gutterBottom>
          Your watchlist is empty
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Tap the heart on any item to track its flea price, 48h change and
          trader sell price here.
        </Typography>
        <Button
          component={Link}
          href="/items"
          variant="outlined"
          color="inherit"
        >
          Browse items
        </Button>
      </Box>
    );
  }

  if (itemsLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const searching = debouncedSearch.trim() !== "";

  return (
    <>
      {Boolean(itemsError) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Item details and prices could not be loaded.
        </Alert>
      )}

      {watched.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <Stat label="Watching" value={String(favoriteIds.size)} />
          <Stat
            label="Rising (48h)"
            value={String(summary.rising)}
            color="success.main"
          />
          <Stat
            label="Falling (48h)"
            value={String(summary.falling)}
            color="error.main"
          />
          <Stat
            label="Combined flea price"
            value={formatPrice(summary.totalFleaValue)}
          />
        </Box>
      )}

      <TextField
        variant="outlined"
        size="small"
        label="Search watchlist"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2, width: "100%", maxWidth: 360 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table aria-label="Watchlist" sx={{ minWidth: 800 }}>
          <ItemsTableHead sortKey={sortKey} order={order} onSort={handleSort} />
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
                isFavorite
                favoritePending={noPending.has(item.id)}
                onToggleFavorite={handleToggle}
              />
            ))}

            {!searching &&
              unavailableIds.map((id) => (
                <UnavailableRow key={id} itemId={id} onRemove={onRemove} />
              ))}

            {searching && visibleItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={ITEM_COLUMN_COUNT} align="center">
                  No favorites match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 1 }}
      >
        Flea price is the last lowest offer (hover for the 24h average). Prices
        follow the game mode selected in the top bar.
      </Typography>
    </>
  );
}
