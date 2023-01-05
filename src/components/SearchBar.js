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
      sx={{ marginLeft: "10vw" }}
    >
      <Grid item xs={10}>
        <TextField
          sx={{ width: "60vw" }}
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
