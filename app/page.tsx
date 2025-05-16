"use client";

import About from "@/components/home/About";
import CommunityFeedback from "@/components/home/CommunityFeedback";
// components
import FeatureCard from "@/components/home/FeatureCard";
// MUI
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function Home() {
  const theme = useTheme();

  return (
    <Box
      component="main"
      sx={{
        width: "100%",
        minHeight: "100vh",
        padding: 4,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url('/images/landing-page-background-2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px)",
          zIndex: -1,
        },
      }}
    >
      {/* Title Section */}
      <Box
        sx={{
          height: "35vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            color: theme.palette.text.primary,
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
          }}
        >
          <Typography
            sx={{ fontSize: { xs: "2.5rem", md: "3.75rem" } }}
            gutterBottom
          >
            The Ultimate EFT Data Hub
          </Typography>
          <Typography
            sx={{ fontSize: { xs: "1rem", md: "2rem" } }}
            gutterBottom
          >
            Get all Tarkov game stats and information in one place
          </Typography>
        </Box>
      </Box>
      {/* Main Functionalities Cards */}
      <FeatureCard />
      {/* Community Interaction Area */}
      <CommunityFeedback />
      {/* About Section */}
      <About theme={theme} />
    </Box>
  );
}
