import React from "react";
import { Link } from "react-router-dom";

import { Grid, Breadcrumbs } from "@mui/material";

export default function HideoutNav({ hideoutData }) {
  return (
    <Grid item xs={12} sx={{ margin: "1vh" }}>
      <Breadcrumbs>
        {hideoutData.map((data) => (
          <Link key={data.id} to={data.id}>
            {data.name}
          </Link>
        ))}
      </Breadcrumbs>
    </Grid>
  );
}
