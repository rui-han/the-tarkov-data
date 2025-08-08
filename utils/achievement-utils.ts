import { AchievementTableHeadCell } from "@/types/achievement";

// createChipStyle generates a style object for a chip component based on the provided theme and key.
export const createChipStyle = (
  theme: Record<string, { bg: string; color: string }>,
  key: string,
) => {
  const base = { border: "1px solid #555" };
  const style = theme[key.toLowerCase()] || { bg: "#333", color: "#bbb" };
  return { ...base, backgroundColor: style.bg, color: style.color };
};
// Themes for rarity and side chips
export const rarityTheme = {
  common: { bg: "#2e2e2e", color: "#b0b0b0" },
  rare: { bg: "#3e2e4f", color: "#d8d0c0" },
  legendary: { bg: "#6b5522", color: "#eee8d5" },
};
export const sideTheme = {
  all: { bg: "#3a3a3a", color: "#cccccc" },
  pmc: { bg: "#2f3a4a", color: "#d2d2d2" },
  scavs: { bg: "#5a4220", color: "#e2dacb" },
};

// Table head cell definitions
export const headCells: readonly AchievementTableHeadCell[] = [
  { id: "imageLink", label: "", isSortable: false },
  { id: "name", label: "Name", isSortable: true },
  { id: "description", label: "Description", isSortable: false },
  { id: "hidden", label: "Hidden", isSortable: true },
  { id: "playersCompletedPercent", label: "Completion", isSortable: true },
  { id: "rarity", label: "Rarity", isSortable: true },
  { id: "side", label: "Side", isSortable: true },
];
