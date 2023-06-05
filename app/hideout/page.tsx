"use client";

import HideoutNav from "@/components/hideout/HideoutNav";
import { GET_HIDEOUT_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

export const dynamic = "force-dynamic";

export default function Hideout() {
  const { data } = useSuspenseQuery(GET_HIDEOUT_DATA);
  const hideoutData = data.hideoutStations;
  return (
    <>
      <HideoutNav hideoutData={hideoutData} />
    </>
  );
}
