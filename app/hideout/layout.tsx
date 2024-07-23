"use client";

import { GET_HIDEOUT_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/client";
import { FetchedData } from "@/types/hideout";
import HideoutNav from "@/components/hideout/HideoutNav";
// MUI
import { Box, Divider } from "@mui/material";
import HideoutFlowchartModal from "@/components/hideout/HideoutFlowchartModal";

export default function HideoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data } = useSuspenseQuery<FetchedData>(GET_HIDEOUT_DATA);
  if (!data) return null;

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <HideoutNav hideoutStations={data.hideoutStations} />
      <HideoutFlowchartModal />
      {/* the width of the Divider matches that of the hideout navbar Breadcrumbs, which is 90% */}
      <Divider sx={{ color: "white", width: "90%" }} />
      {children}
    </Box>
  );
}
