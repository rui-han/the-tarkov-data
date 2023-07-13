"use client";

import Nav from "@/components/navigation/Nav";
import { darkTheme } from "./theme";
import { CssBaseline, ThemeProvider, Grid, Box } from "@mui/material";
import { Auth0Provider } from "@auth0/auth0-react";

export default function TopLevelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: "http://localhost:3000",
      }}
    >
      <ThemeProvider theme={darkTheme}>
        <Nav />
        <Grid container sx={{ flexGrow: 1, height: "100vh" }}>
          <CssBaseline />
          <Nav />
          <Grid
            item
            xs={12}
            sx={{
              mt: "64px",
              height: "100%",
              ml: { sm: "240px" }, // for small screen devices, margin left is 0
            }}
          >
            <Box display="flex" flexDirection="column" alignItems="center">
              {children}
            </Box>
          </Grid>
        </Grid>
      </ThemeProvider>
    </Auth0Provider>
  );
}
