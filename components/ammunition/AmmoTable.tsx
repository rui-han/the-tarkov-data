"use client";

import { useState, useMemo, useEffect } from "react";
import { Ammo, Order, AmmoTableProps, Item } from "@/types/ammo";
import { UserProfile, useUser } from "@auth0/nextjs-auth0/client";
import prisma from "@/prisma/db";

// components
import AmmoTableHead from "./AmmoTableHead";
import AmmoSearchbar from "./AmmoSearchbar";

// MUI
import {
  Box,
  Button,
  Divider,
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

  // sorting states
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Ammo>("damage");
  // pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // users favorite ammos
  const [userFavoriteAmmo, setUserFavoriteAmmo] = useState<string[]>([]);

  useEffect(() => {
    getUsersFavoriteAmmo(user?.sub as string);

    console.log(`${user?.name}'s favorite ammos are: ${userFavoriteAmmo}`);
  }, [user]);

  const getUsersFavoriteAmmo = async (auth0Id: string) => {
    const res = await fetch(
      `/api/users/ammo/get-favorite-ammo?auth0Id=${auth0Id}`,
    );
    const favoriteAmmos = await res.json();
    setUserFavoriteAmmo(favoriteAmmos);
  };

  // handle favorite
  const handleFavoriteAmmo = async (user: UserProfile, itemId: string) => {
    // alert(`you clicked ammo id ${itemId} for user ${user.name}`);
    const res = await fetch("/api/users/ammo/add-favorite-ammo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth0Id: user.sub,
        itemId: itemId,
      }),
    });
  };

  // handle unfavorite
  const handleRemoveFavoriteAmmo = async () => {};

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

  // data to be displayed in the current table page
  const visibleRows = useMemo(() => {
    const filteredData = ammo
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

    return filteredData.slice(
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
    <>
      <TableContainer
        sx={{
          width: "90%",
          m: "3vh",
          padding: "2rem",
        }}
        component={Paper}
      >
        {/* filter buttons for ammoType: bullet */}
        <Box m="2vh 0">
          <Box component="h3">Bullets (Rifles, Pistols, etc):</Box>
          {[
            // using Set() to filter unique caliber values
            ...new Set(
              ammo
                .filter((ammoData) => ammoData.ammoType === "bullet")
                .map((ammoData) => ammoData.caliber),
            ),
          ].map((caliber) => (
            <Button
              sx={{ m: "4px", fontSize: "1.1em" }}
              key={caliber}
              color="inherit"
              variant={caliber === currentCaliber ? "contained" : "outlined"}
              onClick={() => handleFilterButtonClick(caliber)}
            >
              {changeCaliberToShortName(caliber)}
            </Button>
          ))}
        </Box>
        {/* filter buttons for ammoType: buckshot / grenade / flashbang */}
        <Box m="2vh 0">
          <Box component="h3">Others (Buckshots, Grenades, Flashbangs):</Box>
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
              sx={{ m: "4px", fontSize: "1.1em" }}
              key={caliber}
              color="inherit"
              variant={caliber === currentCaliber ? "contained" : "outlined"}
              onClick={() => handleFilterButtonClick(caliber)}
            >
              {changeCaliberToShortName(caliber)}
            </Button>
          ))}
        </Box>

        <Divider />

        {/* ammo search bar */}
        <Box sx={{ width: "100%", p: "3vh" }}>
          <AmmoSearchbar setInputText={setInputText} />
        </Box>
        {/* table for data displaying */}
        <Table
          stickyHeader
          sx={{ mt: "2vh", border: "3px solid #9a8866", minWidth: "100%" }}
        >
          <AmmoTableHead
            onRequestSort={handleRequestSort}
            order={order}
            orderBy={orderBy}
          />
          <TableBody>
            {
              //stableSort(ammo, getComparator(order, orderBy))
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
                            user
                              ? handleFavoriteAmmo(user, ammoData.item.id)
                              : alert(
                                  "please LOGIN to use favorite feature!!!",
                                );
                          }}
                        >
                          <FavoriteBorderIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ width: "20%" }}>
                        {ammoData.item.name}
                      </TableCell>
                      <TableCell align="center" sx={{ width: "16%" }}>
                        {ammoData.projectileCount > 1
                          ? ammoData.projectileCount + " x " + ammoData.damage
                          : ammoData.damage}
                      </TableCell>
                      <TableCell align="center" sx={{ width: "16%" }}>
                        {ammoData.penetrationPower}
                      </TableCell>
                      <TableCell align="center" sx={{ width: "16%" }}>
                        {ammoData.armorDamage}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          width: "16%",
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
                      <TableCell
                        align="center"
                        sx={{
                          width: "16%",
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
            }
          </TableBody>
        </Table>
      </TableContainer>
      <Box mb="3vh">
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
    </>
  );
}
