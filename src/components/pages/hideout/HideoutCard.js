import React from "react";

import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from "@mui/material";

import { useOutletContext, useParams } from "react-router-dom";

export default function HideoutCard() {
  const { hideoutId } = useParams();
  const { hideoutData } = useOutletContext();

  const data = hideoutData.filter((data) => data.id === hideoutId)[0];

  return (
    <Grid item xs={6} sx={{ margin: "2vh" }}>
      <Card>
        <CardContent>
          <Typography variant="h4">{data.name}</Typography>
          {data.levels.map((levelData) => (
            <Box key={levelData.id}>
              <Box sx={{ marginTop: "3vh" }}>
                <Typography>Level {levelData.level}</Typography>
              </Box>
              {levelData.itemRequirements.map((itemData) => (
                <Box
                  key={itemData.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justify: "center",
                    margin: "1vh",
                  }}
                >
                  <CardMedia
                    sx={{ height: "5vh", width: "5vh" }}
                    component="img"
                    image={itemData.item.iconLink}
                  />
                  <Typography>
                    {itemData.item.name} x {itemData.quantity}
                  </Typography>
                </Box>
              ))}
              <Typography>
                Construction Time: {levelData.constructionTime}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Grid>
  );
}
