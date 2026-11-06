"use client";

import { Suspense, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { HideoutParams } from "@/types/hideout";
import { useCrafts } from "@/hooks/useCrafts";
import {
  useHideoutStations,
  useItemMap,
  useSkillMap,
  useTraderMap,
} from "@/hooks/useHideoutData";
import {
  collectItemIds,
  dependentsOf,
  formatCost,
  formatDuration,
  summarizeLevels,
} from "@/lib/hideout";
import { craftsAtLevel } from "@/lib/crafts";
// components
import FallbackImage from "@/components/hideout/FallbackImage";
import ItemRequirementsTable from "@/components/hideout/ItemRequirementsTable";
import LevelOverview from "@/components/hideout/LevelOverview";
import LevelRelations from "@/components/hideout/LevelRelations";
import PrerequisiteList from "@/components/hideout/PrerequisiteList";
import BonusList from "@/components/hideout/BonusList";
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

function HideoutStationView({ params }: HideoutParams) {
  const { hideoutId } = params;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { hideoutStations, error, isLoading } = useHideoutStations();
  const { tradersById, isLoading: tradersLoading } = useTraderMap();
  // names and icons of skills; never blocks the page
  const { skillsById } = useSkillMap();
  // crafts only add a "N crafts unlocked" line, so they never block the page
  const { crafts } = useCrafts();

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

  // The level lives in the URL (?level=3), so it can be shared and survives a
  // refresh. Missing or unknown values fall back to the first level.
  const requestedLevel = Number(searchParams?.get("level"));
  const levelData =
    station?.levels.find((l) => l.level === requestedLevel) ??
    station?.levels[0];
  const currentLevel = levelData?.level;

  const selectLevel = useCallback(
    (level: number) => {
      router.replace(`${pathname}?level=${level}`, { scroll: false });
    },
    [router, pathname],
  );

  const summaries = useMemo(
    () => (station ? summarizeLevels(station, itemsById) : []),
    [station, itemsById],
  );
  const summary = summaries.find((s) => s.level === currentLevel);

  const dependents = useMemo(
    () =>
      station && currentLevel != null
        ? dependentsOf(hideoutStations, station.id, currentLevel)
        : [],
    [hideoutStations, station, currentLevel],
  );
  const craftCount = useMemo(
    () =>
      station && currentLevel != null && crafts.length > 0
        ? craftsAtLevel(crafts, station.id, currentLevel).length
        : null,
    [crafts, station, currentLevel],
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
  const showCosts = hasItems && !itemsError;
  const isUpgrade =
    levelData != null && levelData.level !== station.levels[0]?.level;

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
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontSize: { xs: "2rem", md: "3rem" } }}
        >
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
            if (value != null) selectLevel(value);
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
              {showCosts && (
                <Typography variant="subtitle1">
                  💰 Estimated cost:{" "}
                  <strong>
                    {itemsLoading || !summary ? (
                      <Skeleton
                        component="span"
                        width={80}
                        sx={{ display: "inline-block" }}
                      />
                    ) : (
                      formatCost(summary.cost, summary.missing)
                    )}
                  </strong>
                </Typography>
              )}
              {isUpgrade && summary && (
                <Typography variant="subtitle1" color="text.secondary">
                  📈 From level 1:{" "}
                  <strong>
                    {itemsLoading || itemsError
                      ? "…"
                      : formatCost(
                          summary.cumulativeCost,
                          summary.cumulativeMissing,
                        )}
                  </strong>{" "}
                  · {formatDuration(summary.cumulativeTime)}
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
              skillsById={skillsById}
            />

            <BonusList bonuses={levelData.bonuses} skillsById={skillsById} />

            <Box sx={{ textAlign: "left" }}>
              <ItemRequirementsTable
                requirements={levelData.itemRequirements}
                itemsById={itemsById}
                itemsLoading={itemsLoading}
              />
            </Box>

            <LevelRelations
              stationId={station.id}
              dependents={dependents}
              craftCount={craftCount}
            />
          </CardContent>
        </Card>
      ) : (
        <Typography sx={{ mt: 2 }}>
          This station has no level information.
        </Typography>
      )}

      <LevelOverview
        summaries={summaries}
        currentLevel={currentLevel}
        itemsLoading={itemsLoading}
        onSelect={selectLevel}
      />
    </Box>
  );
}

// useSearchParams needs a Suspense boundary
export default function HideoutCard(props: HideoutParams) {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <HideoutStationView {...props} />
    </Suspense>
  );
}
