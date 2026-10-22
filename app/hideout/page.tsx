"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { useHideoutStations } from "@/hooks/useHideoutData";
import { pickDefaultStation } from "@/lib/hideout";

/**
 * /hideout has no content of its own: it forwards to the default station.
 * `replace` keeps the back button working (no extra history entry).
 */
export default function HideoutPage() {
  const router = useRouter();
  const { hideoutStations } = useHideoutStations();
  const targetId = pickDefaultStation(hideoutStations)?.id;

  useEffect(() => {
    if (targetId) router.replace(`/hideout/${targetId}`);
  }, [targetId, router]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <CircularProgress />
    </Box>
  );
}
