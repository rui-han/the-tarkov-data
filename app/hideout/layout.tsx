"use client";

import { useState, useMemo } from "react";
import { useHideoutStations } from "@/hooks/useHideoutData";
import HideoutNav from "@/components/hideout/HideoutNav";
// MUI
import {
  Box,
  Divider,
  TextField,
  InputAdornment,
  Typography,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function HideoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const { hideoutStations, error, isLoading, shapeError } =
    useHideoutStations();

  // Hooks must run unconditionally on every render, so this stays above the
  // early returns below.
  const filteredHideoutStations = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return hideoutStations;
    return hideoutStations.filter((station) =>
      station.name.toLowerCase().includes(keyword),
    );
  }, [hideoutStations, searchQuery]);

  if (error) {
    console.error("Error fetching hideout data:", error);
    return (
      <Typography color="error" sx={{ p: 4 }}>
        Failed to load hideout data. Please try again later.
      </Typography>
    );
  }

  // the spinner is only for real loading
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // loaded, but the payload doesn't look like what we expect
  if (shapeError) {
    return (
      <Typography color="error" sx={{ p: 4 }}>
        Hideout data was loaded but its format is unexpected. Check the browser
        console for details.
      </Typography>
    );
  }

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {/* Search Bar */}
      <TextField
        placeholder="Search hideout..."
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          width: "90%",
          maxWidth: "800px",
          marginTop: "2vh",
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <HideoutNav hideoutStations={filteredHideoutStations} />
      {/* the width of the Divider matches that of the hideout nav, which is 90% */}
      <Divider sx={{ width: "90%", mt: 2 }} />
      {children}
    </Box>
  );
}
