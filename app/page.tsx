"use client";

import { useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Divider,
} from "@mui/material";
import Link from "next/link";
import Icon from "@mdi/react";
import {
  mdiAmmunition,
  mdiHome,
  mdiPackageVariant,
  mdiTooltipCheckOutline,
} from "@mdi/js";

export default function Home() {
  const [feedback, setFeedback] = useState("");

  const features = [
    { icon: mdiAmmunition, title: "AMMUNITION", link: "/ammunition" },
    { icon: mdiHome, title: "HIDEOUT", link: "/hideout" },
    { icon: mdiPackageVariant, title: "ITEMS", link: "/items" },
    { icon: mdiTooltipCheckOutline, title: "QUESTS", link: "/quests" },
  ];

  const latestUpdates = [
    { title: "PVE ZONE is now available for purchase", date: "2024-07-18" },
    { title: "Battlestate Games at TwitchCon Rotterdam", date: "2024-05-31" },
    { title: "Reward for completing in-game event", date: "2024-05-15" },
  ];

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    // 处理反馈提交逻辑
    console.log("Feedback submitted:", feedback);
    setFeedback("");
  };

  return (
    <Box
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
      {/* title */}
      <Box
        sx={{
          height: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: "center", color: "white" }}>
          <Typography variant="h1" component="h1" gutterBottom>
            The Ultimate EFT Data Hub
          </Typography>
          <Typography variant="h4" gutterBottom>
            Get all Tarkov game stats and information in one place
          </Typography>
        </Box>
      </Box>

      {/* main functionalities cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Link
              href={feature.link}
              passHref
              style={{ textDecoration: "none" }}
            >
              <Card
                sx={{
                  height: "100%",
                  p: 6,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    "& .icon": {
                      color: "white",
                      transform: "scale(1.1)",
                    },
                    "& .title": {
                      color: "white",
                    },
                  },
                  cursor: "pointer",
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Icon
                    path={feature.icon}
                    size={4}
                    className="icon"
                    style={{ transition: "all 0.3s ease-in-out" }}
                  />
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{ mt: 4 }}
                    className="title"
                  >
                    {feature.title}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>

      {/* latest updates and community interaction area */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* latest updates */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Latest Updates
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {latestUpdates.map((update, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{update.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {update.date}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* community interaction */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Community Feedback
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <form>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Share your thoughts or suggestions..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" color="inherit">
                  Submit Feedback
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* About */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          About The Tarkov Data
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" paragraph>
          The Tarkov Data is a platform dedicated to providing Escape from
          Tarkov players with the latest and most accurate game data. Our data
          is derived from internal game files, community contributions, and
          detailed game testing.
        </Typography>
        <Typography variant="body1">
          We work hard to keep data up to date, usually within 24 hours of a
          game update. If you find any errors or have any suggestions, please
          feel free to contact us via the feedback form above.
        </Typography>
      </Box>
    </Box>
  );
}
