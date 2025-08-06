"use client";

import { useState, useMemo } from "react";
import { useSuspenseQuery } from "@apollo/client";
import { GET_ACHIEVEMENT_DATA } from "@/graphql/queries";
// types
import {
  AchievementData,
  Achievement,
  AchievementTableHeadCell,
} from "@/types/achievement";
// MUI
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Avatar,
  LinearProgress,
  Tooltip,
  Chip,
} from "@mui/material";

const getRarityChipStyle = (rarity: string) => {
  const base = {
    border: "1px solid #555",
  };

  switch (rarity.toLowerCase()) {
    case "common":
      return {
        ...base,
        backgroundColor: "#2e2e2e",
        color: "#b0b0b0",
      };
    case "rare":
      return {
        ...base,
        backgroundColor: "#3e2e4f",
        color: "#d8d0c0",
      };
    case "legendary":
      return {
        ...base,
        backgroundColor: "#6b5522",
        color: "#eee8d5",
      };
    default:
      return {
        ...base,
        backgroundColor: "#2b2b2b",
        color: "#a0a0a0",
      };
  }
};

const getSideChipStyle = (side: string) => {
  const base = {
    border: "1px solid #555",
  };

  switch (side.toLowerCase()) {
    case "all":
      return {
        ...base,
        backgroundColor: "#3a3a3a",
        color: "#cccccc",
      };
    case "pmc":
      return {
        ...base,
        backgroundColor: "#2f3a4a",
        color: "#d2d2d2",
      };
    case "scavs":
      return {
        ...base,
        backgroundColor: "#5a4220",
        color: "#e2dacb",
      };
    default:
      return {
        ...base,
        backgroundColor: "#333",
        color: "#bbb",
      };
  }
};

const headCells: readonly AchievementTableHeadCell[] = [
  { id: "imageLink", label: "", isSortable: false },
  { id: "name", label: "Name", isSortable: true },
  { id: "description", label: "Description", isSortable: false },
  { id: "hidden", label: "Hidden", isSortable: true },
  { id: "playersCompletedPercent", label: "Completion", isSortable: true },
  { id: "rarity", label: "Rarity", isSortable: true },
  { id: "side", label: "Side", isSortable: true },
];

export default function Achievements() {
  // data
  const { data } = useSuspenseQuery<AchievementData>(GET_ACHIEVEMENT_DATA);
  // states
  const [orderBy, setOrderBy] = useState<keyof Achievement | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  // handlers
  const handleSort = (property: keyof Achievement) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedAchievements = useMemo(() => {
    const stabilized = [...data.achievements];
    if (!orderBy) return stabilized;

    return stabilized.sort((a, b) => {
      let valA = a[orderBy];
      let valB = b[orderBy];

      // Normalize values for comparison
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [data.achievements, orderBy, order]);

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxWidth: 1400,
        mx: "auto",
        mt: 2,
        px: 2,
        borderRadius: 2,
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            {headCells.map((headCell) => (
              <TableCell
                key={headCell.id}
                align={headCell.align || "left"}
                sortDirection={orderBy === headCell.id ? order : false}
              >
                {headCell.isSortable ? (
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : "asc"}
                    onClick={() => handleSort(headCell.id)}
                  >
                    {headCell.label}
                  </TableSortLabel>
                ) : (
                  headCell.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedAchievements.map((ach) => (
            <TableRow key={ach.id}>
              <TableCell>
                <Avatar variant="rounded" src={ach.imageLink} alt={ach.name} />
              </TableCell>
              <TableCell>
                {ach.hidden ? (
                  <Tooltip title="This is a hidden achievement">
                    <span>🔒 {ach.name}</span>
                  </Tooltip>
                ) : (
                  ach.name
                )}
              </TableCell>
              <TableCell>{ach.description}</TableCell>
              <TableCell>{ach.hidden ? "Yes" : "No"}</TableCell>
              <TableCell>
                <Tooltip
                  title={`${ach.playersCompletedPercent.toFixed(1)}% completed`}
                >
                  <LinearProgress
                    variant="determinate"
                    value={ach.playersCompletedPercent}
                    sx={{ width: 100 }}
                  />
                </Tooltip>
              </TableCell>
              <TableCell>
                <Chip
                  label={ach.rarity}
                  size="small"
                  sx={getRarityChipStyle(ach.rarity)}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={ach.side}
                  size="small"
                  sx={getSideChipStyle(ach.side)}
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
