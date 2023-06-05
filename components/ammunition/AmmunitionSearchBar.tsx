"use client";

import { useState } from "react";

import { TextField } from "@mui/material";

import AmmunitionSearchResult from "./AmmunitionSearchResult";

export default function SearchBar() {
  const [searchInput, setSearchInput] = useState("");

  return (
    <>
      <TextField
        sx={{ width: "70%" }}
        placeholder="search for ammunition here"
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <AmmunitionSearchResult searchInput={searchInput} />
    </>
  );
}
