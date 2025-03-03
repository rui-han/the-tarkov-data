"use client";

import { useState } from "react";
import { FetchedData, HideoutParams } from "@/types/hideout";
import { GET_HIDEOUT_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/client";

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
} from "@mui/material";

const styles = {
  grid: { textAlign: "center", width: "85%" },
  titleImg: { height: "60px", marginRight: "2vw" },
  card: { width: "100%" },
  title: {
    margin: "2vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  requirement: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 1vw 1vh 0",
  },
  requirementIcon: {
    height: "48px",
    width: "48px",
    margin: "0.5vw",
    objectFit: "contain" as const,
  },
  time: { margin: "3vh" },
  levelButtons: {
    marginRight: "1vw",
    marginBottom: "2vh",
  },
  tableHeader: {
    backgroundColor: "#2d2d2f",
  },
  tableContainer: {
    border: "0.5px solid #9a8866",
  },
};

// helper function to format price
const formatPrice = (price: number | null) => {
  if (price === null || price === 0) return "N/A";
  return new Intl.NumberFormat().format(price);
};

export default function HideoutCard({ params }: HideoutParams) {
  const { data } = useSuspenseQuery<FetchedData>(GET_HIDEOUT_DATA);

  const hideoutData = data?.hideoutStations?.find(
    (data) => data.id === params.hideoutId,
  );

  const [currentLevel, setCurrentLevel] = useState(
    hideoutData?.levels[0]?.level || 1, // use first default level or 1
  );

  return (
    <Grid sx={styles.grid}>
      <Box>
        <Typography variant="h3" sx={styles.title}>
          <img
            src={`/icons/hideout-icons/${hideoutData?.normalizedName}-icon.png`}
            alt={hideoutData?.name}
            style={styles.titleImg}
          />
          {hideoutData?.name}
        </Typography>
      </Box>
      {/* switch level buttons */}
      {hideoutData?.levels.map((levelData) => (
        <Button
          key={levelData.id}
          onClick={() => setCurrentLevel(levelData.level)}
          size="large"
          color="inherit"
          variant={levelData.level === currentLevel ? "contained" : "outlined"}
          sx={styles.levelButtons}
        >
          Level {levelData.level}
        </Button>
      ))}
      {/* display current level requirements */}
      {hideoutData?.levels.map((levelData) => {
        if (levelData.level === currentLevel) {
          return (
            <Card key={levelData.id} sx={styles.card}>
              <CardContent>
                {/* Prerequisites (hideout stations) */}
                <Typography component="div" mb="1vh">
                  {levelData.stationLevelRequirements
                    ? levelData.stationLevelRequirements.map(
                        (preStationData) => (
                          <Box
                            key={preStationData.id}
                            style={styles.requirement}
                            mr="1vw"
                          >
                            <img
                              src={`/icons/hideout-icons/${preStationData.station.normalizedName}-icon.png`}
                              alt=""
                              style={styles.requirementIcon}
                            />
                            <span>
                              {preStationData.station.name} lvl{" "}
                              {preStationData.level}
                            </span>
                          </Box>
                        ),
                      )
                    : null}
                </Typography>
                {/* Prerequisites (traders) */}
                <Typography component="div" mb="1vh">
                  {levelData.traderRequirements
                    ? levelData.traderRequirements.map((preTraderData) => (
                        <Box
                          key={preTraderData.trader.id}
                          style={styles.requirement}
                        >
                          <img
                            src={`/icons/trader-icons/${preTraderData.trader.normalizedName}-icon.jpg`}
                            alt=""
                            style={styles.requirementIcon}
                          />
                          <span>
                            {preTraderData.trader.name} lvl{" "}
                            {preTraderData.level}
                          </span>
                        </Box>
                      ))
                    : null}
                </Typography>
                {/* Items table */}
                {levelData.itemRequirements[0] ? (
                  <TableContainer sx={styles.tableContainer}>
                    <Table>
                      <TableHead sx={styles.tableHeader}>
                        <TableRow>
                          <TableCell align="center"></TableCell>
                          <TableCell align="center">Item</TableCell>
                          <TableCell align="center">Quantity</TableCell>
                          <TableCell align="center">
                            Price (24hrs Low)
                          </TableCell>
                          <TableCell align="center">
                            Price (24hrs Average)
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {levelData.itemRequirements.map((itemData) => {
                          const itemName = itemData.item.name;
                          const iconLink = itemData.item.iconLink;
                          const quantity = itemData.quantity;
                          const low24hPrice = itemData.item.low24hPrice;
                          const avg24hPrice = itemData.item.avg24hPrice;
                          return (
                            <TableRow key={itemData.id}>
                              <TableCell>
                                <img src={iconLink} alt={itemName} />
                              </TableCell>
                              <TableCell align="center">{itemName}</TableCell>
                              <TableCell align="center">x {quantity}</TableCell>
                              <TableCell align="center">
                                {formatPrice(low24hPrice)}
                              </TableCell>
                              <TableCell align="center">
                                {formatPrice(avg24hPrice)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <p>No items required</p>
                )}
                {/* Construction time */}
                <Typography sx={styles.time}>
                  Construction Time:{" "}
                  {levelData.constructionTime > 0 ? (
                    <span>
                      {(levelData.constructionTime / 3600).toFixed(1)} hours
                    </span>
                  ) : (
                    <span>Immediately</span>
                  )}
                </Typography>
              </CardContent>
            </Card>
          );
        }
        return null;
      })}
    </Grid>
  );
}
