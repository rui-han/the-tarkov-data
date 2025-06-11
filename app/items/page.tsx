"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@apollo/client";
import { GET_PAGINATED_ITEMS_DATA } from "@/graphql/queries";
import { Item, PaginatedItemsData } from "@/types/item";
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
  Typography,
} from "@mui/material";

const ITEMS_PER_PAGE = 20;

export default function Items() {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, loading, error, fetchMore } = useQuery<PaginatedItemsData>(
    GET_PAGINATED_ITEMS_DATA,
    {
      variables: {
        limit: ITEMS_PER_PAGE,
        offset: 0,
      },
    },
  );

  const loaderRef = useRef(null); // for the loading indicator
  const loadMoreItems = useCallback(() => {
    if (loading || isLoadingMore) return; // Prevent multiple fetches at the same time

    setIsLoadingMore(true);
    fetchMore({
      variables: {
        // Calculate the new offset based on the number of items already loaded
        offset: data?.items.length || 0,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        // If fetchMore didn't return any new items, we've reached the end
        if (!fetchMoreResult || fetchMoreResult.items.length === 0) {
          return previousResult; // Return the previous data, no changes
        }

        // Merge the new items with the existing ones
        return {
          items: [...previousResult.items, ...fetchMoreResult.items],
        };
      },
    }).finally(() => {
      setIsLoadingMore(false);
    });
  }, [loading, isLoadingMore, data, fetchMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        // Check if the loader is visible and if there are items to potentially load more of
        if (target.isIntersecting && data && data.items.length > 0) {
          // A simple check to see if we might be at the end.
          // If the last fetch returned less than a full page, don't try to fetch more.
          if (data.items.length % ITEMS_PER_PAGE === 0) {
            loadMoreItems();
          }
        }
      },
      { threshold: 0.1 },
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [loadMoreItems, data]);

  const getFleaMarketPrice = (item: Item) => {
    const fleaMarketEntry = item.sellFor.find(
      (s) => s.vendor.name === "Flea Market",
    );
    return fleaMarketEntry
      ? fleaMarketEntry.priceRUB.toLocaleString()
      : "Not Listable";
  };

  // Handle initial loading and error states
  if (loading && !data) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Typography color="error">Error loading data: {error.message}</Typography>
    );
  }

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
          {data?.items.map((item: Item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name} </TableCell>
              <TableCell>{getFleaMarketPrice(item)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* loading indicator at the bottom */}
      <Box
        ref={loaderRef}
        sx={{ display: "flex", justifyContent: "center", p: 2 }}
      >
        {isLoadingMore && <CircularProgress />}
      </Box>
    </TableContainer>
  );
}
