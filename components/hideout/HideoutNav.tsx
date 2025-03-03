import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumbs, Tooltip, Box, Typography } from "@mui/material";
import { FetchedData } from "@/types/hideout";

export default function HideoutNav({ hideoutStations }: FetchedData) {
  const currentRoute = usePathname(); // returns "/dashboard" on /dashboard?foo=bar

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
    <>
      <Breadcrumbs maxItems={30} sx={{ width: "90%", marginTop: "3vh" }}>
        {hideoutStations.map((data) => (
          <Link
            key={data.id}
            href={`/hideout/${data.id}`}
            style={{
              color: "inherit",
              textDecoration: "inherit",
              margin: "4px",
            }}
          >
            <Tooltip title={data.name} arrow>
              <Image
                src={`/icons/hideout-icons/${data.normalizedName}-icon.png`}
                width={64}
                height={64}
                alt={data.name}
                style={{
                  backgroundColor:
                    // get hideout id from route
                    currentRoute.split("/").pop() === data.id
                      ? "rgba(219, 223, 234, 0.2)"
                      : "",
                  borderRadius: 5,
                  transition: "transform 0.8s, background-color 0.8s",
                }}
              />
            </Tooltip>
          </Link>
        ))}
      </Breadcrumbs>
    </>
  );
}
