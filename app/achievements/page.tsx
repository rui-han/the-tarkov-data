"use client";

import { useSuspenseQuery } from "@apollo/client";
import { GET_ACHIEVEMENT_DATA } from "@/graphql/queries";
import { useAchievementSort } from "@/hooks/useAchievementSort";
// types
import { AchievementData } from "@/types/achievement";
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
  Alert,
  Box,
} from "@mui/material";
// utils
import {
  createChipStyle,
  rarityTheme,
  sideTheme,
  headCells,
} from "@/utils/achievement-utils";

export default function Achievements() {
  // data
  const { data, error } =
    useSuspenseQuery<AchievementData>(GET_ACHIEVEMENT_DATA);

  // states — must be called unconditionally, before any early return
  const { orderBy, order, handleSort, sortedAchievements } = useAchievementSort(
    data?.achievements ?? [],
    {
      defaultOrder: "asc",
      defaultOrderBy: "name",
    },
  );

  if (error) {
    console.error("Error fetching achievement data:", error);
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Failed to load achievement data. Please try again later.
        </Alert>
      </Box>
    );
  }

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
                  sx={createChipStyle(rarityTheme, ach.rarity)}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={ach.side}
                  size="small"
                  sx={createChipStyle(sideTheme, ach.side)}
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
