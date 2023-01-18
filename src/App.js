import React from "react";
import { Route, Routes } from "react-router-dom";

// MUI
import { Box, createTheme, CssBaseline, ThemeProvider } from "@mui/material";

// components
import Nav from "./components/Nav";
import Home from "./components/pages/home/Home";
import AmmunitionPage from "./components/pages/ammunition/AmmunitionPage";
import HideoutPage from "./components/pages/hideout/HideoutPage";
import HideoutCard from "./components/pages/hideout/HideoutCard";
import QuestsPage from "./components/pages/quests/QuestsPage";
import ErrorPage from "./components/pages/ErrorPage";

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
            marginLeft: "12vw",
            marginTop: "12vh",
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ammunition" element={<AmmunitionPage />} />
            <Route path="/hideout" element={<HideoutPage />}>
              <Route path=":hideoutId" element={<HideoutCard />} />
            </Route>
            <Route path="/quests" element={<QuestsPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Box>
      </ThemeProvider>
    </div>
  );
}

export default App;
