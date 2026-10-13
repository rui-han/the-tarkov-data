"use client";

import { useMemo, useState } from "react";
import { useTarkovData } from "@/hooks/useTarkovData";

// types
import { TasksData } from "@/types/task";
// components
import TaskTable from "@/components/tasks/TaskTable";
// MUI
import { TextField, Box, Alert, CircularProgress } from "@mui/material";

export default function Tasks() {
  const { data, error, isLoading } = useTarkovData<TasksData>("tasks");
  const [search, setSearch] = useState("");

  // Filter tasks based on search input.
  // Hooks must run unconditionally, so this stays above the `error` early
  // return below — `data` may be undefined if the query failed, hence the
  // guard.
  const filteredTasks = useMemo(() => {
    if (!data) return [];

    const keyword = search.trim().toLowerCase();
    if (!keyword) return data.tasks;

    return data.tasks.filter((task) =>
      task.name.toLowerCase().includes(keyword),
    );
  }, [data, search]);

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

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ mt: 6 }}
    >
      {/* Search input */}
      <TextField
        label="Search Task"
        placeholder="Search by task name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        fullWidth
        sx={{ mb: 2, maxWidth: 1200 }}
      />

      <TaskTable data={filteredTasks} />
    </Box>
  );
}
