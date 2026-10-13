"use client";

import { useAmmoData } from "@/hooks/useAmmoData";
// components
import HowToRead from "@/components/ammunition/HowToRead";
import AmmoTable from "@/components/ammunition/AmmoTable";
// MUI
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function Ammunition() {
  const { ammo, error, isLoading } = useAmmoData();

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Failed to load ammunition data. Please try again later.
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

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

      <AmmoTable ammo={ammo} />
    </Box>
  );
}
