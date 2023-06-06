"use client";

import HideoutNav from "@/components/hideout/HideoutNav";
import { GET_HIDEOUT_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { FetchedData } from "@/types/hideout";

export const dynamic = "force-dynamic";

export default function Hideout() {
  const { data } = useSuspenseQuery<FetchedData>(GET_HIDEOUT_DATA);

  return (
    <>
      <HideoutNav hideoutStations={data?.hideoutStations} />
    </>
  );
}
