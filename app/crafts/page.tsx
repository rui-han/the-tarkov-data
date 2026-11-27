import type { Metadata } from "next";
import { Suspense } from "react";
import CraftsTable from "@/components/crafts/CraftsTable";

export const metadata: Metadata = {
  title: "Crafts",
  description:
    "Every Escape from Tarkov hideout craft with its ingredients, tools and an estimate of the profit per hour.",
};

export default function Crafts() {
  return (
    <Suspense>
      <CraftsTable />
    </Suspense>
  );
}
