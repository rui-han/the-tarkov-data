import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import HideoutNav from "./HideoutNav";

// MUI
import { Grid } from "@mui/material";

const uri = "https://api.tarkov.dev/graphql";

// GraphQL query
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
          low24hPrice
          avg24hPrice
        }
        quantity
      }
    }
  }
}`;

export default function HideoutPage() {
  const [hideoutData, setHideoutData] = useState();

  // get data from tarkov.dev
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
          <HideoutNav hideoutData={hideoutData} />
          <Outlet context={{ hideoutData }} />
        </>
      ) : (
        <h3>Loading...</h3>
      )}
    </Grid>
  );
}
