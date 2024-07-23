"use client";

import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        {!isHomePage && <Nav />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: isHomePage ? 0 : "64px",
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
