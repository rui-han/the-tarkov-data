"use client";

import { FetchedData, HideoutParams } from "@/types/hideout";
import { GET_HIDEOUT_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

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
} from "@mui/material";

const styles = {
  card: { width: "100%" },
  title: {
    margin: "2vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    margin: "2vh",
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
      {hideoutData?.levels.map((levelData) => (
        <Card key={levelData.id} sx={styles.card}>
          <CardContent>
            <Typography variant="h4" sx={styles.cardTitle}>
              LEVEL {levelData.level}
            </Typography>
            {/* Prerequisites (hideout stations) */}
            <Typography component="div">
              {levelData.stationLevelRequirements
                ? levelData.stationLevelRequirements.map((preStationData) => (
                    <Box key={preStationData.id} style={styles.requirement}>
                      <img
                        src={`/icons/hideout-icons/${preStationData.station.normalizedName}-icon.png`}
                        alt=""
                        style={styles.requirementIcon}
                      />
                      <span>
                        {preStationData.station.name} lvl {preStationData.level}
                      </span>
                    </Box>
                  ))
                : null}
            </Typography>
            {/* Prerequisites (traders) */}
            <Typography component="div">
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
                        {preTraderData.trader.name} lvl {preTraderData.level}
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
                      <TableCell align="center">Price (24hrs Low)</TableCell>
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
              {levelData.constructionTime ? (
                new Date(levelData.constructionTime * 1000)
                  .toISOString()
                  .slice(11, 19)
              ) : (
                <span>N/A</span>
              )}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Grid>
  );
}
