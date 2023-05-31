import React from "react";
import { Link } from "react-router-dom";

import { Breadcrumbs, Tooltip, Box, Divider } from "@mui/material";

import HideoutFlowchart from "../../../images/hideout-flowchart.jpeg";

const styles = {
  inherit: {
    color: "inherit",
    textDecoration: "inherit",
  },
  icon: { height: "64px", width: "64px" },
};

export default function HideoutNav({ hideoutData }) {
  return (
    <>
      <Breadcrumbs maxItems={30} sx={{ width: "75%" }}>
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
      <Box width="75%" borderBottom={1} mt={2} mb={2}>
        <Divider />
      </Box>
      <img src={HideoutFlowchart} alt="" style={{ width: "95%" }} />
    </>
  );
}
