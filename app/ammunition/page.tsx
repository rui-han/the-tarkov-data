"use client";

import { useState } from "react";
import { GET_AMMO_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/client";
import { FetchedData } from "@/types/ammo";
import HowToRead from "@/components/ammunition/HowToRead";
import AmmoTable from "@/components/ammunition/AmmoTable";
import { Box } from "@mui/material";

export default function Ammunition() {
  const { data } = useSuspenseQuery<FetchedData>(GET_AMMO_DATA);
  if (!data) return null;
  // Caliber556x45NATO etc.
  const [currentCaliber, setCurrentCaliber] = useState("");
  const [inputText, setInputText] = useState("");

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <HowToRead />

      <AmmoTable
        ammo={data.ammo}
        inputText={inputText}
        currentCaliber={currentCaliber}
        setCurrentCaliber={setCurrentCaliber}
        setInputText={setInputText}
      />
    </Box>
  );
}
