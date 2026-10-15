"use client";

import { useMemo, useState } from "react";
import { HideoutParams } from "@/types/hideout";
import {
  useHideoutStations,
  useItemMap,
  useTraderMap,
} from "@/hooks/useHideoutData";
import {
  collectItemIds,
  formatDuration,
  formatPrice,
  levelCost,
} from "@/lib/hideout";
// components
import FallbackImage from "@/components/hideout/FallbackImage";
import PrerequisiteList from "@/components/hideout/PrerequisiteList";
import ItemRequirementsTable from "@/components/hideout/ItemRequirementsTable";
// MUI
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

export default function HideoutCard({ params }: HideoutParams) {
  const { hideoutId } = params;

  const { hideoutStations, error, isLoading } = useHideoutStations();
  const { tradersById, isLoading: tradersLoading } = useTraderMap();

  // look up only the items the hideout actually needs
  const allItemIds = useMemo(
    () => collectItemIds(hideoutStations),
    [hideoutStations],
  );
  const {
    itemsById,
    error: itemsError,
    isLoading: itemsLoading,
  } = useItemMap(allItemIds);

  const stationsById = useMemo(
    () => new Map(hideoutStations.map((s) => [s.id, s])),
    [hideoutStations],
  );
  const station = stationsById.get(hideoutId);

  // The selection remembers which station it belongs to, so opening another
  // station falls back to its first level without an effect.
  const [selection, setSelection] = useState<{
    stationId: string;
    level: number;
  } | null>(null);
  const currentLevel =
    selection?.stationId === hideoutId
      ? selection.level
      : station?.levels[0]?.level;
  const levelData = station?.levels.find((l) => l.level === currentLevel);

  const cost = useMemo(
    () => (levelData ? levelCost(levelData.itemRequirements, itemsById) : null),
    [levelData, itemsById],
  );

  if (error) {
    console.error("Error fetching hideout station data:", error);
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load hideout details. Please try again.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!station) {
    return (
      <Box sx={{ width: "90%", mx: "auto", mt: 4, textAlign: "center" }}>
        <Alert severity="warning">
          Hideout station not found for ID: {hideoutId}.
        </Alert>
      </Box>
    );
  }

  const hasItems = (levelData?.itemRequirements.length ?? 0) > 0;

  return (
    <Box sx={{ width: "90%", mx: "auto", pb: 4, textAlign: "center" }}>
      {/* Title with icon */}
      <Box
        sx={{
          m: "2vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <FallbackImage
          key={station.id}
          sources={[
            `/icons/hideout-icons/${station.normalizedName}-icon.png`,
            station.imageLink,
          ]}
          alt={station.name}
          size={60}
        />
        <Typography variant="h3" sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
          {station.name}
        </Typography>
      </Box>

      {/* level switcher */}
      {station.levels.length > 0 && (
        <ToggleButtonGroup
          exclusive
          color="primary"
          value={currentLevel}
          onChange={(_, value: number | null) => {
            if (value != null) {
              setSelection({ stationId: hideoutId, level: value });
            }
          }}
          aria-label="Hideout level"
          sx={{ mb: 3, flexWrap: "wrap", justifyContent: "center" }}
        >
          {station.levels.map((l) => (
            <ToggleButton key={l.id} value={l.level} sx={{ px: 3 }}>
              Level {l.level}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      )}

      {itemsError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Item names and prices could not be loaded.
        </Alert>
      )}

      {levelData ? (
        <Card sx={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}>
          <CardContent>
            {/* summary */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: { xs: 1, sm: 4 },
                mb: 2,
              }}
            >
              <Typography variant="subtitle1">
                ⏱️ Construction time:{" "}
                <strong>{formatDuration(levelData.constructionTime)}</strong>
              </Typography>
              {hasItems && !itemsError && (
                <Typography variant="subtitle1">
                  💰 Estimated cost:{" "}
                  <strong>
                    {itemsLoading || !cost ? (
                      <Skeleton
                        component="span"
                        width={80}
                        sx={{ display: "inline-block" }}
                      />
                    ) : (
                      formatPrice(cost.total)
                    )}
                  </strong>
                </Typography>
              )}
            </Box>

            {levelData.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, maxWidth: 800, mx: "auto" }}
              >
                {levelData.description}
              </Typography>
            )}

            <PrerequisiteList
              level={levelData}
              stationsById={stationsById}
              tradersById={tradersById}
              tradersLoading={tradersLoading}
            />

            <Box sx={{ textAlign: "left" }}>
              <ItemRequirementsTable
                requirements={levelData.itemRequirements}
                itemsById={itemsById}
                itemsLoading={itemsLoading}
              />
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Typography sx={{ mt: 2 }}>
          This station has no level information.
        </Typography>
      )}
    </Box>
  );
}
