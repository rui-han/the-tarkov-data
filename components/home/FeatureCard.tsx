import Link from "next/link";
// MUI
import { Grid, Card, CardContent, Typography } from "@mui/material";
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

export default function FeatureCard() {
  return (      <Grid container spacing={4} sx={{ mb: 6 }}>
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
  </Grid>)
}