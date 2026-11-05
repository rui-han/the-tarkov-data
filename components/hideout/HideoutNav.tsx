import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { FetchedData } from "@/types/hideout";
import FallbackImage from "./FallbackImage";

export default function HideoutNav({ hideoutStations }: FetchedData) {
  const currentRoute = usePathname(); // e.g. "/hideout/6377a9b9a93bde8fa30eb79a"
  const activeId = currentRoute?.split("/").pop();

  // No hideout stations found after filtering
  if (hideoutStations.length === 0) {
    return (
      <Box sx={{ width: "90%", marginTop: "3vh", textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No hideouts found. Try a different search term.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="nav"
      aria-label="Hideout stations"
      sx={{
        width: "90%",
        mt: "3vh",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 1,
      }}
    >
      {hideoutStations.map((station) => (
        <Box
          key={station.id}
          component={Link}
          href={`/hideout/${station.id}`}
          title={station.name}
          aria-current={activeId === station.id ? "page" : undefined}
          sx={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            width: 88,
            p: 0.75,
            borderRadius: "5px",
            color: "inherit",
            textDecoration: "none",
            bgcolor:
              activeId === station.id
                ? "rgba(219, 223, 234, 0.2)"
                : "transparent",
            transition: "background-color 0.3s",
            "&:hover": { bgcolor: "rgba(219, 223, 234, 0.12)" },
          }}
        >
          <FallbackImage
            sources={[
              `/icons/hideout-icons/${station.normalizedName}-icon.png`,
              station.imageLink,
            ]}
            alt=""
            size={56}
            radius={5}
          />
          {/* touch screens have no hover, so the name is always visible */}
          <Typography
            variant="caption"
            noWrap
            sx={{ maxWidth: "100%", mt: 0.5, lineHeight: 1.2, fontSize: 11 }}
          >
            {station.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
