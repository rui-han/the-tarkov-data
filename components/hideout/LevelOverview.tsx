import {
  Button,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { formatCost, formatDuration } from "@/lib/hideout";
import type { LevelSummary } from "@/types/hideout";

interface LevelOverviewProps {
  summaries: LevelSummary[];
  currentLevel?: number;
  /** items payload still downloading, so costs aren't known yet */
  itemsLoading: boolean;
  onSelect: (level: number) => void;
}

/** Every level of a station at a glance; click a row to open that level. */
export default function LevelOverview({
  summaries,
  currentLevel,
  itemsLoading,
  onSelect,
}: LevelOverviewProps) {
  if (summaries.length < 2) return null;

  const cost = (value: number, missing: number) =>
    itemsLoading ? (
      <Skeleton width={70} sx={{ ml: "auto" }} />
    ) : (
      formatCost(value, missing)
    );

  return (
    <Paper variant="outlined" sx={{ mt: 3, textAlign: "left" }}>
      <Typography variant="h6" component="h2" sx={{ px: 2, pt: 2 }}>
        All levels at a glance
      </Typography>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small" aria-label="Levels overview" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell>Level</TableCell>
              <TableCell align="right">Build time</TableCell>
              <TableCell align="right">Items</TableCell>
              <TableCell align="right">Cost</TableCell>
              <TableCell align="right">Total from level 1</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summaries.map((s) => (
              <TableRow
                key={s.level}
                hover
                selected={s.level === currentLevel}
                onClick={() => onSelect(s.level)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>
                  <Button
                    size="small"
                    color="inherit"
                    aria-current={s.level === currentLevel ? "true" : undefined}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(s.level);
                    }}
                  >
                    Level {s.level}
                  </Button>
                </TableCell>
                <TableCell align="right">
                  {formatDuration(s.constructionTime)}
                </TableCell>
                <TableCell align="right">
                  {s.itemCount}
                  {s.firCount > 0 ? ` (${s.firCount} FIR)` : ""}
                </TableCell>
                <TableCell align="right">{cost(s.cost, s.missing)}</TableCell>
                <TableCell align="right">
                  {cost(s.cumulativeCost, s.cumulativeMissing)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", px: 2, py: 1 }}
      >
        &ldquo;≥&rdquo; means some items have no price and are not counted.
      </Typography>
    </Paper>
  );
}