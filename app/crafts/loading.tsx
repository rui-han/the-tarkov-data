"use client";

import GenericPageSkeleton from "@/components/skeleton/GenericPageSkeleton";
import { Box } from "@mui/material";

/**
 * This file is automatically used by Next.js App Router
 * during route transitions and initial data loading.
 */
export default function Loading() {
  return (
    <Box padding={5}>
      <GenericPageSkeleton />
    </Box>
  );
}
