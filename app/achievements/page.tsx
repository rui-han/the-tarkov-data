import type { Metadata } from "next";
import AchievementsTable from "@/components/achievements/AchievementsTable";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "Every Escape from Tarkov achievement with its rarity and the share of players who earned it.",
};

export default function Achievements() {
  return <AchievementsTable />;
}
