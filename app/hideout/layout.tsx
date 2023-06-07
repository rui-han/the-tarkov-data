"use client";

import { GET_HIDEOUT_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import { FetchedData } from "@/types/hideout";

import HideoutNav from "@/components/hideout/HideoutNav";

export default function HideoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data } = useSuspenseQuery<FetchedData>(GET_HIDEOUT_DATA);

  return (
    <>
      <HideoutNav hideoutStations={data.hideoutStations} />
      {children}
    </>
  );
}
