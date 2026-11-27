"use client";

import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";

const links = [
  { href: "/", label: "Home" },
  { href: "/items", label: "Items" },
  { href: "/tasks", label: "Tasks" },
  { href: "/hideout", label: "Hideout" },
  { href: "/ammunition", label: "Ammunition" },
];

export default function NotFound() {
  return (
    <Box sx={{ p: 4, mt: 8, maxWidth: 560, mx: "auto", textAlign: "center" }}>
      <Typography variant="h2" component="h1" sx={{ fontWeight: 700 }}>
        404
      </Typography>
      <Typography variant="h6" sx={{ mt: 1 }}>
        This page could not be found
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        The link may be outdated, or this page does not exist.
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "center",
        }}
      >
        {links.map(({ href, label }) => (
          <Button
            key={href}
            component={Link}
            href={href}
            variant={href === "/" ? "contained" : "outlined"}
            color={href === "/" ? "primary" : "inherit"}
          >
            {label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
