"use client";

import { useState, useMemo } from "react";
import { GET_HIDEOUT_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/client";
import { FetchedData } from "@/types/hideout";
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
import HideoutFlowchartModal from "@/components/hideout/HideoutFlowchartModal";

export default function HideoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, error } = useSuspenseQuery<FetchedData>(GET_HIDEOUT_DATA);

  // error handling
  if (error) {
    console.error("Error fetching hideout data:", error);
    return (
      <Typography color="error">
        Failed to load hideout data. Please try again later.
      </Typography>
    );
  }
  if (!data || !data.hideoutStations) {
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

  // filter hideout stations based on search query
  const filteredHideoutStations = useMemo(() => {
    if (!data?.hideoutStations) return [];
    return data.hideoutStations.filter((station) =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [data?.hideoutStations, searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

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
        onChange={handleSearchChange}
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
      <HideoutFlowchartModal />
      {/* the width of the Divider matches that of the hideout navbar Breadcrumbs, which is 90% */}
      <Divider sx={{ width: "90%" }} />
      {children}
    </Box>
  );
}
