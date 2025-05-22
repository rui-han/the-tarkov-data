"use client";

import { GET_AMMO_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/client";
import { FetchedData } from "@/types/ammo";
// components
import HowToRead from "@/components/ammunition/HowToRead";
import AmmoTable from "@/components/ammunition/AmmoTable";
// MUI
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function Ammunition() {
  const { data } = useSuspenseQuery<FetchedData>(GET_AMMO_DATA);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        py: 4,
        alignItems: "center",
      }}
    >
      <Accordion sx={{ width: "90%", maxWidth: "1200px" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          How Do I Read This Table?
        </AccordionSummary>
        <AccordionDetails>
          <HowToRead />
        </AccordionDetails>
      </Accordion>

      <AmmoTable ammo={data.ammo} />
    </Box>
  );
}
