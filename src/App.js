import React from "react";
import { Route, Routes } from "react-router-dom";

// MUI
import { createTheme, CssBaseline, Grid, ThemeProvider } from "@mui/material";

// navigation
import Nav from "./components/navigation/Nav";

// pages
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
      {/* 
        In this Grid container, first row is the appbar navigation fixed on top,
        first column is the permanent drawer (sidebar navigation, when displayed on large screen) on the left,
        the remaining space is for main pages (ammunition, hideout, etc.)
      */}
      <Grid container sx={{ flexGrow: 1, height: "100vh" }}>
        <CssBaseline />
        <ThemeProvider theme={theme}>
          <Nav />
          {/* 
            main pages content goes here, with a padding-top 64px, which is the height of the AppBar component (fixed top nav)
            the left {3} is for drawer side nav, the rest {9} of 12 is for the main pages content
          */}
          <Grid item xs={9} sx={{ paddingTop: "64px" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ammunition" element={<AmmunitionPage />} />
              <Route path="/hideout" element={<HideoutPage />}>
                <Route path=":hideoutId" element={<HideoutCard />} />
              </Route>
              <Route path="/quests" element={<QuestsPage />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </Grid>
        </ThemeProvider>
      </Grid>
    </div>
  );
}

export default App;
