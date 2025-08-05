"use client";

import { useSuspenseQuery } from "@apollo/client";
import { GET_ACHIEVEMENT_DATA } from "@/graphql/queries";
import { AchievementData } from "@/types/achievement";
// MUI
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
  Tooltip,
  Chip,
} from "@mui/material";

export default function Achievements() {
  const { data } = useSuspenseQuery<AchievementData>(GET_ACHIEVEMENT_DATA);

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Icon</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Hidden</TableCell>
            <TableCell>Completion</TableCell>
            <TableCell>Rarity</TableCell>
            <TableCell>Side</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.achievements.map((ach) => (
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
                <Chip label={ach.rarity} size="small" />
              </TableCell>
              <TableCell>
                <Chip label={ach.side} size="small" variant="outlined" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
