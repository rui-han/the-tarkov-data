import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Tooltip, Typography } from "@mui/material";
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
        <Tooltip key={station.id} title={station.name} arrow>
          <Box
            component={Link}
            href={`/hideout/${station.id}`}
            aria-current={activeId === station.id ? "page" : undefined}
            sx={{
              display: "inline-flex",
              p: 0.5,
              borderRadius: "5px",
              color: "inherit",
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
              alt={station.name}
              size={64}
              radius={5}
            />
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
}
