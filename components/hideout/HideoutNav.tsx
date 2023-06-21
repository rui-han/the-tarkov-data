import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs, Tooltip } from "@mui/material";
import { FetchedData } from "@/types/hideout";

export default function HideoutNav({ hideoutStations }: FetchedData) {
  return (
    <>
      <Breadcrumbs maxItems={30} sx={{ width: "75%", marginTop: "3vh" }}>
        {hideoutStations.map((data) => (
          <Link
            key={data.id}
            href={`/hideout/${data.id}`}
            style={{ color: "inherit", textDecoration: "inherit" }}
          >
            <Tooltip title={data.name} arrow>
              <Image
                src={`/icons/hideout-icons/${data.normalizedName}-icon.png`}
                width={64}
                height={64}
                alt={data.name}
              />
            </Tooltip>
          </Link>
        ))}
      </Breadcrumbs>
    </>
  );
}
