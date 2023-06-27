"use client";

import { GET_AMMO_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { FetchedData } from "@/types/ammo";
import AmmoTable from "@/components/ammunition/AmmoTable";

export default function Ammunition() {
  const { data } = useSuspenseQuery<FetchedData>(GET_AMMO_DATA);

  return (
    <>
      {/* <AmmunitionSearchBar /> */}
      {/* How to read */}
      {/* Bullet effectiveness against armor class */}
      <AmmoTable ammo={data.ammo} />
    </>
  );
}
