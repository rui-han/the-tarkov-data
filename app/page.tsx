"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
// MUI
import {
  Grid,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Divider,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
// icons
import Icon from "@mdi/react";
import {
  mdiAmmunition,
  mdiHome,
  mdiPackageVariant,
  mdiTooltipCheckOutline,
} from "@mdi/js";

// for big buttons on the home page
const features = [
  { icon: mdiAmmunition, title: "AMMUNITION", link: "/ammunition" },
  { icon: mdiHome, title: "HIDEOUT", link: "/hideout" },
  { icon: mdiPackageVariant, title: "ITEMS", link: "/items" },
  { icon: mdiTooltipCheckOutline, title: "QUESTS", link: "/quests" },
];
// some hard coded news
const latestUpdates = [
  { title: "PVE ZONE is now available for purchase", date: "2024-07-18" },
  { title: "Battlestate Games at TwitchCon Rotterdam", date: "2024-05-31" },
  { title: "Reward for completing in-game event", date: "2024-05-15" },
];

export default function Home() {
  const theme = useTheme();

  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // handle feedback submission
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // don't need to submit empty feedback
      if (feedback.trim() === "") return;
      console.log("Feedback submitted:", feedback);
      setFeedback("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000); // hide message after 5 seconds
    },
    [feedback],
  );

  // close snackbar
  const handleSnackbarClose = useCallback(() => {
    setSubmitted(false);
  }, []);

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
      {/* Title Section */}
      <Box
        sx={{
          height: "60vh",
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
          <Typography variant="h1" component="h1" gutterBottom>
            The Ultimate EFT Data Hub
          </Typography>
          <Typography variant="h4" gutterBottom>
            Get all Tarkov game stats and information in one place
          </Typography>
        </Box>
      </Box>
      {/* Main Functionalities Cards */}
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
                aria-label={`Navigate to ${feature.title} page`} // Accessibility improvement
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Icon
                    path={feature.icon}
                    size={4}
                    className="icon"
                    style={{ transition: "all 0.3s ease-in-out" }}
                    aria-hidden="true" // skip reading icon path
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
      {/* Latest Updates and Community Interaction Area */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* Latest Updates */}
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
        {/* Community Feedback */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Community Feedback
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Share your thoughts or suggestions..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "white",
                      },
                    },
                  }}
                  aria-label="Feedback input"
                />
                <Button type="submit" variant="contained" color="inherit">
                  Submit Feedback
                </Button>
                <Snackbar
                  open={submitted}
                  autoHideDuration={5000}
                  onClose={handleSnackbarClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                  <Alert
                    onClose={handleSnackbarClose}
                    severity="success"
                    sx={{ width: "100%" }}
                  >
                    Feedback submitted successfully!
                  </Alert>
                </Snackbar>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* About Section */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          padding: 3,
          mb: 6,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              color: theme.palette.text.primary,
              fontWeight: "bold",
            }}
          >
            About The Tarkov Data
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography
            variant="body1"
            paragraph
            sx={{
              color: theme.palette.text.primary,
              fontSize: "1.1rem",
              lineHeight: 1.6,
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
            }}
          >
            The Tarkov Data is a platform dedicated to providing Escape from
            Tarkov players with the latest and most accurate game data. Our data
            is derived from internal game files, community contributions, and
            detailed game testing.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.primary,
              fontSize: "1.1rem",
              lineHeight: 1.6,
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
            }}
          >
            We work hard to keep data up to date, usually within 24 hours of a
            game update. If you find any errors or have any suggestions, please
            feel free to contact us via the feedback form above.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
