import React from "react";
import { Route, Routes } from "react-router-dom";

import "./App.css";
import { Box } from "@mui/system";

import Nav from "./components/Nav";
import AmmunitionPage from "./components/pages/AmmunitionPage";
import HideoutPage from "./components/pages/HideoutPage";

function App() {
  return (
    <div className="App">
      <Nav />
      <Box component="main" sx={{ marginTop: "10vh" }}>
        <Routes>
          <Route path="/" element={<AmmunitionPage />} />
          <Route path="/hideout" element={<HideoutPage />} />
        </Routes>
      </Box>
    </div>
  );
}

export default App;
