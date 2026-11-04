import Link from "next/link";
// MUI
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
// icons
import Icon from "@mdi/react";
import {
  mdiAmmunition,
  mdiHammerWrench,
  mdiHome,
  mdiPackageVariant,
  mdiTooltipCheckOutline,
  mdiTrophy,
} from "@mdi/js";
import { panelSx } from "./styles";

// shortcuts to the data pages
const features = [
  {
    icon: mdiAmmunition,
    title: "Ammunition",
    description: "Damage, penetration and armor damage for every round",
    link: "/ammunition",
  },
  {
    icon: mdiHome,
    title: "Hideout",
    description: "Upgrade requirements and estimated costs per level",
    link: "/hideout",
  },
  {
    icon: mdiHammerWrench,
    title: "Crafts",
    description: "Every recipe with profit per hour estimates",
    link: "/crafts",
  },
  {
    icon: mdiPackageVariant,
    title: "Items",
    description: "Flea prices, 48h changes and trader sell prices",
    link: "/items",
  },
  {
    icon: mdiTooltipCheckOutline,
    title: "Tasks",
    description: "Objectives, requirements and rewards for every task",
    link: "/tasks",
  },
  {
    icon: mdiTrophy,
    title: "Achievements",
    description: "Rarity and how many players have earned each one",
    link: "/achievements",
  },
];

export default function FeatureCard() {
  return (
    <Grid container spacing={3} sx={{ mb: 6 }}>
      {features.map((feature) => (
        <Grid item xs={12} sm={6} md={4} key={feature.link}>
          <Link
            href={feature.link}
            style={{ textDecoration: "none", display: "block", height: "100%" }}
          >
            <Card
              elevation={0}
              sx={{
                ...panelSx,
                height: "100%",
                transition: "transform 0.2s, border-color 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  borderColor: "primary.main",
                  "& .icon": { color: "primary.light" },
                },
              }}
            >
              <CardContent
                sx={{ display: "flex", alignItems: "center", gap: 2.5, p: 3 }}
              >
                <Box
                  className="icon"
                  sx={{
                    color: "primary.main",
                    display: "flex",
                    transition: "color 0.2s",
                  }}
                >
                  <Icon path={feature.icon} size={2} aria-hidden="true" />
                </Box>
                <Box>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
}