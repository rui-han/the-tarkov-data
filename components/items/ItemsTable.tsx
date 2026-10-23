"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { favoriteErrorMessage, useFavorites } from "@/hooks/useFavorites";
import { useGameMode } from "@/contexts/GameModeContext";
import { useItemSort } from "@/hooks/useItemSort";
import { useItems } from "@/hooks/useItems";
import { useTraderMap } from "@/hooks/useHideoutData";
import ItemRow from "./ItemRow";
import ItemsTableHead from "./ItemsTableHead";
import { filterItems, listCategories, sortItems } from "@/lib/items";
import {
  Alert,
  Box,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableContainer,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const DEFAULT_ITEMS_PER_PAGE = 20;

type ItemsTableProps = {
  itemsPerPage?: number;
};

export default function ItemsTable({
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
}: ItemsTableProps) {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [category, setCategory] = useState("");
  const { sortKey, order, handleSort } = useItemSort("name", "asc");
  // the mode is picked in the nav bar
  const { gameMode } = useGameMode();

  // json.tarkov.dev ships the full items file (no server-side search or
  // pagination), so filtering, sorting and "infinite scroll" slicing all
  // happen on the client.
  const { items: allItems, error, isLoading } = useItems();
  // used only for the trader names; never blocks the page
  const { tradersById } = useTraderMap();

  /* ---------------------------- favorites ---------------------------- */

  const { favoriteIds, loadFavorites, toggleFavorite } = useFavorites();
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "info" | "warning" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (user) loadFavorites();
  }, [user, loadFavorites]);

  const handleToggleFavorite = useCallback(
    async (itemId: string) => {
      if (!user) {
        setSnackbar({
          open: true,
          message: "Please log in to use the favorite feature!",
          severity: "warning",
        });
        return;
      }

      setPendingIds((prev) => new Set(prev).add(itemId));
      try {
        const nowFavorite = await toggleFavorite(itemId);
        setSnackbar({
          open: true,
          message: nowFavorite
            ? "Added to favorites"
            : "Removed from favorites",
          severity: nowFavorite ? "success" : "info",
        });
      } catch (err) {
        console.error("Failed to update favorite status:", err);
        setSnackbar({
          open: true,
          message: favoriteErrorMessage(err),
          severity: "error",
        });
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    },
    [user, toggleFavorite],
  );

  /* --------------------------- filter & sort -------------------------- */

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
              <ItemsTableHead
                sortKey={sortKey}
                order={order}
                onSort={handleSort}
              />

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
                    isFavorite={favoriteIds.has(item.id)}
                    favoritePending={pendingIds.has(item.id)}
                    onToggleFavorite={handleToggleFavorite}
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
            change is the flea price change over the last 48 hours. Favorites
            show up in your dashboard watchlist.
          </Typography>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
