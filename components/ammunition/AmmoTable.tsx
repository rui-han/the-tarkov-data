"use client";

import { useState, useMemo, useEffect } from "react";
import { Ammo, Order, AmmoTableProps } from "@/types/ammo";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useFavoriteAmmo } from "@/hooks/useFavoriteAmmo";

// components
import AmmoTableFilter from "./AmmoTableFilter";
import AmmoSearchbar from "./AmmoSearchbar";
import AmmoTableHead from "./AmmoTableHead";
import AmmoTablePagination from "./AmmoTablePagination";

// utils
import {
  getComparator,
  filterAndSortAmmo,
  calculateEmptyRows,
} from "@/utils/ammo-utils";

// MUI
import {
  Box,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

export default function AmmoTable({
  ammo,
  inputText,
  currentCaliber,
  setCurrentCaliber,
  setInputText,
}: AmmoTableProps) {
  const { user } = useUser();
  const {
    userFavoriteAmmo,
    getUsersFavoriteAmmo,
    handleFavoriteAmmo,
    handleRemoveFavoriteAmmo,
  } = useFavoriteAmmo();

  // sorting states
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Ammo>("damage");
  // pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (user) {
      getUsersFavoriteAmmo(user.sub as string);
    }
  }, [user]);

  // handle table head sorting
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Ammo,
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // handle ammoType filter button clicks
  const handleFilterButtonClick = (caliber: string) => {
    // return to the first page, in case that would return an empty table
    setPage(0);
    // click and unclick
    if (currentCaliber === caliber) setCurrentCaliber("");
    else setCurrentCaliber(caliber);
  };

  // handle change page
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  //  handle change rows per page
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
  const emptyRows = calculateEmptyRows(page, rowsPerPage, totalRows);

  return (
    <Grid width="90%">
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
            {/* check if there is a result from the combination of searchbar text and filter button */}
            {visibleRows
              .slice()
              .sort(getComparator(order, orderBy))
              .filter((ammoData) => {
                // filter button is selected AND search text exsits
                if (currentCaliber && inputText) {
                  return (
                    ammoData.caliber === currentCaliber &&
                    ammoData.item.name
                      .toLocaleLowerCase()
                      .includes(inputText.toLowerCase())
                  );
                }
                // filter button is selected OR search text exsits
                else if (currentCaliber || inputText) {
                  if (currentCaliber) {
                    return ammoData.caliber === currentCaliber;
                  } else if (inputText) {
                    return ammoData.item.name
                      .toLowerCase()
                      .includes(inputText.toLowerCase());
                  }
                } else {
                  // no button selected AND no search input text, return all ammo data
                  return ammoData;
                }
              })
              .map((ammoData) => {
                return (
                  <TableRow hover key={ammoData.item.id}>
                    {/* the favorite icon */}
                    <TableCell>
                      <IconButton
                        color="inherit"
                        onClick={() => {
                          if (!user) {
                            // TODO: add a modal or something?
                            alert("please LOGIN to use favorite feature!!!");
                          } else {
                            const isFavorite = userFavoriteAmmo.some(
                              (fav) => fav.itemId === ammoData.item.id,
                            );

                            if (isFavorite) {
                              // remove from favs
                              handleRemoveFavoriteAmmo(user, ammoData.item.id);
                            } else {
                              // add to favs
                              handleFavoriteAmmo(user, ammoData.item.id);
                            }
                          }
                        }}
                      >
                        {userFavoriteAmmo.some(
                          (fav) => fav.itemId === ammoData.item.id,
                        ) ? (
                          <FavoriteIcon />
                        ) : (
                          <FavoriteBorderIcon />
                        )}
                      </IconButton>
                    </TableCell>
                    {/* name */}
                    <TableCell>
                      {/* wrap text in a div, avoid horizontal layout jump */}
                      <Box
                        component="div"
                        sx={{
                          width: 300,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {ammoData.item.name}
                      </Box>
                    </TableCell>
                    {/* damage */}
                    <TableCell align="center">
                      {ammoData.projectileCount > 1
                        ? ammoData.projectileCount + " x " + ammoData.damage
                        : ammoData.damage}
                    </TableCell>
                    {/* penetration power */}
                    <TableCell align="center">
                      {ammoData.penetrationPower}
                    </TableCell>
                    {/* armor damage */}
                    <TableCell align="center">{ammoData.armorDamage}</TableCell>
                    {/* accuracy */}
                    <TableCell
                      align="center"
                      sx={{
                        color:
                          // accuracy, the greater the better
                          ammoData.accuracyModifier > 0
                            ? "green"
                            : ammoData.accuracyModifier === 0
                            ? "grey"
                            : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {ammoData.accuracyModifier}
                    </TableCell>
                    {/* recoil */}
                    <TableCell
                      align="center"
                      sx={{
                        color:
                          // recoil, the greater the worse
                          ammoData.recoilModifier > 0
                            ? "red"
                            : ammoData.recoilModifier === 0
                            ? "grey"
                            : "green",
                        fontWeight: "bold",
                      }}
                    >
                      {ammoData.recoilModifier}
                    </TableCell>
                  </TableRow>
                );
              })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 33 * emptyRows }}>
                <TableCell colSpan={6} />
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
    </Grid>
  );
}
