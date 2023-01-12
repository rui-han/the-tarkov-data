import React from "react";

import {
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
  const constructionTime = new Date(null);

  return (
    <Grid item xs={6} sx={{ margin: "2vh", textAlign: "center" }}>
      <Typography variant="h4">{data.name}</Typography>
      {data.levels.map((levelData) => (
        <Card key={levelData.id}>
          <CardContent>
            <Typography>Level {levelData.level}</Typography>
            <TableContainer>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price(24hrs Low)</TableCell>
                  <TableCell>Price(24hrs Average)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {levelData.itemRequirements.map((itemData) => {
                  const itemName = itemData.item.name;
                  const iconLink = itemData.item.iconLink;
                  const quantity = itemData.quantity;
                  const low24hPrice = itemData.item.low24hPrice;

                  return (
                    <TableRow key={itemData.id}>
                      <TableCell>
                        <img src={iconLink} alt={itemName} />
                      </TableCell>
                      <TableCell align="center">{itemName}</TableCell>
                      <TableCell align="center">x {quantity}</TableCell>
                      <TableCell align="center">
                        {low24hPrice === null || Number(low24hPrice) === 0
                          ? "N/A"
                          : low24hPrice}
                      </TableCell>
                      <TableCell align="center">
                        {itemData.item.avg24hPrice}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </TableContainer>
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
