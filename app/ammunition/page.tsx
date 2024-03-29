"use client";

import { useState } from "react";
import { GET_AMMO_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { FetchedData } from "@/types/ammo";
import HowToRead from "@/components/ammunition/HowToRead";
import AmmoTable from "@/components/ammunition/AmmoTable";
import AmmoSearchbar from "@/components/ammunition/AmmoSearchbar";

export default function Ammunition() {
  const { data } = useSuspenseQuery<FetchedData>(GET_AMMO_DATA);
  if (!data) return null;
  // Caliber556x45NATO etc.
  const [currentCaliber, setCurrentCaliber] = useState("");
  const [inputText, setInputText] = useState("");

  return (
    <>
      <HowToRead />
      <AmmoSearchbar setInputText={setInputText} />
      <AmmoTable
        ammo={data.ammo}
        inputText={inputText}
        currentCaliber={currentCaliber}
        setCurrentCaliber={setCurrentCaliber}
      />
    </>
  );
}
