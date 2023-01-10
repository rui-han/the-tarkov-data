import React, { useEffect, useState } from "react";

import HideoutCard from "./HideoutCard";
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
          <HideoutNav hideoutData={hideoutData} />
          {hideoutData.map((data) => (
            <HideoutCard key={data.id} data={data} />
          ))}
        </>
      ) : (
        <h3>Loading...</h3>
      )}
    </Grid>
  );
}
