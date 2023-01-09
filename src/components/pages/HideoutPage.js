import {
  Breadcrumbs,
  Card,
  CardContent,
  Typography,
  Link,
  Grid,
  CardMedia,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";

const uri = "https://api.tarkov.dev/graphql";

const GET_HIDEOUT_DATA = `{
  hideoutStations {
    id
    name
    levels {
      id
      level
      constructionTime
      itemRequirements {
        id
        item {
          name
          iconLink
        }
        quantity
      }
    }
  }
}`;

export default function HideoutPage() {
  const [hideoutData, setHideoutData] = useState();

  useEffect(() => {
    fetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: GET_HIDEOUT_DATA,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        setHideoutData(result.data.hideoutStations);
        console.log(hideoutData);
      });
  }, []);

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justify="center"
    >
      {hideoutData ? (
        <>
          <Grid item xs={12} sx={{ margin: "1vh" }}>
            <Breadcrumbs>
              {hideoutData.map((data) => (
                <Link key={data.id}>{data.name}</Link>
              ))}
            </Breadcrumbs>
          </Grid>
          {hideoutData.map((data) => (
            <Grid item key={data.id} xs={6} sx={{ margin: "2vh" }}>
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
          ))}
        </>
      ) : null}
    </Grid>
  );
}
