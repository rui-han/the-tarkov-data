"use client";

import { useState } from "react";
import { GET_HIDEOUT_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/client";
import { FetchedData } from "@/types/hideout";
import HideoutNav from "@/components/hideout/HideoutNav";
// MUI
import { Box, Divider, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HideoutFlowchartModal from "@/components/hideout/HideoutFlowchartModal";

export default function HideoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data } = useSuspenseQuery<FetchedData>(GET_HIDEOUT_DATA);

  if (!data) return null;

  // Filter hideout stations based on search query
  const filteredHideoutStations = data.hideoutStations.filter((station) =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
          marginTop: "2vh",
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: "white",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.3)",
            },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(255, 255, 255, 0.7)",
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
            </InputAdornment>
          ),
        }}
      />

      <HideoutNav hideoutStations={filteredHideoutStations} />
      <HideoutFlowchartModal />
      {/* the width of the Divider matches that of the hideout navbar Breadcrumbs, which is 90% */}
      <Divider sx={{ color: "white", width: "90%" }} />
      {children}
    </Box>
  );
}
