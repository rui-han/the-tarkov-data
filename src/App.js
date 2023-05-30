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
    <Grid className="App" container sx={{ flexGrow: 1, height: "100vh" }}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Nav />
        {/* 
          main pages content goes here, 
          with a margin-top 64px, which is the height of the fixed top nav;
        */}
        <Grid
          item
          xs={12}
          sx={{ mt: "64px", pt: "5vh", height: "100%", ml: { sm: "240px" } }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/ammunition"
              element={
                <Grid container justifyContent="center">
                  <AmmunitionPage />
                </Grid>
              }
            />
            <Route
              path="/hideout"
              element={
                <Grid container justifyContent="center">
                  <HideoutPage />
                </Grid>
              }
            >
              <Route
                path=":hideoutId"
                element={
                  <Grid container justifyContent="center">
                    <HideoutCard />
                  </Grid>
                }
              />
            </Route>
            <Route
              path="/quests"
              element={
                <Grid container justifyContent="center">
                  <QuestsPage />
                </Grid>
              }
            />
            <Route
              path="*"
              element={
                <Grid container justifyContent="center">
                  <ErrorPage />
                </Grid>
              }
            />
          </Routes>
        </Grid>
      </ThemeProvider>
    </Grid>
  );
}

export default App;
