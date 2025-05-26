"use client";

import { useState, useMemo, useEffect } from "react";
import { FetchedData, HideoutParams } from "@/types/hideout";
import { GET_HIDEOUT_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/client";
// MUI
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Table,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

const styles = {
  grid: {
    textAlign: "center" as const,
    width: "90%",
    margin: "0 auto",
    paddingBottom: "2rem",
  },
  titleImg: {
    height: "60px",
    width: "60px",
    marginRight: "1rem",
    objectFit: "contain" as const,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    transition: "all 0.3s ease-in-out",
  },
  title: {
    margin: "2vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  requirement: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0.5rem",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
  requirementContainer: {
    display: "flex",
    flexWrap: "wrap" as const,
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "1rem",
  },
  requirementIcon: {
    height: "48px",
    width: "48px",
    margin: "0.5vw",
    objectFit: "contain" as const,
  },
  itemIconCell: {
    width: "128px",
    padding: "8px",
  },
  itemIcon: {
    height: "72px",
    width: "72px",
    objectFit: "contain" as const,
    verticalAlign: "middle",
    borderRadius: "4px",
  },
  time: {
    margin: "3vh",
  },
  levelButtons: {
    marginRight: "1vw",
    marginBottom: "2vh",
    minWidth: "100px",
  },
  tableHeader: {
    backgroundColor: "#2d2d2f",
    "& .MuiTableCell-head": {
      fontWeight: "bold",
      fontSize: "1.1rem",
    },
  },
  tableContainer: {
    border: "0.5px solid #9a8866",
  },
};

// helper function to format price & construction time
const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined || price === 0) return "N/A";
  return new Intl.NumberFormat("en-US").format(price);
};
const formatConstructionTime = (seconds: number): string => {
  if (seconds <= 0) return "Instantly";
  const hours = seconds / 3600;
  if (hours < 1) {
    const minutes = seconds / 60;
    return `${minutes.toFixed(0)} minutes`;
  }
  return `${hours.toFixed(1)} hours`;
};

export default function HideoutCard({ params }: HideoutParams) {
  const { hideoutId } = params;
  const { data, error: queryError } =
    useSuspenseQuery<FetchedData>(GET_HIDEOUT_DATA);

  // memoize hideoutData derivation
  const hideoutData = useMemo(() => {
    return data?.hideoutStations?.find((station) => station.id === hideoutId);
  }, [data?.hideoutStations, hideoutId]);

  const [currentLevel, setCurrentLevel] = useState<number>(1);

  // effect to set initial currentLevel once hideoutData is available
  useEffect(() => {
    if (hideoutData?.levels && hideoutData.levels.length > 0) {
      // Check if currentLevel is already one of the available levels to prevent unnecessary updates
      // or if the previously selected level for this hideoutId (e.g. from localStorage) is valid.
      // For now, just setting to the first.
      setCurrentLevel(hideoutData.levels[0].level);
    } else if (hideoutData) {
      // If hideoutData exists but has no levels, default to 1 (or handle as error/empty state)
      setCurrentLevel(1);
    }
  }, [hideoutData]);

  // memoize currentLevelData derivation
  const currentLevelData = useMemo(() => {
    return hideoutData?.levels?.find((level) => level.level === currentLevel);
  }, [hideoutData?.levels, currentLevel]);

  // error handling
  if (queryError) {
    console.error("Error fetching hideout station data:", queryError);
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load hideout details. Please try again.
      </Alert>
    );
  }
  if (!data?.hideoutStations && !queryError) {
    // This check might be redundant if useSuspenseQuery and an ErrorBoundary are fully handling things,
    // but good as a fallback or if data structure is unexpectedly empty.
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
  if (!hideoutData) {
    // This case means the specific hideoutId was not found in the fetched data.
    return (
      <Box
        sx={{
          textAlign: "center",
          mt: 4,
          width: styles.grid.width,
          margin: styles.grid.margin,
        }}
      >
        <Alert severity="warning">
          Hideout station not found for ID: {hideoutId}.
        </Alert>
      </Box>
    );
  }

  return (
    <Grid container sx={styles.grid}>
      {/* Title with icon */}
      <Grid item xs={12}>
        <Typography variant="h3" sx={styles.title}>
          <img
            src={`/icons/hideout-icons/${hideoutData?.normalizedName}-icon.png`}
            alt={hideoutData?.name}
            style={styles.titleImg}
          />
          {hideoutData?.name}
        </Typography>
      </Grid>

      {/* switch level buttons */}
      {hideoutData.levels && hideoutData.levels.length > 0 && (
        <Grid item xs={12}>
          {hideoutData.levels.map((levelData) => (
            <Button
              key={levelData.id}
              onClick={() => setCurrentLevel(levelData.level)}
              size="large"
              color="inherit"
              variant={
                levelData.level === currentLevel ? "contained" : "outlined"
              }
              sx={styles.levelButtons}
            >
              Level {levelData.level}
            </Button>
          ))}
        </Grid>
      )}

      {/* display current level requirements */}
      {currentLevelData ? (
        <Grid item xs={12}>
          <Card sx={styles.card}>
            <CardContent>
              {/* Prerequisites (stations & traders) */}
              {(currentLevelData.stationLevelRequirements?.length > 0 ||
                currentLevelData.traderRequirements?.length > 0) && (
                <Box sx={styles.requirementContainer}>
                  {currentLevelData.stationLevelRequirements?.map(
                    (preStationData) => (
                      <Box
                        key={preStationData.id}
                        sx={styles.requirement} // Using sx here for consistency
                      >
                        <img
                          src={`/icons/hideout-icons/${preStationData.station.normalizedName}-icon.png`} // Fallback or direct path
                          alt={`${preStationData.station.name} icon`} // Better alt text
                          style={styles.requirementIcon}
                        />
                        <Typography variant="body2">
                          {" "}
                          {/* Use Typography for consistent text styling */}
                          {preStationData.station.name} lvl{" "}
                          {preStationData.level}
                        </Typography>
                      </Box>
                    ),
                  )}
                  {currentLevelData.traderRequirements?.map((preTraderData) => (
                    <Box key={preTraderData.trader.id} sx={styles.requirement}>
                      <img
                        src={`/icons/trader-icons/${preTraderData.trader.normalizedName}-icon.jpg`}
                        alt={`${preTraderData.trader.name} icon`}
                        style={styles.requirementIcon}
                      />
                      <Typography variant="body2">
                        {preTraderData.trader.name} lvl {preTraderData.level}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Items table */}
              {currentLevelData.itemRequirements &&
              currentLevelData.itemRequirements.length > 0 ? (
                <TableContainer sx={styles.tableContainer}>
                  <Table stickyHeader size="small">
                    <TableHead sx={styles.tableHeader}>
                      <TableRow>
                        <TableCell
                          sx={{ width: styles.itemIconCell.width }}
                        ></TableCell>{" "}
                        {/* Icon column */}
                        <TableCell>Item</TableCell>{" "}
                        {/* Align left by default is fine */}
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price (24h Low)</TableCell>
                        <TableCell align="right">Price (24h Avg)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentLevelData.itemRequirements.map((itemData) => (
                        <TableRow key={itemData.id} hover>
                          <TableCell sx={styles.itemIconCell}>
                            <img
                              src={itemData.item.iconLink}
                              alt={itemData.item.name}
                              style={styles.itemIcon}
                            />
                          </TableCell>
                          <TableCell>{itemData.item.name}</TableCell>
                          <TableCell align="right">
                            x {itemData.quantity}
                          </TableCell>
                          <TableCell align="right">
                            {formatPrice(itemData.item.low24hPrice)} ₽{" "}
                            {/* Added currency symbol for clarity */}
                          </TableCell>
                          <TableCell align="right">
                            {formatPrice(itemData.item.avg24hPrice)} ₽
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography sx={{ my: 2, textAlign: "center" }}>
                  No items required for this level.
                </Typography>
              )}

              {/* Construction time */}
              <Typography sx={styles.time} variant="subtitle1" align="center">
                ⏱️ Construction Time:{" "}
                <strong>
                  {formatConstructionTime(currentLevelData.constructionTime)}
                </strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        hideoutData.levels &&
        hideoutData.levels.length > 0 && (
          // Only show if levels exist but none selected (should not happen with useEffect)
          <Typography sx={{ mt: 2, textAlign: "center" }}>
            Select a level to see details.
          </Typography>
        )
      )}
    </Grid>
  );
}
