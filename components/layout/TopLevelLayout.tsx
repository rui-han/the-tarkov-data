"use client";

import Nav from "@/components/navigation/Nav";
import { CssBaseline, ThemeProvider, Box, createTheme } from "@mui/material";

// drawer width
const drawerWidth = 240;

// dark theme with customization
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#2D2D2F",
    },
    text: {
      primary: "#9a8866",
    },
  },
});

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
            mt: "64px",
            mb: 4,
            height: "100%",
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
