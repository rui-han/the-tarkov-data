"use client";

import { Box, Skeleton } from "@mui/material";

/**
 * Shown by Next.js while a hideout page loads. It renders inside
 * HideoutLayout, whose container is a centred flex column, so it needs an
 * explicit width: without one it shrink-wraps to its content and, because the
 * skeletons are percentage-sized, collapses into a narrow, tall column.
 */
export default function Loading() {
  return (
    <Box sx={{ width: "90%", mx: "auto", pb: 4 }} aria-busy="true">
      {/* title */}
      <Box
        sx={{
          m: "2vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Skeleton variant="circular" width={60} height={60} />
        <Skeleton variant="text" width={220} height={56} />
      </Box>

      {/* level buttons */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" width={96} height={40} />
        ))}
      </Box>

      {/* requirements card */}
      <Skeleton variant="rounded" width="100%" height={360} />
    </Box>
  );
}
