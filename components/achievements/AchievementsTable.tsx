"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useGameMode } from "@/contexts/GameModeContext";
import FallbackImage from "@/components/hideout/FallbackImage";
import {
  filterAchievements,
  formatPercent,
  listRarities,
  listSides,
  sortAchievements,
} from "@/lib/achievements";
import {
  createChipStyle,
  rarityTheme,
  sideTheme,
} from "@/utils/achievement-utils";
import type { SortOrder } from "@/types/item";
import type {
  Achievement,
  AchievementFilters,
  AchievementSortKey,
  VisibilityFilter,
} from "@/types/achievement";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  LinearProgress,
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
  sortKey?: AchievementSortKey;
}

const columns: Column[] = [
  { id: "image", label: "" },
  { id: "name", label: "Achievement", sortKey: "name" },
  { id: "rarity", label: "Rarity", sortKey: "rarity" },
  { id: "side", label: "Side", sortKey: "side" },
  {
    id: "completion",
    label: "Completed by",
    sortKey: "playersCompletedPercent",
  },
];

// Text columns start ascending. The two "how rare" columns start with the
// rarest first: highest rank for rarity, lowest completion for the percentage.
const DESC_FIRST = new Set<AchievementSortKey>(["rarity"]);

const AchievementRow = React.memo(function AchievementRow({
  achievement: a,
}: {
  achievement: Achievement;
}) {
  const percent = a.playersCompletedPercent;

  return (
    <TableRow hover>
      <TableCell sx={{ width: 80, p: 1 }}>
        <FallbackImage
          key={a.imageLink ?? "none"}
          sources={[a.imageLink]}
          alt={a.name}
          size={56}
          radius={8}
        />
      </TableCell>

      <TableCell>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography component="span" sx={{ fontWeight: 600 }}>
            {a.name}
          </Typography>
          {a.hidden && (
            <Tooltip title="Hidden achievement">
              <Chip label="🔒 Hidden" size="small" variant="outlined" />
            </Tooltip>
          )}
        </Box>
        {a.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", maxWidth: 560 }}
          >
            {a.description}
          </Typography>
        )}
      </TableCell>

      <TableCell>
        <Chip
          label={a.rarity}
          size="small"
          sx={createChipStyle(rarityTheme, a.normalizedRarity)}
        />
      </TableCell>

      <TableCell>
        <Chip
          label={a.side}
          size="small"
          variant="outlined"
          sx={createChipStyle(sideTheme, a.normalizedSide)}
        />
      </TableCell>

      <TableCell sx={{ minWidth: 160 }}>
        {percent == null ? (
          "—"
        ) : (
          <Tooltip
            title={
              a.adjustedPlayersCompletedPercent != null
                ? `Adjusted: ${formatPercent(
                    a.adjustedPlayersCompletedPercent,
                  )}`
                : ""
            }
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, percent))}
                sx={{ width: 100, flexShrink: 0 }}
              />
              <Typography variant="body2">{formatPercent(percent)}</Typography>
            </Box>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
});

export default function AchievementsTable() {
  const { gameMode } = useGameMode();
  const { achievements, error, isLoading, shapeError } = useAchievements();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [rarity, setRarity] = useState("");
  const [side, setSide] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [sortKey, setSortKey] = useState<AchievementSortKey>("name");
  const [order, setOrder] = useState<SortOrder>("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const rarityOptions = useMemo(
    () => listRarities(achievements),
    [achievements],
  );
  const sideOptions = useMemo(() => listSides(achievements), [achievements]);

  const sorted = useMemo(
    () => sortAchievements(achievements, sortKey, order),
    [achievements, sortKey, order],
  );

  const filters = useMemo<AchievementFilters>(
    () => ({ query: debouncedSearch, rarity, side, visibility }),
    [debouncedSearch, rarity, side, visibility],
  );
  const filtered = useMemo(
    () => filterAchievements(sorted, filters),
    [sorted, filters],
  );

  // back to the first page whenever the result list changes
  useEffect(() => {
    setPage(0);
  }, [filters, sortKey, order, gameMode, rowsPerPage]);

  // a filter value that no longer exists (e.g. after switching game mode)
  // would silently show nothing
  useEffect(() => {
    if (rarity && !rarityOptions.some((o) => o.value === rarity)) setRarity("");
    if (side && !sideOptions.some((o) => o.value === side)) setSide("");
  }, [rarity, side, rarityOptions, sideOptions]);

  const visible = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleSort = (key: AchievementSortKey) => {
    if (key === sortKey) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setOrder(DESC_FIRST.has(key) ? "desc" : "asc");
    }
  };

  if (error) {
    console.error("Error fetching achievement data:", error);
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Failed to load achievement data. Please try again later.
        </Alert>
      </Box>
    );
  }

  if (shapeError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Achievement data was loaded but its format is unexpected. Check the
          browser console for details.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", mt: 4, px: 2 }}>
      {/* controls */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <TextField
          variant="outlined"
          label="Search Achievements"
          placeholder="Name or description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: "1 1 260px" }}
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
          label="Rarity"
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
          sx={{ flex: "0 1 180px" }}
          InputLabelProps={{ shrink: true }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">All rarities</MenuItem>
          {rarityOptions.map(({ value, label, count }) => (
            <MenuItem key={value} value={value}>
              {label} ({count})
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Side"
          value={side}
          onChange={(e) => setSide(e.target.value)}
          sx={{ flex: "0 1 160px" }}
          InputLabelProps={{ shrink: true }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">All sides</MenuItem>
          {sideOptions.map(({ value, label, count }) => (
            <MenuItem key={value} value={value}>
              {label} ({count})
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as VisibilityFilter)}
          sx={{ flex: "0 1 160px" }}
          InputLabelProps={{ shrink: true }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="visible">Visible only</MenuItem>
          <MenuItem value="hidden">Hidden only</MenuItem>
        </TextField>
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
          <Typography>No achievements match your filters.</Typography>
        </Box>
      ) : (
        <>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 1 }}
          >
            {filtered.length.toLocaleString("en-US")} achievements
          </Typography>

          <Paper>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table aria-label="Achievements Table" sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
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
                  {visible.map((a) => (
                    <AchievementRow key={a.id} achievement={a} />
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
            Completion is the share of players who earned the achievement (hover
            for the adjusted figure).
          </Typography>
        </>
      )}
    </Box>
  );
}
