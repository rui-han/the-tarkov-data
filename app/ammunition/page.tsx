"use client";

import { useState } from "react";
import { GET_AMMO_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { FetchedData } from "@/types/ammo";
import AmmoTable from "@/components/ammunition/AmmoTable";

export default function Ammunition() {
  const { data } = useSuspenseQuery<FetchedData>(GET_AMMO_DATA);
  if (!data) return null;
  // Caliber556x45NATO etc.
  const calibers = [...new Set(data.ammo.map((ammo) => ammo.caliber))];
  const [currentCaliber, setCurrentCaliber] = useState(calibers[0]);

  return (
    <>
      {/* <AmmunitionSearchBar /> */}
      {/* How to read */}
      {/* Bullet effectiveness against armor class */}
      <AmmoTable
        ammo={data.ammo}
        currentCaliber={currentCaliber}
        setCurrentCaliber={setCurrentCaliber}
      />
    </>
  );
}
