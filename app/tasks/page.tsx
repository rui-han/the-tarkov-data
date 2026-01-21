"use client";

import { GET_TASKS_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/client";
// types
import { TasksData } from "@/types/task";
// components
import TaskTable from "@/components/tasks/TaskTable";

export default function Tasks() {
  const { data } = useSuspenseQuery<TasksData>(GET_TASKS_DATA);

  return (
    <>
      <TaskTable data={data.tasks} />
    </>
  );
}
