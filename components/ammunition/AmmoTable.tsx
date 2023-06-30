"use client";

import { AmmoTableProps } from "@/types/ammo";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const columns = [
  "Name",
  "Damage",
  "Penatration",
  "Armor Damage",
  "Accuracy",
  "Recoil",
];

export default function AmmoTable({
  ammo,
  calibers,
  filteredCalibers,
  currentCaliber,
  setCurrentCaliber,
}: AmmoTableProps) {
  // to match states
  const changeCaliberToFullName = (caliber: string) => {
    return calibers.find((cal) => cal.replace("Caliber", "") === caliber);
  };

  const handleFilterButtonClick = (caliber: string) => {
    const caliberFullName = changeCaliberToFullName(caliber);
    if (caliberFullName) {
      setCurrentCaliber(caliberFullName);
    }
  };

  return (
    <TableContainer
      sx={{
        width: "90%",
        m: "3vh",
      }}
    >
      {filteredCalibers.map((caliber) => (
        <Button
          sx={{ m: "4px", fontSize: "1.1em" }}
          key={caliber}
          color="inherit"
          variant={
            changeCaliberToFullName(caliber) === currentCaliber
              ? "contained"
              : "outlined"
          }
          onClick={() => handleFilterButtonClick(caliber)}
        >
          {caliber}
        </Button>
      ))}
      <Table stickyHeader sx={{ mt: "2vh", border: "3px solid #9a8866" }}>
        <TableHead>
          <TableRow>
            {columns.map((col) => {
              return (
                <TableCell
                  key={col}
                  align={col === "Name" ? "left" : "center"}
                  sx={{
                    fontSize: "1.1em",
                    fontWeight: "bold",
                    backgroundColor: "#1a120b",
                  }}
                >
                  {col}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {ammo
            ?.filter((ammoData) => ammoData.caliber === currentCaliber)
            .map((ammoData) => {
              return (
                <TableRow key={ammoData.item.id}>
                  <TableCell>{ammoData.item.name}</TableCell>
                  <TableCell align="center">{ammoData.damage}</TableCell>
                  <TableCell align="center">
                    {ammoData.penetrationPower}
                  </TableCell>
                  <TableCell align="center">{ammoData.armorDamage}</TableCell>
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
        </TableBody>
      </Table>
    </TableContainer>
  );
}
