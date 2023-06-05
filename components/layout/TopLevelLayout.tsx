"use client";

import Nav from "@/components/navigation/Nav";
import { darkTheme } from "./theme";

import { CssBaseline, ThemeProvider, Grid } from "@mui/material";

export default function TopLevelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={darkTheme}>
      <Nav />
      <Grid container sx={{ flexGrow: 1, height: "100vh" }}>
        <CssBaseline />
        <Nav />
        <Grid
          item
          xs={12}
          sx={{
            mt: "64px",
            height: "100%",
            ml: { sm: "240px" },
            display: "flex",
            justifyContent: "center",
          }}
        >
          {children}
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
