"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCrafts } from "@/hooks/useCrafts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useHideoutStations } from "@/hooks/useHideoutData";
import { useItems } from "@/hooks/useItems";
import { useTasks } from "@/hooks/useTasks";
import { useGameMode } from "@/contexts/GameModeContext";
import FallbackImage from "@/components/hideout/FallbackImage";
import {
  buildRows,
  filterCrafts,
  formatProfit,
  sortCrafts,
} from "@/lib/crafts";
import { ROUBLES_ID, formatDuration, formatPrice } from "@/lib/hideout";
import type {
  CraftFilters,
  CraftItemEntry,
  CraftRow,
  CraftSortKey,
} from "@/types/craft";
import type { HideoutStation } from "@/types/hideout";
import type { Item, SortOrder } from "@/types/item";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface Column {
  id: string;
  label: string;
  sortKey?: CraftSortKey;
  align?: "left" | "right";
}

const columns: Column[] = [
  { id: "product", label: "Product", sortKey: "product" },
  { id: "station", label: "Station", sortKey: "station" },
  { id: "duration", label: "Time", sortKey: "duration" },
  { id: "ingredients", label: "Ingredients" },
  { id: "cost", label: "Cost", sortKey: "cost", align: "right" },
  { id: "value", label: "Value", sortKey: "value", align: "right" },
  { id: "profit", label: "Profit", sortKey: "profit", align: "right" },
  {
    id: "profitPerHour",
    label: "Profit / hour",
    sortKey: "profitPerHour",
    align: "right",
  },
];

// text columns, time and cost start ascending; the money columns start with
// the biggest value
const DESC_FIRST = new Set<CraftSortKey>(["value", "profit", "profitPerHour"]);

/* ------------------------------------------------------------------ */
/* one item pill                                                      */
/* ------------------------------------------------------------------ */

function ItemPill({
  entry,
  item,
  muted = false,
}: {
  entry: CraftItemEntry;
  item?: Item;
  muted?: boolean;
}) {
  const name = item?.name ?? "Unknown item";
  const label =
    entry.itemId === ROUBLES_ID
      ? formatPrice(entry.count)
      : entry.count > 1
      ? `${name} ×${entry.count}`
      : name;

  return (
    <Box
      title={entry.itemId}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 1,
        py: 0.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        opacity: muted ? 0.75 : 1,
      }}
    >
      <FallbackImage
        key={item?.iconLink ?? "none"}
        sources={[item?.iconLink, item?.gridImageLink]}
        alt=""
        size={28}
      />
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* one craft row                                                      */
/* ------------------------------------------------------------------ */

const CraftTableRow = React.memo(function CraftTableRow({
  row,
  itemsById,
  station,
  taskName,
}: {
  row: CraftRow;
  itemsById: ReadonlyMap<string, Item>;
  station?: HideoutStation;
  /** set when a task unlocks this craft */
  taskName?: string;
}) {
  const { craft, econ } = row;
  const product = itemsById.get(craft.productItemId);

  const profitColor =
    econ.profit == null || econ.profit === 0
      ? "text.secondary"
      : econ.profit > 0
      ? "success.main"
      : "error.main";

  return (
    <TableRow hover>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <FallbackImage
            key={product?.iconLink ?? "none"}
            sources={[product?.iconLink, product?.gridImageLink]}
            alt={row.productName}
            size={48}
          />
          <Box>
            <Typography component="span" sx={{ fontWeight: 600 }}>
              {row.productName}
            </Typography>
            {craft.productCount > 1 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                ×{craft.productCount}
              </Typography>
            )}
          </Box>
        </Box>
      </TableCell>

      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FallbackImage
            key={station?.id ?? "none"}
            sources={[
              station &&
                `/icons/hideout-icons/${station.normalizedName}-icon.png`,
              station?.imageLink,
            ]}
            alt=""
            size={32}
          />
          <Typography variant="body2">
            {row.stationName} lvl {craft.stationLevel}
          </Typography>
        </Box>
        {taskName && (
          <Tooltip title="A task must be completed to unlock this craft">
            <Chip
              label={`Task: ${taskName}`}
              size="small"
              color="info"
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          </Tooltip>
        )}
      </TableCell>

      <TableCell sx={{ whiteSpace: "nowrap" }}>
        {formatDuration(craft.duration)}
      </TableCell>

      <TableCell sx={{ minWidth: 280 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {craft.ingredients.map((entry, i) => (
            <ItemPill
              key={`${entry.itemId}-${i}`}
              entry={entry}
              item={itemsById.get(entry.itemId)}
            />
          ))}
        </Box>
        {craft.tools.length > 0 && (
          <>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: "block", lineHeight: 1.8, mt: 0.5 }}
            >
              Tools (not consumed)
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {craft.tools.map((entry, i) => (
                <ItemPill
                  key={`${entry.itemId}-${i}`}
                  entry={entry}
                  item={itemsById.get(entry.itemId)}
                  muted
                />
              ))}
            </Box>
          </>
        )}
      </TableCell>

      <TableCell align="right">
        {econ.cost == null ? (
          <Tooltip
            title={`${econ.missingPrices} ingredient${
              econ.missingPrices === 1 ? "" : "s"
            } without a price`}
          >
            <span>N/A</span>
          </Tooltip>
        ) : (
          formatPrice(econ.cost)
        )}
      </TableCell>

      <TableCell align="right">{formatPrice(econ.value)}</TableCell>

      <TableCell align="right" sx={{ color: profitColor }}>
        {formatProfit(econ.profit)}
      </TableCell>

      <TableCell align="right" sx={{ color: profitColor, fontWeight: 600 }}>
        {formatProfit(econ.profitPerHour)}
      </TableCell>
    </TableRow>
  );
});

/* ------------------------------------------------------------------ */
/* the table                                                          */
/* ------------------------------------------------------------------ */

export default function CraftsTable() {
  const { gameMode } = useGameMode();
  const { crafts, error, shapeError, isLoading: craftsLoading } = useCrafts();
  const { items, error: itemsError, isLoading: itemsLoading } = useItems();
  const { hideoutStations, isLoading: stationsLoading } = useHideoutStations();
  // only for the names of unlocking tasks; never blocks the page
  const { tasks, isLoading: tasksLoading } = useTasks();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  // the hideout page links here as /crafts?station=<stationId>
  const searchParams = useSearchParams();
  const [stationId, setStationId] = useState(
    () => searchParams?.get("station") ?? "",
  );
  const [profitableOnly, setProfitableOnly] = useState(false);
  const [hideTaskLocked, setHideTaskLocked] = useState(false);
  const [sortKey, setSortKey] = useState<CraftSortKey>("profitPerHour");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const isLoading = craftsLoading || itemsLoading || stationsLoading;

  const itemsById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );
  const stationsById = useMemo(
    () => new Map(hideoutStations.map((s) => [s.id, s])),
    [hideoutStations],
  );
  const tasksById = useMemo(
    () => new Map(tasks.map((t) => [t.id, t])),
    [tasks],
  );

  // stations that actually have crafts, in in-game order
  const stationOptions = useMemo(() => {
    const used = new Set(crafts.map((c) => c.stationId));
    return hideoutStations.filter((s) => used.has(s.id));
  }, [crafts, hideoutStations]);

  const rows = useMemo(
    () => buildRows(crafts, itemsById, stationsById),
    [crafts, itemsById, stationsById],
  );
  const sorted = useMemo(
    () => sortCrafts(rows, sortKey, order),
    [rows, sortKey, order],
  );

  const filters = useMemo<CraftFilters>(
    () => ({
      query: debouncedSearch,
      stationId,
      profitableOnly,
      hideTaskLocked,
    }),
    [debouncedSearch, stationId, profitableOnly, hideTaskLocked],
  );
  const filtered = useMemo(
    () => filterCrafts(sorted, filters),
    [sorted, filters],
  );

  // back to the first page whenever the result list changes
  useEffect(() => {
    setPage(0);
  }, [filters, sortKey, order, gameMode, rowsPerPage]);

  // a station that no longer exists (e.g. after switching game mode) would
  // silently show nothing
  useEffect(() => {
    if (
      !isLoading &&
      stationId &&
      !stationOptions.some((s) => s.id === stationId)
    ) {
      setStationId("");
    }
  }, [isLoading, stationId, stationOptions]);

  const visible = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const taskLabel = (taskId: string) =>
    tasksById.get(taskId)?.name ?? (tasksLoading ? "…" : "Unknown task");

  const handleSort = (key: CraftSortKey) => {
    if (key === sortKey) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setOrder(DESC_FIRST.has(key) ? "desc" : "asc");
    }
  };

  if (error) {
    console.error("Error fetching crafts data:", error);
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Failed to load crafts data. Please try again later.
        </Alert>
      </Box>
    );
  }

  if (shapeError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Crafts data was loaded but its format is unexpected. Check the browser
          console for details.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 1500, mx: "auto", mt: 4, px: 2 }}>
      {Boolean(itemsError) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Item names and prices could not be loaded.
        </Alert>
      )}

      {/* controls */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <TextField
          variant="outlined"
          label="Search Crafts"
          placeholder="Product or ingredient, e.g. ledx"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: "1 1 280px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="Station"
          value={stationId}
          onChange={(e) => setStationId(e.target.value)}
          sx={{ flex: "0 1 220px" }}
          InputLabelProps={{ shrink: true }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">All stations</MenuItem>
          {stationOptions.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Chip
          label="Profitable only"
          clickable
          color={profitableOnly ? "primary" : "default"}
          variant={profitableOnly ? "filled" : "outlined"}
          onClick={() => setProfitableOnly((v) => !v)}
        />
        <Chip
          label="Hide task-locked"
          clickable
          color={hideTaskLocked ? "primary" : "default"}
          variant={hideTaskLocked ? "filled" : "outlined"}
          onClick={() => setHideTaskLocked((v) => !v)}
        />
      </Box>

      {isLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40vh"
        >
          <CircularProgress size={40} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box m={3} textAlign="center" component={Paper} py={4}>
          <Typography>No crafts match your filters.</Typography>
        </Box>
      ) : (
        <>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 1 }}
          >
            {filtered.length.toLocaleString("en-US")} crafts
          </Typography>

          <Paper>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table aria-label="Crafts Table" sx={{ minWidth: 1100 }}>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        sortDirection={
                          column.sortKey && sortKey === column.sortKey
                            ? order
                            : false
                        }
                      >
                        {column.sortKey ? (
                          <TableSortLabel
                            active={sortKey === column.sortKey}
                            direction={
                              sortKey === column.sortKey ? order : "asc"
                            }
                            onClick={() => handleSort(column.sortKey!)}
                          >
                            {column.label}
                          </TableSortLabel>
                        ) : (
                          column.label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {visible.map((row) => (
                    <CraftTableRow
                      key={row.craft.id}
                      row={row}
                      itemsById={itemsById}
                      station={stationsById.get(row.craft.stationId)}
                      taskName={
                        row.craft.taskUnlockId
                          ? taskLabel(row.craft.taskUnlockId)
                          : undefined
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              rowsPerPageOptions={[25, 50, 100]}
              count={filtered.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) =>
                setRowsPerPage(parseInt(e.target.value, 10))
              }
            />
          </Paper>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            Cost is the flea price of the consumed ingredients (24h low, falling
            back to the 24h average); tools are not consumed and not counted.
            Value is the flea price of the product, or the best trader buy-back
            price when it can&apos;t be sold on the flea market. Flea market
            fees are not included, so profits are an upper estimate.
          </Typography>
        </>
      )}
    </Box>
  );
}
