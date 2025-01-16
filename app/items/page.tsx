"use client";

import { useEffect, useRef, useState } from "react";

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
  TableBody,
  CircularProgress,
  Box,
} from "@mui/material";

const ITEMS_PER_PAGE = 20;

export default function Items() {
  const { data } = useSuspenseQuery<FetchedData>(GET_ALL_ITEMS_DATA);
  const [displayedItems, setDisplayedItems] = useState<Item[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null); // for the loading indicator

  // initialize and update items to display
  useEffect(() => {
    if (data?.items) {
      setDisplayedItems(data.items.slice(0, ITEMS_PER_PAGE));
    }
  }, [data]);

  // check if scrolling to the bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]; // get the first observed entry
        // check if the observed element is visible and conditions are met
        if (target.isIntersecting && !loading && data?.items) {
          loadMoreItems();
        }
      },
      {
        threshold: 0.1, // callback is triggered when 10% of the element is visible
      },
    );
    // start observing
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        // stop observing
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loading, data, currentPage]);

  const loadMoreItems = () => {
    setLoading(true);

    // calculate the next set of items to display
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newItems = data.items.slice(0, endIndex);

    // check if reached the end of the list
    if (startIndex >= data.items.length) {
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setDisplayedItems(newItems);
      setCurrentPage((prev) => prev + 1);
      setLoading(false);
    }, 500); // adding a small delay to prevent rapid loading
  };

  const getFleaMarketPrice = (item: Item) => {
    // check if there is a "Flea Market" entry in sellFor array
    const fleaMarketEntry = item.sellFor.find(
      (sellfor) => sellfor.vendor.name === "Flea Market",
    );
    // get the last Flea low price
    return fleaMarketEntry ? fleaMarketEntry.priceRUB : "Not Listable";
  };

  return (
    <TableContainer component={Paper} sx={{ width: "90%", m: "3vh" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Item Name</TableCell>
            <TableCell>Sell To Flea</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedItems.map((item: Item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name} </TableCell>
              <TableCell>{getFleaMarketPrice(item)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* loading indicator */}
      <Box
        ref={loaderRef}
        sx={{
          display: "flex",
          justifyContent: "center",
          p: 2,
        }}
      >
        {loading && <CircularProgress />}
      </Box>
    </TableContainer>
  );
}
