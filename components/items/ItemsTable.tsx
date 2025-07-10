"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
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

// Default number of items per page
const DEFAULT_ITEMS_PER_PAGE = 20;

// header columns definition
const columns = [
  { id: "image", label: "Image" },
  { id: "name", label: "Name" },
  { id: "category", label: "Category" },
  { id: "weight", label: "Weight (kg)" },
  { id: "lastLowPrice", label: "Last Low Price" },
];

// Type definition for component props
type ItemsTableProps = {
  itemsPerPage?: number;
};

export default function ItemsTable({
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
}: ItemsTableProps) {
  const [hasMore, setHasMore] = useState(true); // update based on the results of the fetchMore call
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const { data, loading, error, fetchMore } = useQuery<PaginatedItemsData>(
    GET_PAGINATED_ITEMS_DATA,
    {
      variables: { limit: itemsPerPage, offset: 0 },
      notifyOnNetworkStatusChange: true, // so loading updates on fetchMore
    },
  );

  // Memoize items array to avoid unnecessary re-renders
  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const loadMoreItems = useCallback(() => {
    if (loading || isLoadingMore || !hasMore) return;
    if (!data) return;

    const offset = data.items.length;
    // If no more full pages, stop
    if (data.items.length > 0 && data.items.length % itemsPerPage !== 0) {
      return;
    }

    setIsLoadingMore(true);
    fetchMore({
      variables: { offset },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || fetchMoreResult.items.length === 0) {
          setHasMore(false);
          return prev;
        }
        return {
          ...prev,
          items: [...prev.items, ...fetchMoreResult.items],
        };
      },
    }).finally(() => {
      setIsLoadingMore(false);
    });
  }, [loading, isLoadingMore, data, fetchMore, itemsPerPage, hasMore]);

  // IntersectionObserver to auto-load more
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          loadMoreItems();
        }
      },
      { rootMargin: "100px", threshold: 0.1 },
    );

    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [loadMoreItems]);

  // Render initial loading state
  if (loading && !data) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }
  // Error state
  if (error) {
    return (
      <Box m={3}>
        <Typography color="error">
          Error loading items: {error.message}
        </Typography>
      </Box>
    );
  }
  // Empty state
  if (items.length === 0) {
    return (
      <Box m={3} textAlign="center">
        <Typography>No items available.</Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{ width: "100%", maxWidth: 1200, margin: "auto", mt: 4 }}
    >
      <Table aria-label="Items Table">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id}>{column.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item: Item) => (
            <TableRow key={item.id} hover>
              <TableCell sx={{ width: 80, p: 1 }}>
                <Box
                  component="img"
                  src={item.gridImageLink}
                  alt={item.name}
                  loading="lazy"
                  sx={{
                    maxWidth: 128,
                    maxHeight: 128,
                    objectFit: "cover",
                    borderRadius: 1,
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/fallback.png";
                  }}
                />
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.category.name}</TableCell>
              <TableCell>{item.weight.toFixed(2)}</TableCell>
              <TableCell>{item.lastLowPrice}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box ref={loaderRef} display="flex" justifyContent="center" p={2}>
        {isLoadingMore && hasMore && <CircularProgress size={24} />}
      </Box>
    </TableContainer>
  );
}
