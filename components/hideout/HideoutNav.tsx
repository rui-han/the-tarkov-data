import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumbs, Tooltip } from "@mui/material";
import { FetchedData } from "@/types/hideout";

export default function HideoutNav({ hideoutStations }: FetchedData) {
  const currentRoute = usePathname(); // returns "/dashboard" on /dashboard?foo=bar

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
                }}
              />
            </Tooltip>
          </Link>
        ))}
      </Breadcrumbs>
    </>
  );
}
