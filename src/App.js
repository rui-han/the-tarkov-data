import React from "react";
import { Route, Routes } from "react-router-dom";

import "./App.css";
import { Box, createTheme, CssBaseline, ThemeProvider } from "@mui/material";

import Nav from "./components/Nav";
import AmmunitionPage from "./components/pages/AmmunitionPage";
import HideoutPage from "./components/pages/HideoutPage";

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
            marginLeft: "7vw",
            marginTop: "10vh",
          }}
        >
          <Routes>
            <Route path="/" element={<AmmunitionPage />} />
            <Route path="/hideout" element={<HideoutPage />} />
          </Routes>
        </Box>
      </ThemeProvider>
    </div>
  );
}

export default App;
