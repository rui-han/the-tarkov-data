import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";
import type { StationDependent } from "@/types/hideout";

interface LevelRelationsProps {
  stationId: string;
  /** station levels that need this level */
  dependents: StationDependent[];
  /** crafts unlocked at this level; null while unknown */
  craftCount: number | null;
}

const chipSx = {
  display: "inline-flex",
  alignItems: "center",
  px: 1.5,
  py: 0.5,
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  color: "inherit",
  textDecoration: "none",
  transition: "background-color 0.2s",
  "&:hover": { bgcolor: "action.hover" },
} as const;

/** What this level leads to: stations that need it, and the crafts it unlocks. */
export default function LevelRelations({
  stationId,
  dependents,
  craftCount,
}: LevelRelationsProps) {
  const hasCrafts = craftCount != null && craftCount > 0;
  if (dependents.length === 0 && !hasCrafts) return null;

  return (
    <Box sx={{ mt: 3, textAlign: "left" }}>
      {dependents.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: "block", lineHeight: 1.8 }}
          >
            Needed by
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {dependents.map((d) => (
              <Box
                key={`${d.stationId}-${d.level}`}
                component={Link}
                href={`/hideout/${d.stationId}?level=${d.level}`}
                sx={chipSx}
              >
                <Typography variant="body2">
                  {d.stationName} lvl {d.level}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {hasCrafts && (
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: "block", lineHeight: 1.8 }}
          >
            Unlocks
          </Typography>
          <Link
            href={`/crafts?station=${encodeURIComponent(stationId)}`}
            style={{ textDecoration: "none" }}
          >
            <Button size="small" variant="outlined">
              {craftCount} craft{craftCount > 1 ? "s" : ""} at this level
            </Button>
          </Link>
        </Box>
      )}
    </Box>
  );
}
