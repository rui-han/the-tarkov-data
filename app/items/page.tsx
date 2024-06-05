"use client";

import { GET_ALL_ITEMS_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/client";
import { FetchedData, Item } from "@/types/item";
import {
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

export default function Items() {
  const { data } = useSuspenseQuery<FetchedData>(GET_ALL_ITEMS_DATA);

  return (
    <TableContainer component={Paper} sx={{ width: "90%", m: "3vh" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Item Name</TableCell>
            <TableCell>Sell To Flea</TableCell>
          </TableRow>
        </TableHead>
        {data.items.map((item: Item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name} </TableCell>
            <TableCell>
              {
                // check if there is a "Flea Market" entry in sellFor array
                item.sellFor.some(
                  (sellfor) => sellfor.vendor.name === "Flea Market",
                )
                  ? // get the last Flea low price
                    item.sellFor.find(
                      (sellfor) => sellfor.vendor.name === "Flea Market",
                    )?.priceRUB
                  : // or its not listable, eg. "Roubles"
                    "Not Listable"
              }
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </TableContainer>
  );
}
