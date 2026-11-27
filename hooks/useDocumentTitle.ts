"use client";

import { useEffect } from "react";
import { SITE_NAME } from "@/lib/site";

/**
 * Sets the tab title from data that only exists in the browser (the route's
 * own title is static). Does nothing while `title` is undefined.
 */
export function useDocumentTitle(title: string | undefined): void {
  useEffect(() => {
    if (title) document.title = `${title} | ${SITE_NAME}`;
  }, [title]);
}
