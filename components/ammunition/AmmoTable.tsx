"use client";

import { useState, useMemo, useEffect } from "react";
import { Ammo, Order, AmmoTableProps, Item } from "@/types/ammo";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useFavoriteAmmo } from "@/hooks/useFavoriteAmmo";
// components
import AmmoTableHead from "./AmmoTableHead";
import AmmoSearchbar from "./AmmoSearchbar";
// MUI
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

// basic comparator used to compare two elements (a and b, eg. M855A1 and M995)
// based on a specified property (orderBy, eg. damage)
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (orderBy == "item") return 0; // we don't sort names
  if (b[orderBy] < a[orderBy]) {
    return -1; // b should come before a in the sorted order
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0; // elements are considered equal in terms of the sorting criteria
}

// generate a comparator function based on the desired sorting order (order) and the property (orderBy)
function getComparator<Key extends keyof any>(
  order: Order, // "asc" | "desc"
  orderBy: Key,
): (
  a: { [key in Key]: number | string | Item },
  b: { [key in Key]: number | string | Item },
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

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

  // handle sorting
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
  // to display caliber names inside filter buttons
  const changeCaliberToShortName = (caliber: string) => {
    return caliber.replace("Caliber", "");
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

  const filterAndSortAmmo = (
    ammo: Ammo[],
    currentCaliber: string,
    inputText: string,
    order: Order,
    orderBy: keyof Ammo,
  ) => {
    return ammo
      .filter((ammoData) => {
        // filter data
        if (currentCaliber && inputText) {
          return (
            ammoData.caliber === currentCaliber &&
            ammoData.item.name.toLowerCase().includes(inputText.toLowerCase())
          );
        } else if (currentCaliber || inputText) {
          if (currentCaliber) {
            return ammoData.caliber === currentCaliber;
          } else if (inputText) {
            return ammoData.item.name
              .toLowerCase()
              .includes(inputText.toLowerCase());
          }
        } else {
          return true; // return all data if nothing matched
        }
      })
      .sort(getComparator(order, orderBy)); // sort filtered data
  };

  // data to be displayed in the current table page
  const visibleRows = useMemo(() => {
    const filteredAndSortedAmmo = filterAndSortAmmo(
      ammo,
      currentCaliber,
      inputText,
      order,
      orderBy,
    );

    return filteredAndSortedAmmo.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [ammo, currentCaliber, inputText, order, orderBy, page, rowsPerPage]);

  // total counts for pagination
  const totalRows = useMemo(() => {
    return ammo.filter((ammoData) => {
      // filter data
      if (currentCaliber && inputText) {
        return (
          ammoData.caliber === currentCaliber &&
          ammoData.item.name.toLowerCase().includes(inputText.toLowerCase())
        );
      } else if (currentCaliber || inputText) {
        if (currentCaliber) {
          return ammoData.caliber === currentCaliber;
        } else if (inputText) {
          return ammoData.item.name
            .toLowerCase()
            .includes(inputText.toLowerCase());
        }
      } else {
        return true; // return all data if nothing matched
      }
    }).length;
  }, [ammo, currentCaliber, inputText]);

  return (
    <Box width="90%">
      {/* filter buttons*/}
      <Paper sx={{ my: 3 }} elevation={3}>
        <Box p={4}>
          {/* filter buttons for ammoType: bullet */}
          <h4>Bullets (Rifles, Pistols, etc):</h4>
          {[
            // using Set() to filter unique caliber values
            ...new Set(
              ammo
                .filter((ammoData) => ammoData.ammoType === "bullet")
                .map((ammoData) => ammoData.caliber),
            ),
          ].map((caliber) => (
            <Button
              sx={{ m: "4px", fontSize: "16px" }}
              key={caliber}
              color="inherit"
              variant={caliber === currentCaliber ? "contained" : "outlined"}
              onClick={() => handleFilterButtonClick(caliber)}
            >
              {changeCaliberToShortName(caliber)}
            </Button>
          ))}
          {/* filter buttons for ammoType: buckshot / grenade / flashbang */}
          <h4>Others (Buckshots, Grenades, Flashbangs):</h4>
          {[
            // using Set() to filter unique caliber values
            ...new Set(
              ammo
                .filter((ammoData) =>
                  ["buckshot", "grenade", "flashbang"].includes(
                    ammoData.ammoType,
                  ),
                )
                .map((ammoData) => ammoData.caliber),
            ),
          ].map((caliber) => (
            <Button
              sx={{ m: "4px", fontSize: "16px" }}
              key={caliber}
              color="inherit"
              variant={caliber === currentCaliber ? "contained" : "outlined"}
              onClick={() => handleFilterButtonClick(caliber)}
            >
              {changeCaliberToShortName(caliber)}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* ammo search bar */}
      <Paper sx={{ my: 2 }} elevation={3}>
        <Box sx={{ width: "100%", p: "3vh" }}>
          <AmmoSearchbar setInputText={setInputText} />
        </Box>
      </Paper>

      {/* the data table */}
      <TableContainer
        sx={{
          padding: "2rem",
          mt: 4,
        }}
        component={Paper}
        elevation={3}
      >
        <Table
          sx={{ mt: "2vh", border: "3px solid #9a8866", width: "100%" }}
          aria-label="Ammunition table"
        >
          <AmmoTableHead
            onRequestSort={handleRequestSort}
            order={order}
            orderBy={orderBy}
          />
          <TableBody>
            {/* check if there is a result from the combination of searchbar text and filter button */}
            {visibleRows.length > 0 ? (
              visibleRows
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
                                handleRemoveFavoriteAmmo(
                                  user,
                                  ammoData.item.id,
                                );
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
                      <TableCell component="th" scope="row">
                        {ammoData.item.name}
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
                      <TableCell align="center">
                        {ammoData.armorDamage}
                      </TableCell>
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
                })
            ) : (
              // otherwise return no results
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box sx={{ py: 10 }}>No Results found</Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* the pagination */}
      <Box m="2vh" display="flex" justifyContent="center">
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Box>
  );
}
