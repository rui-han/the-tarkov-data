import React from "react";

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
} from "@mui/material";

import { useOutletContext, useParams } from "react-router-dom";

export default function HideoutCard() {
  const { hideoutId } = useParams();
  const { hideoutData } = useOutletContext();

  const data = hideoutData.filter((data) => data.id === hideoutId)[0];

  return (
    <Grid item xs={6} sx={{ marginBottom: "2vh", textAlign: "center" }}>
      <Box>
        <Typography variant="h4" sx={{ margin: "2vh" }}>
          {data.name}
        </Typography>
      </Box>
      {data.levels.map((levelData) => (
        <Card key={levelData.id} sx={{ maxWidth: "45vw" }}>
          <CardContent>
            <Typography variant="h5" sx={{ margin: "2vh" }}>
              LEVEL {levelData.level}
            </Typography>
            {/* Prerequisites (hideout stations) */}
            {levelData.stationLevelRequirements
              ? levelData.stationLevelRequirements.map((preReqData) => (
                  <Box
                    key={preReqData.id}
                    style={{ display: "inline-block", margin: "1vw" }}
                  >
                    <img
                      src={`${process.env.PUBLIC_URL}/images/hideout-icons/${preReqData.station.normalizedName}-icon.png`}
                      alt=""
                      style={{ height: "2vw", width: "2vw" }}
                    />
                    <span>
                      {preReqData.station.name} lvl {preReqData.level}
                    </span>
                  </Box>
                ))
              : null}
            {/* Prerequisites (traders) */}
            {levelData.traderRequirements
              ? levelData.traderRequirements.map((preTraderData) => (
                  <Box key={preTraderData.trader.id}>
                    <span>
                      {preTraderData.trader.name} lvl {preTraderData.level}
                    </span>
                  </Box>
                ))
              : null}
            {/* Items table */}
            <TableContainer>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price (24hrs Low)</TableCell>
                  <TableCell>Price (24hrs Average)</TableCell>
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
            </TableContainer>
            {/* Construction time */}
            <Typography sx={{ margin: "3vh" }}>
              Construction Time:{" "}
              {new Date(levelData.constructionTime * 1000)
                .toISOString()
                .slice(11, 19)}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Grid>
  );
}
