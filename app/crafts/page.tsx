import { Suspense } from "react";
import CraftsTable from "@/components/crafts/CraftsTable";

export default function Crafts() {
  return (
    <Suspense>
      <CraftsTable />
    </Suspense>
  );
}
