"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
import { filterAndSortAmmo } from "@/utils/ammo-utils";
// MUI
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Snackbar,
  Alert,
} from "@mui/material";

export default function AmmoTable({ ammo }: AmmoTableProps) {
  // get user data from auth0
  const { user } = useUser();

  // hook to manage favorites (shared with the items page and dashboard)
  const {
    favorites: userFavoriteAmmo, // all favorites; lookups are by itemId
    loadFavorites: getUsersFavoriteAmmo,
    addFavorite: handleFavoriteAmmo,
    removeFavorite: handleRemoveFavoriteAmmo,
  } = useFavorites();

  // caliber filter state
  const [currentCaliber, setCurrentCaliber] = useState("");
  // search input state (raw) and its debounced value (used for filtering)
  const [inputText, setInputText] = useState("");
  const debouncedInputText = useDebouncedValue(inputText, 300);
  // sorting states
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Ammo>("damage");
  // pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
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

  // filter and sort the ammo data to be displayed
  const filteredAndSortedAmmo = useMemo(() => {
    return filterAndSortAmmo(
      ammo,
      currentCaliber,
      debouncedInputText,
      order,
      orderBy,
    );
  }, [ammo, currentCaliber, debouncedInputText, order, orderBy]);

  // data to be displayed in the current table page
  const visibleRows = useMemo(() => {
    return filteredAndSortedAmmo.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [filteredAndSortedAmmo, page, rowsPerPage]);

  // total counts for pagination
  const totalRows = filteredAndSortedAmmo.length;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = rowsPerPage - visibleRows.length;

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

      const isFavorite = userFavoriteAmmo.some((fav) => fav.itemId === itemId);

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
    [user, userFavoriteAmmo, handleFavoriteAmmo, handleRemoveFavoriteAmmo],
  );

  // handle snackbar close
  const handleCloseSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  return (
    <Grid width="90%" maxWidth="1400px">
      {/* filter buttons*/}
      <AmmoTableFilter
        ammo={ammo}
        currentCaliber={currentCaliber}
        onFilterButtonClick={handleFilterButtonClick}
      />

      {/* ammo search bar */}
      <AmmoSearchbar setInputText={setInputText} />

      {/* the data table */}
      <TableContainer
        sx={{
          padding: "2rem",
          mt: 4,
          overflowX: "auto", // scroll x on small screens
        }}
        component={Paper}
        elevation={3}
      >
        <Table
          sx={{
            mt: "2vh",
            border: "3px solid #9a8866",
            minWidth: 650,
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
                isFavorite={userFavoriteAmmo.some(
                  (fav) => fav.itemId === ammoData.item.id,
                )}
                handleFavoriteClick={handleFavoriteClick}
                user={user}
              />
            ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={7} />
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
