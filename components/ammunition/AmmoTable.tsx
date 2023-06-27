"use client";

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
  return (
    <TableContainer sx={{ width: "90%" }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => {
              return <TableCell key={col}>{col}</TableCell>;
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {ammo?.map((ammoData) => {
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
