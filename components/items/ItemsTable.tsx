"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTarkovData } from "@/hooks/useTarkovData";
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
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const DEFAULT_ITEMS_PER_PAGE = 20;

const columns = [
  { id: "image", label: "Image" },
  { id: "name", label: "Name" },
  { id: "category", label: "Category" },
  { id: "weight", label: "Weight (kg)" },
  { id: "lastLowPrice", label: "Last Low Price" },
];

type ItemsTableProps = {
  itemsPerPage?: number;
};

export default function ItemsTable({
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
}: ItemsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 500);

  // json.tarkov.dev no longer supports server-side search/pagination — it ships
  // the full items array as a static file, so we fetch it once and do
  // filtering + "infinite scroll" slicing entirely on the client.
  const { data, error, isLoading } = useTarkovData<PaginatedItemsData>("items");
  const allItems = useMemo(() => data?.items ?? [], [data?.items]);

  const filteredItems = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return allItems;
    return allItems.filter((item) => item.name.toLowerCase().includes(query));
  }, [allItems, debouncedSearch]);

  const [visibleCount, setVisibleCount] = useState(itemsPerPage);

  // Reset the visible count whenever the search term changes
  useEffect(() => {
    setVisibleCount(itemsPerPage);
  }, [debouncedSearch, itemsPerPage]);

  const items = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const loadMoreItems = useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + itemsPerPage, filteredItems.length),
    );
  }, [filteredItems.length, itemsPerPage]);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll trigger, unchanged from the old implementation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore) {
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
  }, [loadMoreItems, hasMore]);

  if (error) {
    return (
      <Box m={3}>
        <Typography color="error">
          Error loading items: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      key={debouncedSearch.trim() || "__all__"}
      sx={{ width: "100%", maxWidth: 1200, margin: "auto", mt: 4 }}
    >
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search Items"
          placeholder="Type name to search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {isLoading && !data ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40vh"
        >
          <CircularProgress size={40} />
        </Box>
      ) : items.length === 0 ? (
        <Box m={3} textAlign="center" component={Paper} py={4}>
          <Typography>
            {debouncedSearch
              ? `No items found for "${debouncedSearch}"`
              : "No items available."}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
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
                        width: 64,
                        height: 64,
                        objectFit: "cover",
                        borderRadius: 1,
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/fallback.png";
                      }}
                    />
                  </TableCell>

                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category?.name || "-"}</TableCell>
                  <TableCell>
                    {item.weight != null ? item.weight.toFixed(2) : "0.00"}
                  </TableCell>
                  <TableCell>{item.lastLowPrice}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box ref={loaderRef} display="flex" justifyContent="center" p={2}>
            {hasMore && <CircularProgress size={24} />}
            {!hasMore && items.length > 0 && (
              <Typography variant="caption" color="textSecondary">
                End of results
              </Typography>
            )}
          </Box>
        </TableContainer>
      )}
    </Box>
  );
}
