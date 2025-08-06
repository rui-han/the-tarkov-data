"use client";

import { useState, useMemo } from "react";
import { useSuspenseQuery } from "@apollo/client";
import { GET_ACHIEVEMENT_DATA } from "@/graphql/queries";
import { Achievement, AchievementData } from "@/types/achievement";
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
  switch (rarity.toLowerCase()) {
    case "common":
      return {
        backgroundColor: "#444",
        color: "#ccc",
      };
    case "rare":
      return {
        backgroundColor: "#5e4b3c",
        color: "#f0e6d2",
      };
    case "legendary":
      return {
        backgroundColor: "#7a5c2e",
        color: "#f5deb3",
      };
    default:
      return {
        backgroundColor: "#333",
        color: "#aaa",
      };
  }
};

const getSideChipStyle = (side: string) => {
  switch (side.toLowerCase()) {
    case "all":
      return {
        backgroundColor: "#555",
        color: "#ddd",
      };
    case "pmc":
      return {
        backgroundColor: "#3c2f2f",
        color: "#e0cfc2",
      };
    default:
      return {
        backgroundColor: "#444",
        color: "#bbb",
      };
  }
};

export default function Achievements() {
  const { data } = useSuspenseQuery<AchievementData>(GET_ACHIEVEMENT_DATA);

  const [orderBy, setOrderBy] = useState<keyof Achievement | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");

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
            <TableCell>Icon</TableCell>
            <TableCell sortDirection={orderBy === "name" ? order : false}>
              <TableSortLabel
                active={orderBy === "name"}
                direction={orderBy === "name" ? order : "asc"}
                onClick={() => handleSort("name")}
              >
                Name
              </TableSortLabel>
            </TableCell>
            <TableCell>Description</TableCell>
            <TableCell sortDirection={orderBy === "hidden" ? order : false}>
              <TableSortLabel
                active={orderBy === "hidden"}
                direction={orderBy === "hidden" ? order : "asc"}
                onClick={() => handleSort("hidden")}
              >
                Hidden
              </TableSortLabel>
            </TableCell>
            <TableCell
              sortDirection={
                orderBy === "playersCompletedPercent" ? order : false
              }
            >
              <TableSortLabel
                active={orderBy === "playersCompletedPercent"}
                direction={
                  orderBy === "playersCompletedPercent" ? order : "asc"
                }
                onClick={() => handleSort("playersCompletedPercent")}
              >
                Completion
              </TableSortLabel>
            </TableCell>
            <TableCell sortDirection={orderBy === "rarity" ? order : false}>
              <TableSortLabel
                active={orderBy === "rarity"}
                direction={orderBy === "rarity" ? order : "asc"}
                onClick={() => handleSort("rarity")}
              >
                Rarity
              </TableSortLabel>
            </TableCell>
            <TableCell sortDirection={orderBy === "side" ? order : false}>
              <TableSortLabel
                active={orderBy === "side"}
                direction={orderBy === "side" ? order : "asc"}
                onClick={() => handleSort("side")}
              >
                Side
              </TableSortLabel>
            </TableCell>
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
