"use client";

import { useState } from "react";
import { FetchedData } from "@/types/ammo";
import {
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

export default function AmmoTable({ ammo }: FetchedData) {
  // Caliber556x45NATO etc.
  const calibers = [...new Set(ammo.map((ammo) => ammo.caliber))];
  // remove "Caliber", now it is 556x45NATO etc.
  const filteredCalibers = calibers.map((caliber) =>
    caliber.replace("Caliber", ""),
  );

  const [currentCaliber, setCurrentCaliber] = useState(calibers[0]);

  const handleClick = (caliber: string) => {
    const caliberFullName = calibers.find(
      (cal) => cal.replace("Caliber", "") === caliber,
    );
    if (caliberFullName) {
      setCurrentCaliber(caliberFullName);
    }
  };

  return (
    <TableContainer sx={{ width: "90%", maxHeight: "80vh" }}>
      {filteredCalibers.map((caliber) => (
        <button key={caliber} onClick={() => handleClick(caliber)}>
          {caliber}
        </button>
      ))}
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((col) => {
              return <TableCell key={col}>{col}</TableCell>;
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {ammo
            ?.filter((ammoData) => ammoData.caliber === currentCaliber) // TODO, need better filter methods
            .map((ammoData) => {
              return (
                <TableRow key={ammoData.item.id}>
                  <TableCell>{ammoData.item.name}</TableCell>
                  <TableCell>{ammoData.damage}</TableCell>
                  <TableCell>{ammoData.penetrationPower}</TableCell>
                  <TableCell>{ammoData.armorDamage}</TableCell>
                  <TableCell>{ammoData.accuracyModifier}</TableCell>
                  <TableCell>{ammoData.recoilModifier}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
