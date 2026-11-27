"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Box, Button, Paper, Typography } from "@mui/material";
import { panelSx } from "./styles";

/** Points visitors to the dashboard: log in, or open it when already in. */
export default function WatchlistCta() {
  const { user, isLoading } = useUser();

  return (
    <Paper
      elevation={0}
      sx={{
        ...panelSx,
        p: 3,
        mb: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
          {user
            ? `Welcome back, ${user.name}`
            : "Track the items you care about"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user
            ? "Open your dashboard to see your watchlist and favorite ammo."
            : "Log in to favorite items and ammo and follow their flea prices on your dashboard."}
        </Typography>
      </Box>

      {!isLoading &&
        (user ? (
          <Button component={Link} href="/dashboard" variant="contained">
            Open dashboard
          </Button>
        ) : (
          // API route, not a page: MUI renders a plain anchor for `href`
          <Button href="/api/auth/login" variant="contained">
            Log in
          </Button>
        ))}
    </Paper>
  );
}
