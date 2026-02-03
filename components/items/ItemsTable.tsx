"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
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
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

/**
 * Default page size
 */
const DEFAULT_ITEMS_PER_PAGE = 20;

/**
 * Table column definitions
 */
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
  /**
   * Search input state (real-time)
   */
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Debounced search value sent to API
   */
  const debouncedSearch = useDebouncedValue(searchTerm, 500);

  /**
   * Infinite scroll states
   */
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  /**
   * A stable key derived from search value.
   * When search changes, the whole query lifecycle resets,
   * preventing old pagination data from leaking into new results.
   */
  const queryKey = debouncedSearch.trim() || "__all__";

  /**
   * GraphQL query
   */
  const { data, loading, error, fetchMore } = useQuery<PaginatedItemsData>(
    GET_PAGINATED_ITEMS_DATA,
    {
      variables: {
        limit: itemsPerPage,
        offset: 0,
        search:
          debouncedSearch.trim() === "" ? undefined : debouncedSearch.trim(),
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  /**
   * Reset pagination state when search condition changes
   */
  useEffect(() => {
    setHasMore(true);
    setIsLoadingMore(false);
  }, [debouncedSearch]);

  /**
   * Extract items safely
   */
  const items = useMemo(() => data?.items ?? [], [data?.items]);

  /**
   * Load next page
   */
  const loadMoreItems = useCallback(() => {
    if (loading || isLoadingMore || !hasMore || !data) return;

    // If current item count is not a multiple of page size,
    // we already reached the end.
    if (data.items.length % itemsPerPage !== 0) {
      setHasMore(false);
      return;
    }

    setIsLoadingMore(true);

    fetchMore({
      variables: {
        offset: data.items.length,
        search:
          debouncedSearch.trim() === "" ? undefined : debouncedSearch.trim(),
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return {
          ...prev,
          items: [...prev.items, ...fetchMoreResult.items],
        };
      },
    })
      .then((res) => {
        if (!res.data || res.data.items.length === 0) {
          setHasMore(false);
        }
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  }, [
    loading,
    isLoadingMore,
    hasMore,
    data,
    fetchMore,
    itemsPerPage,
    debouncedSearch,
  ]);

  /**
   * IntersectionObserver for infinite scrolling
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          loadMoreItems();
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    const el = loaderRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [loadMoreItems, hasMore, isLoadingMore]);

  /**
   * Error state
   */
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
      key={queryKey}
      sx={{ width: "100%", maxWidth: 1200, margin: "auto", mt: 4 }}
    >
      {/* Search input */}
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

      {/* Initial loading */}
      {loading && !data ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40vh"
        >
          <CircularProgress size={40} />
        </Box>
      ) : items.length === 0 ? (
        // Empty state
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

          {/* Infinite scroll loader */}
          <Box ref={loaderRef} display="flex" justifyContent="center" p={2}>
            {isLoadingMore && hasMore && <CircularProgress size={24} />}
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
