"use client";

import { useMemo, useState } from "react";
import { GET_TASKS_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/client";
// types
import { TasksData } from "@/types/task";
// components
import TaskTable from "@/components/tasks/TaskTable";
// MUI
import { TextField, Box } from "@mui/material";

export default function Tasks() {
  const { data } = useSuspenseQuery<TasksData>(GET_TASKS_DATA);
  const [search, setSearch] = useState("");

  // Filter tasks based on search input
  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return data.tasks;

    return data.tasks.filter((task) =>
      task.name.toLowerCase().includes(keyword),
    );
  }, [data.tasks, search]);

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
