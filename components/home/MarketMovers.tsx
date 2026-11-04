"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useGameMode } from "@/contexts/GameModeContext";
import { useItems } from "@/hooks/useItems";
import FallbackImage from "@/components/hideout/FallbackImage";
import { formatPrice } from "@/lib/hideout";
import { formatChange, pickMovers } from "@/lib/items";
import { GAME_MODE_LABELS } from "@/lib/tarkovApi";
import type { Item } from "@/types/item";
import { Box, Button, Paper, Skeleton, Typography } from "@mui/material";
import { panelSx } from "./styles";

function MoverRow({ item }: { item: Item }) {
  const change = item.changeLast48hPercent ?? 0;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.75 }}>
      <FallbackImage
        key={item.iconLink ?? "none"}
        sources={[item.iconLink, item.gridImageLink]}
        alt=""
        size={36}
      />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          noWrap
          title={item.name}
          sx={{ fontWeight: 600 }}
        >
          {item.shortName || item.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatPrice(item.lastLowPrice)}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: change > 0 ? "success.main" : "error.main",
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {formatChange(item.changeLast48hPercent)}
      </Typography>
    </Box>
  );
}

function MoverColumn({
  title,
  color,
  items,
}: {
  title: string;
  color: string;
  items: Item[];
}) {
  return (
    <Box>
      <Typography
        variant="overline"
        sx={{ color, display: "block", lineHeight: 1.8 }}
      >
        {title}
      </Typography>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nothing to show.
        </Typography>
      ) : (
        items.map((item) => <MoverRow key={item.id} item={item} />)
      )}
    </Box>
  );
}

/** Mounted only once the panel is visible, so `items` isn't downloaded early. */
function MoversContent() {
  const { items, error, isLoading } = useItems();
  const movers = useMemo(() => pickMovers(items), [items]);

  if (error) {
    return (
      <Typography variant="body2" color="text.secondary">
        Market data could not be loaded.
      </Typography>
    );
  }
  if (isLoading) return <Skeleton variant="rounded" height={260} />;

  return (
    <Box
      sx={{
        display: "grid",
        gap: 3,
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
      }}
    >
      <MoverColumn title="Rising" color="success.main" items={movers.rising} />
      <MoverColumn title="Falling" color="error.main" items={movers.falling} />
    </Box>
  );
}

export default function MarketMovers() {
  const { gameMode, isReady } = useGameMode();
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // very old browsers: just load
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Paper ref={ref} elevation={0} sx={{ ...panelSx, p: 3, height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
          Market movers (48h)
        </Typography>
        {isReady && (
          <Typography variant="caption" color="text.secondary">
            {GAME_MODE_LABELS[gameMode].full} flea market
          </Typography>
        )}
      </Box>

      {visible ? (
        <MoversContent />
      ) : (
        <Skeleton variant="rounded" height={260} />
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 2, mb: 1 }}
      >
        Biggest flea price changes over the last 48 hours. Cheap or thinly
        traded items are ignored because they swing wildly.
      </Typography>
      <Link href="/items" style={{ textDecoration: "none" }}>
        <Button size="small" color="inherit" variant="outlined">
          Browse all items
        </Button>
      </Link>
    </Paper>
  );
}
