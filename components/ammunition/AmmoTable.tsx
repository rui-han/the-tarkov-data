"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Ammo, Order, AmmoTableProps } from "@/types/ammo";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useFavoriteAmmo } from "@/hooks/useFavoriteAmmo";
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

  // hook to manage favorite ammo
  const {
    userFavoriteAmmo,
    getUsersFavoriteAmmo,
    handleFavoriteAmmo,
    handleRemoveFavoriteAmmo,
  } = useFavoriteAmmo();

  // caliber filter state
  const [currentCaliber, setCurrentCaliber] = useState("");
  // search input state
  const [inputText, setInputText] = useState("");
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
      getUsersFavoriteAmmo(user.sub as string);
    }
  }, [user, getUsersFavoriteAmmo]);

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

  // handle ammoType filter button clicks
  const handleFilterButtonClick = useCallback((caliber: string) => {
    // return to the first page, in case that would return an empty table
    setPage(0);
    // click and unclick
    if (currentCaliber === caliber) setCurrentCaliber("");
    else setCurrentCaliber(caliber);
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
    return filterAndSortAmmo(ammo, currentCaliber, inputText, order, orderBy);
  }, [ammo, currentCaliber, inputText, order, orderBy]);

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

  // handle favorite icon click
  const handleFavoriteClick = useCallback(
    async (itemId: string) => {
      if (!user) {
        setSnackbarMessage("Please log in to use the favorite feature!");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return;
      }

      const isFavorite = userFavoriteAmmo.some((fav) => fav.itemId === itemId);

      if (isFavorite) {
        setSnackbarMessage("Removed from favorite");
        setSnackbarSeverity("info");
      } else {
        setSnackbarMessage("Added to favorite");
        setSnackbarSeverity("success");
      }
      setSnackbarOpen(true);

      try {
        if (isFavorite) {
          // remove from favorite
          await handleRemoveFavoriteAmmo(user, itemId);
        } else {
          // add to favorite
          await handleFavoriteAmmo(user, itemId);
        }
      } catch (error) {
        // handle error
        setSnackbarMessage(
          "Failed to update favorite status, please try again",
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
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
