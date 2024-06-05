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
  },
  requirementIcon: {
    height: "48px",
    width: "48px",
    margin: "0.5vw",
  },
  time: { margin: "3vh" },
};

export default function HideoutCard({ params }: HideoutParams) {
  const { data } = useSuspenseQuery<FetchedData>(GET_HIDEOUT_DATA);
  const hideoutData = data?.hideoutStations?.filter(
    (data) => data.id === params.hideoutId,
  )[0];

  const [currentLevel, setCurrentLevel] = useState(1);

  return (
    <Grid sx={{ textAlign: "center", width: "85%" }}>
      <Box>
        <Typography variant="h3" sx={styles.title}>
          <img
            src={`/icons/hideout-icons/${hideoutData?.normalizedName}-icon.png`}
            alt={hideoutData?.name}
            style={{ height: "60px", marginRight: "2vw" }}
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
          sx={{ mr: "1vw", mb: "2vh" }}
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
                  <TableContainer sx={{ border: "0.5px solid #9a8866" }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: "#2d2d2f" }}>
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
                                {low24hPrice === null || low24hPrice === 0
                                  ? "N/A"
                                  : low24hPrice}
                              </TableCell>
                              <TableCell align="center">
                                {avg24hPrice === null || avg24hPrice === 0
                                  ? "N/A"
                                  : avg24hPrice}
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
                    <span>{levelData.constructionTime / 3600} hours</span>
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
