import React from "react";

import { Grid, Breadcrumbs, Link } from "@mui/material";

export default function HideoutNav({ hideoutData }) {
  return (
    <Grid item xs={12} sx={{ margin: "1vh" }}>
      <Breadcrumbs>
        {hideoutData.map((data) => (
          <Link key={data.id}>{data.name}</Link>
        ))}
      </Breadcrumbs>
    </Grid>
  );
}
