import React from "react";
import { Link } from "react-router-dom";

import { Grid, Breadcrumbs } from "@mui/material";

const styles = {
  inherit: {
    color: "inherit",
    textDecoration: "inherit",
  },
};

export default function HideoutNav({ hideoutData }) {
  return (
    <Grid item xs={12} sx={{ margin: "1vh" }}>
      <Breadcrumbs style={styles.inherit}>
        {hideoutData.map((data) => (
          <Link key={data.id} to={data.id} style={styles.inherit}>
            {data.name}
          </Link>
        ))}
      </Breadcrumbs>
    </Grid>
  );
}
