"use client";

import { useEffect } from "react";
import { Alert, Button } from "@mui/material";
import { retryStaleRequests, useStaleData } from "@/hooks/useStaleData";

const RETRY_MS = 2 * 60 * 1000;

function formatSavedAt(savedAt: number | null): string {
  if (savedAt == null) return "an earlier visit";
  return new Date(savedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Shown while json.tarkov.dev can't be reached and pages are running on the
 * copy saved in this browser. Keeps retrying by itself; disappears once fresh
 * data arrives.
 */
export default function StaleDataBanner() {
  const { count, savedAt } = useStaleData();
  const isStale = count > 0;

  useEffect(() => {
    if (!isStale) return;

    const retry = () => void retryStaleRequests();
    const timer = setInterval(retry, RETRY_MS);
    window.addEventListener("online", retry);

    return () => {
      clearInterval(timer);
      window.removeEventListener("online", retry);
    };
  }, [isStale]);

  if (!isStale) return null;

  return (
    <Alert
      severity="warning"
      sx={{ borderRadius: 0 }}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={() => void retryStaleRequests()}
        >
          Retry now
        </Button>
      }
    >
      The data source (tarkov.dev) is not reachable right now. Showing a copy
      saved on {formatSavedAt(savedAt)}, so prices and other data may be out of
      date. We keep retrying automatically.
    </Alert>
  );
}
