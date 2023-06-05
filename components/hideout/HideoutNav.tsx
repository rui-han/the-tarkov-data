import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs, Tooltip } from "@mui/material";

import HideoutFlowchart from "../../public/images/hideout-flowchart.jpeg";

export default function HideoutNav({ hideoutData }) {
  return (
    <>
      <Breadcrumbs maxItems={30} sx={{ width: "75%" }}>
        {hideoutData.map((data) => (
          <Link
            key={data.id}
            href={data.id}
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
      <Image
        src={HideoutFlowchart}
        alt=""
        style={{ width: "95%", height: "auto" }}
      />
    </>
  );
}
