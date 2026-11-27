import type { Metadata } from "next";
import { Suspense } from "react";
import ItemsTable from "@/components/items/ItemsTable";

export const metadata: Metadata = {
  title: "Items",
  description:
    "Flea market prices, 48-hour price changes, weights and trader sell prices for every Escape from Tarkov item.",
};

export default function Items() {
  return (
    <Suspense>
      <ItemsTable />
    </Suspense>
  );
}
