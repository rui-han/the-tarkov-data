import { GridColDef } from "@mui/x-data-grid";
import { Box, Chip, Avatar, Tooltip, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import { Task } from "@/types/task";

export const TaskTableColumns: GridColDef<Task>[] = [
  // 1. image icon
  {
    field: "taskImageLink",
    headerName: "",
    width: 300,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Avatar
        src={params.value}
        alt={params.row.name}
        variant="rounded"
        imgProps={{
          loading: "lazy",
          decoding: "async", // improves performance by decoding the image asynchronously
        }}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          p: 3,
        }}
      />
    ),
  },

  // 2. task name
  {
    field: "name",
    headerName: "Task Name",
    width: 260,
    renderCell: (params) => (
      <Box
        component="a"
        href={params.row.wikiLink}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          fontWeight: 600,
          cursor: "pointer",
          textDecoration: "none",
          color: "inherit",
          transition: "all 0.2s ease-in-out",
          "&:hover": { textDecoration: "underline", opacity: 0.7 },
        }}
      >
        {params.value}
      </Box>
    ),
  },

  // 3. trader
  {
    field: "trader",
    headerName: "Trader",
    width: 140,
    align: "center",
    headerAlign: "center",
    valueGetter: (params) => params.row.trader.name,
    renderCell: (params) => (
      <Chip
        label={params.row.trader.name}
        size="small"
        color="primary"
        variant="outlined"
      />
    ),
  },

  // 4. map
  {
    field: "map",
    headerName: "Map",
    width: 140,
    align: "center",
    headerAlign: "center",
    valueGetter: (params) => params.row.map?.name ?? "Any",
    renderCell: (params) => (
      <Chip label={params.row.map?.name ?? "Any"} size="small" />
    ),
  },

  // 5. min level requirement
  {
    field: "minPlayerLevel",
    headerName: "LVL",
    type: "number",
    width: 70,
    align: "center",
    headerAlign: "center",
  },

  // 6. XP reward
  {
    field: "experience",
    headerName: "XP",
    type: "number",
    width: 100,
    align: "center",
    headerAlign: "center",
    valueFormatter: (params) => params.value?.toLocaleString() ?? "0",
  },

  // 7. prerequisites
  {
    field: "taskRequirements",
    headerName: "Prerequisites",
    width: 160,
    align: "center",
    headerAlign: "center",
    sortable: false,
    renderCell: (params) => {
      const reqs = params.row.taskRequirements;

      if (!reqs || reqs.length === 0) {
        return (
          <Typography variant="caption" color="text.secondary">
            None
          </Typography>
        );
      }

      const reqNames = reqs.map((r) => r.task.name).join(", ");

      return (
        <Tooltip title={reqNames} arrow>
          <Box
            sx={{
              textDecoration: "underline",
              cursor: "help",
              fontSize: "0.875rem",
            }}
          >
            {reqs.length} Task
            {reqs.length > 1 ? "s" : ""}
          </Box>
        </Tooltip>
      );
    },
  },

  // 8. is kappa required
  {
    field: "kappaRequired",
    headerName: "Kappa",
    width: 100,
    type: "boolean",
    align: "center",
    headerAlign: "center",
    sortable: false,
    renderCell: (params) =>
      params.value ? (
        <CheckCircleIcon color="success" fontSize="small" />
      ) : (
        <CancelIcon color="disabled" fontSize="small" />
      ),
  },
];
