"use client";

import Nav from "@/components/navigation/Nav";
import { darkTheme } from "./theme";
import { CssBaseline, ThemeProvider, Grid, Box } from "@mui/material";

export default function TopLevelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={darkTheme}>
      <Grid container sx={{ flexGrow: 1, height: "100%" }}>
        <CssBaseline />
        <Nav />
        <Grid
          item
          xs={12}
          sx={{
            mt: "64px",
            height: "100%",
            ml: { sm: "240px" }, // for small screen devices, margin left is 0
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            {children}
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
