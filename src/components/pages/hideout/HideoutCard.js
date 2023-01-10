import React from "react";

import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from "@mui/material";

export default function HideoutCard({ data }) {
  return (
    <Grid item xs={6} sx={{ margin: "2vh" }}>
      <Card>
        <CardContent>
          <Typography sx={{ margin: "2vh" }}>{data.name}</Typography>
          {data.levels.map((levelData) => (
            <>
              {levelData.itemRequirements.map((itemData) => (
                <Box
                  key={itemData.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justify: "center",
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
              <Box key={levelData.id}>
                <Typography>Level {levelData.level}</Typography>
                <Typography>
                  Construction Time: {levelData.constructionTime}
                </Typography>
              </Box>
            </>
          ))}
        </CardContent>
      </Card>
    </Grid>
  );
}
