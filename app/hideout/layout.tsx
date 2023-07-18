"use client";

import { GET_HIDEOUT_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { FetchedData } from "@/types/hideout";
import HideoutNav from "@/components/hideout/HideoutNav";
import Image from "next/image";
import HideoutFlowchart from "../../public/images/hideout-flowchart.jpeg";

export default function HideoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data } = useSuspenseQuery<FetchedData>(GET_HIDEOUT_DATA);

  if (!data) return null;

  return (
    <>
      <HideoutNav hideoutStations={data.hideoutStations} />
      <Image
        src={HideoutFlowchart}
        alt=""
        style={{ width: "95%", height: "auto", marginTop: "3.5vh" }}
      />
      {children}
    </>
  );
}
