import { Suspense } from "react";
import ItemsTable from "@/components/items/ItemsTable";

export default function Items() {
  return (
    <Suspense>
      <ItemsTable />
    </Suspense>
  );
}
