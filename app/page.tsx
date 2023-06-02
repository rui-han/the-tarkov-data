"use client"; // this is temporary...

//navigation
import Nav from "../components/navigation/Nav";
// MUI
import { createTheme, CssBaseline, Grid, ThemeProvider } from "@mui/material";

// dark theme with customization
const theme = createTheme({
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

export default function Home() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Grid container sx={{ flexGrow: 1, height: "100vh" }}>
          <CssBaseline />
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
            <Nav />
            Welcome!
          </Grid>
        </Grid>
      </ThemeProvider>
    </>
  );
}
