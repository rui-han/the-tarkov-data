import React from "react";
import { Link } from "react-router-dom";

import { Grid, Breadcrumbs, Tooltip } from "@mui/material";

const styles = {
  inherit: {
    color: "inherit",
    textDecoration: "inherit",
  },
  icon: { height: "60px", width: "60px" },
};

export default function HideoutNav({ hideoutData }) {
  return (
    <Grid item xs={12} sx={{ margin: "1vh" }}>
      <Breadcrumbs itemsAfterCollapse={26} sx={{ maxWidth: "60vw" }}>
        {hideoutData.map((data) => (
          <Link key={data.id} to={data.id} style={styles.inherit}>
            <Tooltip title={data.name} arrow>
              <img
                src={`${process.env.PUBLIC_URL}/images/hideout-icons/${data.normalizedName}-icon.png`}
                alt={data.name}
                style={styles.icon}
              />
            </Tooltip>
          </Link>
        ))}
      </Breadcrumbs>
    </Grid>
  );
}
