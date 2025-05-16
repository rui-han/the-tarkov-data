"use client";

import Nav from "@/components/navigation/Nav";
import { CssBaseline, ThemeProvider, Box } from "@mui/material";
import { darkTheme } from "./theme";

// drawer width
const DRAWER_WIDTH = 240;
const APP_BAR_HEIGHT = 64;

export default function TopLevelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Nav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: `${APP_BAR_HEIGHT}px`,
            mb: 4,
            height: "100%",
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
