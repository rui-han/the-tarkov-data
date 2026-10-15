"use client";

import { useState } from "react";
import { Box } from "@mui/material";

interface FallbackImageProps {
  /** tried in order; falsy entries are skipped */
  sources: Array<string | null | undefined>;
  alt: string;
  size: number;
  radius?: number;
}

export default function FallbackImage({
  sources,
  alt,
  size,
  radius = 4,
}: FallbackImageProps) {
  const candidates = sources.filter((s): s is string => Boolean(s));
  const [index, setIndex] = useState(0);
  const src = candidates[index];

  if (!src) {
    return (
      <Box
        aria-hidden
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: `${radius}px`,
          bgcolor: "action.hover",
        }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setIndex((i) => i + 1)}
      style={{ objectFit: "contain", borderRadius: radius, flexShrink: 0 }}
    />
  );
}
