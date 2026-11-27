import type { Metadata } from "next";
import HideoutShell from "@/components/hideout/HideoutShell";

export const metadata: Metadata = {
  title: "Hideout",
  description:
    "Upgrade requirements, build times and estimated costs for every Escape from Tarkov hideout station and level.",
};

export default function HideoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HideoutShell>{children}</HideoutShell>;
}
