import type { Metadata } from "next";
import TaskTable from "@/components/tasks/TaskTable";

export const metadata: Metadata = {
  title: "Tasks",
  description:
    "Objectives, requirements and rewards for every Escape from Tarkov task, with trader, map and Kappa filters.",
};

export default function Tasks() {
  return <TaskTable />;
}
