"use client";

import About from "@/components/home/About";
import CommunityFeedback from "@/components/home/CommunityFeedback";
import FeatureCard from "@/components/home/FeatureCard";
import Hero from "@/components/home/Hero";
import MarketMovers from "@/components/home/MarketMovers";
import StatusCard from "@/components/home/StatusCard";
import WatchlistCta from "@/components/home/WatchlistCta";
// MUI
import { Box, Grid } from "@mui/material";

export default function Home() {
  return (
    // TopLevelLayout already renders the <main>, so this is a plain wrapper
    <Box
      sx={{
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        minHeight: "100vh",
        px: { xs: 2, sm: 4 },
        py: { xs: 3, sm: 4 },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "-10px", // hides the soft edge the blur leaves
          // dark gradient on top of the image keeps the text readable
          backgroundImage:
            "linear-gradient(rgba(29, 29, 31, 0.6), rgba(29, 29, 31, 0.92)), url('/images/landing-page-background-2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px)",
          zIndex: -1,
        },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Hero />
        <FeatureCard />

        {/* live data */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <StatusCard />
          </Grid>
          <Grid item xs={12} md={8}>
            <MarketMovers />
          </Grid>
        </Grid>

        <WatchlistCta />
        <CommunityFeedback />
        <About />
      </Box>
    </Box>
  );
}
