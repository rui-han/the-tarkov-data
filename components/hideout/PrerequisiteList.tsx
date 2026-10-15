import Link from "next/link";
import { Box, Typography } from "@mui/material";
import type { HideoutLevel, HideoutStation, Trader } from "@/types/hideout";
import FallbackImage from "./FallbackImage";

interface PrerequisiteListProps {
  level: HideoutLevel;
  stationsById: ReadonlyMap<string, HideoutStation>;
  tradersById: ReadonlyMap<string, Trader>;
  tradersLoading: boolean;
}

const chipSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  px: 1.5,
  py: 0.75,
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  color: "inherit",
  textDecoration: "none",
} as const;

const linkChipSx = {
  ...chipSx,
  transition: "background-color 0.2s",
  "&:hover": { bgcolor: "action.hover" },
} as const;

export default function PrerequisiteList({
  level,
  stationsById,
  tradersById,
  tradersLoading,
}: PrerequisiteListProps) {
  const { stationRequirements, traderRequirements, skillRequirements } = level;

  if (
    stationRequirements.length === 0 &&
    traderRequirements.length === 0 &&
    skillRequirements.length === 0
  ) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 2,
        mb: 3,
      }}
    >
      {stationRequirements.map((req) => {
        const station = stationsById.get(req.stationId);
        const content = (
          <>
            <FallbackImage
              sources={[
                station &&
                  `/icons/hideout-icons/${station.normalizedName}-icon.png`,
                station?.imageLink,
              ]}
              alt=""
              size={40}
            />
            <Typography variant="body2">
              {station?.name ?? "Unknown station"} lvl {req.level}
            </Typography>
          </>
        );

        return station ? (
          <Box
            key={req.id}
            component={Link}
            href={`/hideout/${station.id}`}
            sx={linkChipSx}
          >
            {content}
          </Box>
        ) : (
          <Box key={req.id} sx={chipSx}>
            {content}
          </Box>
        );
      })}

      {traderRequirements.map((req) => {
        const trader = tradersById.get(req.traderId);
        return (
          <Box key={req.id} sx={chipSx}>
            <FallbackImage
              sources={[
                trader &&
                  `/icons/trader-icons/${trader.normalizedName}-icon.jpg`,
                trader?.imageLink,
              ]}
              alt=""
              size={40}
            />
            <Typography variant="body2">
              {trader?.name ?? (tradersLoading ? "…" : "Unknown trader")} LL
              {req.level}
            </Typography>
          </Box>
        );
      })}

      {skillRequirements.map((req) => (
        <Box key={req.id} sx={chipSx}>
          <Typography variant="body2">
            {req.name} lvl {req.level}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
