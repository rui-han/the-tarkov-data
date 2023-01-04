import React, { useState } from "react";

import { Grid, TextField } from "@mui/material";

import SearchResult from "./SearchResult";

export default function SearchBar() {
  const [searchInput, setSearchInput] = useState("");

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justify="center"
    >
      <Grid item xs={10}>
        <TextField
          placeholder="search for ammunition here"
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </Grid>
      <Grid item xs={4}>
        <SearchResult searchInput={searchInput} />
      </Grid>
    </Grid>
  );
}
