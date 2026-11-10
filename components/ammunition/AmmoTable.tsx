"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Ammo, Order, AmmoTableProps } from "@/types/ammo";
import { useUser } from "@auth0/nextjs-auth0/client";
import { favoriteErrorMessage, useFavorites } from "@/hooks/useFavorites";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
// components
import AmmoTableFilter from "./AmmoTableFilter";
import AmmoSearchbar from "./AmmoSearchbar";
import AmmoTableHead from "./AmmoTableHead";
import AmmoTablePagination from "./AmmoTablePagination";
import AmmoTableRow from "./AmmoTableRow";
// utils
import {
  ammoQueryString,
  filterAndSortAmmo,
  parseSortKey,
  parseSortOrder,
} from "@/utils/ammo-utils";
// MUI
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";

// favorite button + the columns of AmmoTableHead
const COLUMN_COUNT = 9;

export default function AmmoTable({ ammo }: AmmoTableProps) {
  // get user data from auth0
  const { user } = useUser();
  // the view (search, caliber, sort, favorites only) lives in the URL so it
  // can be shared; it is read once when the page opens
  const searchParams = useSearchParams();

  // hook to manage favorites (shared with the items page and dashboard)
  const {
    favoriteIds,
    isLoaded: favoritesLoaded,
    loadFavorites: getUsersFavoriteAmmo,
    addFavorite: handleFavoriteAmmo,
    removeFavorite: handleRemoveFavoriteAmmo,
  } = useFavorites();

  // caliber filter state
  const [currentCaliber, setCurrentCaliber] = useState(
    () => searchParams?.get("caliber") ?? "",
  );
  // search input state (raw) and its debounced value (used for filtering)
  const [inputText, setInputText] = useState(
    () => searchParams?.get("q") ?? "",
  );
  const debouncedInputText = useDebouncedValue(inputText, 300);
  const [favoritesOnly, setFavoritesOnly] = useState(
    () => searchParams?.get("fav") === "1",
  );
  // sorting states
  const [order, setOrder] = useState<Order>(() =>
    parseSortOrder(searchParams?.get("dir")),
  );
  const [orderBy, setOrderBy] = useState<keyof Ammo>(() =>
    parseSortKey(searchParams?.get("sort")),
  );
  // pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  useEffect(() => {
    if (user) {
      getUsersFavoriteAmmo();
    }
  }, [user, getUsersFavoriteAmmo]);

  // go back to the first page whenever the search text changes, otherwise a
  // narrower result set could leave us on a page that no longer exists
  useEffect(() => {
    setPage(0);
  }, [debouncedInputText]);

  // a caliber that doesn't exist (a stale link, or after switching game mode)
  // would silently show nothing
  useEffect(() => {
    if (currentCaliber && !ammo.some((a) => a.caliber === currentCaliber)) {
      setCurrentCaliber("");
    }
  }, [ammo, currentCaliber]);

  // keep the address bar in sync with the view. The native history API
  // updates the URL without a server round trip or a new history entry.
  useEffect(() => {
    const query = ammoQueryString({
      query: debouncedInputText,
      caliber: currentCaliber,
      favoritesOnly,
      sortKey: orderBy,
      order,
    });
    const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState(null, "", url);
  }, [debouncedInputText, currentCaliber, favoritesOnly, orderBy, order]);

  // handle table head sorting
  const handleRequestSort = useCallback(
    (event: React.MouseEvent<unknown>, property: keyof Ammo) => {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
      setPage(0);
    },
    [order, orderBy],
  );

  // The filter component decides the next value (it toggles off when the
  // selected caliber is clicked again), so the parent only stores it. This
  // also avoids reading a stale `currentCaliber` from the closure.
  const handleFilterButtonClick = useCallback((caliber: string) => {
    setPage(0);
    setCurrentCaliber(caliber);
  }, []);

  // handle change page
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  //  handle change rows per page
  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    [],
  );

  // "favorites only" needs a logged-in user and a loaded favorites list;
  // until then the full list is shown
  const showFavoritesToggle = Boolean(user);
  const favoritesFilterOn =
    favoritesOnly && showFavoritesToggle && favoritesLoaded;

  // filter and sort the ammo data to be displayed
  const filteredAndSortedAmmo = useMemo(() => {
    const list = filterAndSortAmmo(
      ammo,
      currentCaliber,
      debouncedInputText,
      order,
      orderBy,
    );
    return favoritesFilterOn
      ? list.filter((a) => favoriteIds.has(a.item.id))
      : list;
  }, [
    ammo,
    currentCaliber,
    debouncedInputText,
    order,
    orderBy,
    favoritesFilterOn,
    favoriteIds,
  ]);

  // total counts for pagination
  const totalRows = filteredAndSortedAmmo.length;

  // never stay on a page that no longer exists (e.g. after unfavoriting the
  // last row of the last page)
  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= totalRows) setPage(0);
  }, [page, rowsPerPage, totalRows]);

  // data to be displayed in the current table page
  const visibleRows = useMemo(() => {
    return filteredAndSortedAmmo.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [filteredAndSortedAmmo, page, rowsPerPage]);

  // Avoid a layout jump on the last page of a longer list. The first page
  // doesn't need a filler: a short result list shouldn't leave a big gap.
  const emptyRows =
    page > 0 ? Math.max(0, rowsPerPage - visibleRows.length) : 0;

  const filtersActive =
    inputText.trim() !== "" ||
    currentCaliber !== "" ||
    (favoritesOnly && showFavoritesToggle);

  const clearFilters = useCallback(() => {
    setInputText("");
    setCurrentCaliber("");
    setFavoritesOnly(false);
    setPage(0);
  }, []);

  // handle favorite icon click. Resolves to true if the favorite status was
  // actually updated, so the row can roll back its optimistic UI on failure.
  const handleFavoriteClick = useCallback(
    async (itemId: string): Promise<boolean> => {
      if (!user) {
        setSnackbarMessage("Please log in to use the favorite feature!");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return false;
      }

      const isFavorite = favoriteIds.has(itemId);

      try {
        if (isFavorite) {
          await handleRemoveFavoriteAmmo(itemId);
        } else {
          await handleFavoriteAmmo(itemId);
        }
        setSnackbarMessage(
          isFavorite ? "Removed from favorite" : "Added to favorite",
        );
        setSnackbarSeverity(isFavorite ? "info" : "success");
        setSnackbarOpen(true);
        return true;
      } catch (error) {
        console.error("Failed to update favorite status:", error);
        setSnackbarMessage(favoriteErrorMessage(error));
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return false;
      }
    },
    [user, favoriteIds, handleFavoriteAmmo, handleRemoveFavoriteAmmo],
  );

  // handle snackbar close
  const handleCloseSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  return (
    <Grid width="90%" maxWidth="1400px">
      {/* search, caliber filter and the shortcuts for both */}
      <Paper sx={{ my: 3, p: { xs: 2, sm: 3 } }} elevation={3}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ flex: "1 1 320px" }}>
            <AmmoSearchbar value={inputText} setInputText={setInputText} />
          </Box>

          {showFavoritesToggle && (
            <Chip
              icon={<FavoriteIcon />}
              label="Favorites only"
              clickable
              color={favoritesOnly ? "primary" : "default"}
              variant={favoritesOnly ? "filled" : "outlined"}
              aria-pressed={favoritesOnly}
              onClick={() => {
                setFavoritesOnly((v) => !v);
                setPage(0);
              }}
            />
          )}

          {filtersActive && (
            <Button color="inherit" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </Box>

        <AmmoTableFilter
          ammo={ammo}
          currentCaliber={currentCaliber}
          onFilterButtonClick={handleFilterButtonClick}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          aria-live="polite"
          sx={{ display: "block", mt: 2 }}
        >
          {totalRows.toLocaleString("en-US")} of{" "}
          {ammo.length.toLocaleString("en-US")} rounds
        </Typography>
      </Paper>

      {/* the data table */}
      <TableContainer
        sx={{
          p: { xs: 1, sm: "2rem" },
          mt: 2,
          overflowX: "auto", // scroll x on small screens
        }}
        component={Paper}
        elevation={3}
      >
        <Table
          sx={{
            mt: "2vh",
            border: "3px solid #9a8866",
            minWidth: 900,
          }}
          size="small"
        >
          <AmmoTableHead
            onRequestSort={handleRequestSort}
            order={order}
            orderBy={orderBy}
          />
          <TableBody>
            {visibleRows.map((ammoData) => (
              <AmmoTableRow
                key={ammoData.item.id}
                ammoData={ammoData}
                isFavorite={favoriteIds.has(ammoData.item.id)}
                handleFavoriteClick={handleFavoriteClick}
                user={user}
              />
            ))}
            {totalRows === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT} align="center" sx={{ py: 4 }}>
                  No ammunition matches your filters.
                </TableCell>
              </TableRow>
            )}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={COLUMN_COUNT} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* the pagination */}
      <AmmoTablePagination
        totalRows={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {/* the snackbar showing add or remove favorite ammo status */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
