import React from "react";
import { Route, Routes } from "react-router-dom";

// MUI
import { Box, createTheme, CssBaseline, ThemeProvider } from "@mui/material";

// components
import Nav from "./components/Nav";
import AmmunitionPage from "./components/pages/ammunition/AmmunitionPage";
import HideoutPage from "./components/pages/hideout/HideoutPage";
import Home from "./components/pages/home/Home";

// dark theme with customization
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#2d2df" },
    background: {
      main: "#2d2df",
    },
    text: {
      primary: "#9a8866",
    },
  },
});

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Nav />
        <Box
          component="main"
          sx={{
            marginLeft: "10vw",
            marginTop: "10vh",
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ammunition" element={<AmmunitionPage />} />
            <Route path="/hideout" element={<HideoutPage />} />
          </Routes>
        </Box>
      </ThemeProvider>
    </div>
  );
}

export default App;
