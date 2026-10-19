"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMapMap, useTasks } from "@/hooks/useTasks";
import { useTraderMap } from "@/hooks/useHideoutData";
import FallbackImage from "@/components/hideout/FallbackImage";
import TaskDetails from "./TaskDetails";
import { ANY_MAP, filterTasks, sortTasks } from "@/lib/tasks";
import type { GameMode } from "@/lib/tarkovApi";
import type { SortOrder } from "@/types/item";
import type { Trader } from "@/types/hideout";
import type {
  GameMap,
  Task,
  TaskFilters,
  TaskLabels,
  TaskSortKey,
} from "@/types/task";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  Link as MuiLink,
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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

interface Column {
  id: string;
  label: string;
  sortKey?: TaskSortKey;
  align?: "left" | "center" | "right";
}

const columns: Column[] = [
  { id: "expand", label: "" },
  { id: "image", label: "" },
  { id: "name", label: "Task", sortKey: "name" },
  { id: "trader", label: "Trader", sortKey: "trader" },
  { id: "map", label: "Map", sortKey: "map" },
  { id: "level", label: "LVL", sortKey: "minPlayerLevel", align: "center" },
  { id: "xp", label: "XP", sortKey: "experience", align: "right" },
  { id: "prerequisites", label: "Prerequisites", align: "center" },
  { id: "required", label: "Required for" },
];

// most columns start ascending; experience starts with the biggest value
const DESC_FIRST = new Set<TaskSortKey>(["experience"]);

/* ------------------------------------------------------------------ */
/* one task row (+ expandable details)                                */
/* ------------------------------------------------------------------ */

const TaskRow = React.memo(function TaskRow({
  task,
  trader,
  mapLabel,
  tasksById,
  tradersById,
  mapsById,
}: {
  task: Task;
  trader?: Trader;
  mapLabel: string;
  tasksById: ReadonlyMap<string, Task>;
  tradersById: ReadonlyMap<string, Trader>;
  mapsById: ReadonlyMap<string, GameMap>;
}) {
  const [open, setOpen] = useState(false);

  const prerequisiteNames = task.taskRequirements.map(
    (r) => tasksById.get(r.taskId)?.name ?? "Unknown task",
  );

  return (
    <>
      <TableRow
        hover
        sx={{ "& > td": { borderBottom: open ? "none" : undefined } }}
      >
        <TableCell sx={{ width: 48, p: 0.5 }}>
          <IconButton
            size="small"
            aria-label={open ? "Hide task details" : "Show task details"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell sx={{ width: 80, p: 1 }}>
          <FallbackImage
            key={task.taskImageLink ?? "none"}
            sources={[task.taskImageLink]}
            alt={task.name}
            size={64}
          />
        </TableCell>

        <TableCell>
          {task.wikiLink ? (
            <MuiLink
              href={task.wikiLink}
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              underline="hover"
              sx={{ fontWeight: 600 }}
            >
              {task.name}
            </MuiLink>
          ) : (
            <Typography component="span" sx={{ fontWeight: 600 }}>
              {task.name}
            </Typography>
          )}
          {task.factionName !== "Any" && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              {task.factionName} only
            </Typography>
          )}
        </TableCell>

        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FallbackImage
              key={trader?.id ?? "none"}
              sources={[
                trader &&
                  `/icons/trader-icons/${trader.normalizedName}-icon.jpg`,
                trader?.imageLink,
              ]}
              alt=""
              size={32}
            />
            <Typography variant="body2">{trader?.name ?? "—"}</Typography>
          </Box>
        </TableCell>

        <TableCell>
          <Chip
            label={mapLabel}
            size="small"
            variant={task.mapId ? "filled" : "outlined"}
          />
        </TableCell>

        <TableCell align="center">{task.minPlayerLevel}</TableCell>

        <TableCell align="right">
          {task.experience.toLocaleString("en-US")}
        </TableCell>

        <TableCell align="center">
          {prerequisiteNames.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              None
            </Typography>
          ) : (
            <Tooltip title={prerequisiteNames.join(", ")} arrow>
              <Box
                component="span"
                sx={{
                  textDecoration: "underline",
                  cursor: "help",
                  fontSize: "0.875rem",
                }}
              >
                {prerequisiteNames.length} Task
                {prerequisiteNames.length > 1 ? "s" : ""}
              </Box>
            </Tooltip>
          )}
        </TableCell>

        <TableCell>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {task.kappaRequired && (
              <Chip
                label="Kappa"
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
            {task.lightkeeperRequired && (
              <Chip
                label="Lightkeeper"
                size="small"
                color="info"
                variant="outlined"
              />
            )}
            {!task.kappaRequired && !task.lightkeeperRequired && (
              <Typography variant="caption" color="text.secondary">
                —
              </Typography>
            )}
          </Box>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell
          colSpan={columns.length}
          sx={{ p: 0, border: open ? undefined : "none" }}
        >
          {/* unmounted while closed, so item names are only fetched on demand */}
          <Collapse in={open} timeout="auto" unmountOnExit>
            <TaskDetails
              task={task}
              tasksById={tasksById}
              tradersById={tradersById}
              mapsById={mapsById}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
});

/* ------------------------------------------------------------------ */
/* the table                                                          */
/* ------------------------------------------------------------------ */

export default function TaskTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [traderId, setTraderId] = useState("");
  const [mapId, setMapId] = useState("");
  const [kappaOnly, setKappaOnly] = useState(false);
  const [lightkeeperOnly, setLightkeeperOnly] = useState(false);
  const [sortKey, setSortKey] = useState<TaskSortKey>("minPlayerLevel");
  const [order, setOrder] = useState<SortOrder>("asc");
  const [gameMode, setGameMode] = useState<GameMode>("regular");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const { tasks, error, isLoading, shapeError } = useTasks(gameMode);
  // names only; these never block the page
  const { tradersById } = useTraderMap();
  const { mapsById } = useMapMap();

  const labels = useMemo<TaskLabels>(
    () => ({
      traderName: (id) => tradersById.get(id)?.name ?? "Unknown trader",
      mapName: (id) =>
        id === null ? "Any map" : mapsById.get(id)?.name ?? "Unknown map",
    }),
    [tradersById, mapsById],
  );

  const tasksById = useMemo(
    () => new Map(tasks.map((t) => [t.id, t])),
    [tasks],
  );

  const traderOptions = useMemo(() => {
    const ids = new Set(tasks.map((t) => t.traderId).filter(Boolean));
    return [...ids]
      .map((id) => ({ id, label: labels.traderName(id) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [tasks, labels]);

  const mapOptions = useMemo(() => {
    const ids = new Set<string>();
    let hasAny = false;
    for (const t of tasks) {
      if (t.mapId) ids.add(t.mapId);
      else hasAny = true;
    }
    const list = [...ids]
      .map((id) => ({ id, label: labels.mapName(id) }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return { list, hasAny };
  }, [tasks, labels]);

  const sortedTasks = useMemo(
    () => sortTasks(tasks, sortKey, order, labels),
    [tasks, sortKey, order, labels],
  );

  const filters = useMemo<TaskFilters>(
    () => ({
      query: debouncedSearch,
      traderId,
      mapId,
      kappaOnly,
      lightkeeperOnly,
    }),
    [debouncedSearch, traderId, mapId, kappaOnly, lightkeeperOnly],
  );
  const filteredTasks = useMemo(
    () => filterTasks(sortedTasks, filters),
    [sortedTasks, filters],
  );

  // back to the first page whenever the result list changes
  useEffect(() => {
    setPage(0);
  }, [filters, sortKey, order, gameMode, rowsPerPage]);

  const visibleTasks = filteredTasks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleSort = (key: TaskSortKey) => {
    if (key === sortKey) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setOrder(DESC_FIRST.has(key) ? "desc" : "asc");
    }
  };

  if (error) {
    console.error("Error fetching tasks data:", error);
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Failed to load tasks data. Please try again later.
        </Alert>
      </Box>
    );
  }

  if (shapeError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Tasks data was loaded but its format is unexpected. Check the browser
          console for details.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 1400, mx: "auto", mt: 4, px: 2 }}>
      {/* controls */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <TextField
          variant="outlined"
          label="Search Tasks"
          placeholder="Task name"
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
          label="Trader"
          value={traderId}
          onChange={(e) => setTraderId(e.target.value)}
          sx={{ flex: "0 1 200px" }}
          InputLabelProps={{ shrink: true }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">All traders</MenuItem>
          {traderOptions.map(({ id, label }) => (
            <MenuItem key={id} value={id}>
              {label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Map"
          value={mapId}
          onChange={(e) => setMapId(e.target.value)}
          sx={{ flex: "0 1 200px" }}
          InputLabelProps={{ shrink: true }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">All maps</MenuItem>
          {mapOptions.hasAny && <MenuItem value={ANY_MAP}>Any map</MenuItem>}
          {mapOptions.list.map(({ id, label }) => (
            <MenuItem key={id} value={id}>
              {label}
            </MenuItem>
          ))}
        </TextField>

        <ToggleButtonGroup
          exclusive
          color="primary"
          value={gameMode}
          onChange={(_, value: GameMode | null) => {
            if (value) setGameMode(value);
          }}
          aria-label="Game mode"
        >
          <ToggleButton value="regular">PvP</ToggleButton>
          <ToggleButton value="pve">PvE</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Chip
          label="Kappa required"
          clickable
          color={kappaOnly ? "primary" : "default"}
          variant={kappaOnly ? "filled" : "outlined"}
          onClick={() => setKappaOnly((v) => !v)}
        />
        <Chip
          label="Lightkeeper required"
          clickable
          color={lightkeeperOnly ? "primary" : "default"}
          variant={lightkeeperOnly ? "filled" : "outlined"}
          onClick={() => setLightkeeperOnly((v) => !v)}
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
      ) : filteredTasks.length === 0 ? (
        <Box m={3} textAlign="center" component={Paper} py={4}>
          <Typography>No tasks match your filters.</Typography>
        </Box>
      ) : (
        <Paper>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table aria-label="Tasks Table" sx={{ minWidth: 900 }}>
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
                          direction={sortKey === column.sortKey ? order : "asc"}
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
                {visibleTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    trader={tradersById.get(task.traderId)}
                    mapLabel={labels.mapName(task.mapId)}
                    tasksById={tasksById}
                    tradersById={tradersById}
                    mapsById={mapsById}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            rowsPerPageOptions={[25, 50, 100]}
            count={filteredTasks.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) =>
              setRowsPerPage(parseInt(e.target.value, 10))
            }
          />
        </Paper>
      )}
    </Box>
  );
}
