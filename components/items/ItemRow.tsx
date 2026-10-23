"use client";

import React from "react";
import FallbackImage from "@/components/hideout/FallbackImage";
import { formatChange } from "@/lib/items";
import { formatPrice } from "@/lib/hideout";
import type { Item } from "@/types/item";
import {
  Chip,
  IconButton,
  Link as MuiLink,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

export interface ItemRowProps {
  item: Item;
  traderName?: string;
  isFavorite: boolean;
  /** a favorite request for this item is in flight */
  favoritePending: boolean;
  /** must be referentially stable, rows are memoized */
  onToggleFavorite: (itemId: string) => void;
}

const ItemRow = React.memo(function ItemRow({
  item,
  traderName,
  isFavorite,
  favoritePending,
  onToggleFavorite,
}: ItemRowProps) {
  const change = item.changeLast48hPercent;

  return (
    <TableRow hover>
      <TableCell sx={{ width: 48, p: 0.5 }}>
        <IconButton
          color="inherit"
          size="small"
          disabled={favoritePending}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          onClick={() => onToggleFavorite(item.id)}
        >
          {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </TableCell>

      <TableCell sx={{ width: 80, p: 1 }}>
        <FallbackImage
          key={item.iconLink ?? "none"}
          sources={[item.iconLink, item.gridImageLink]}
          alt={item.name}
          size={56}
        />
      </TableCell>

      <TableCell>
        {item.wikiLink ? (
          <MuiLink
            href={item.wikiLink}
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="hover"
            sx={{ fontWeight: 600 }}
          >
            {item.name}
          </MuiLink>
        ) : (
          <Typography component="span" sx={{ fontWeight: 600 }}>
            {item.name}
          </Typography>
        )}
        {item.shortName && item.shortName !== item.name && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            {item.shortName}
          </Typography>
        )}
      </TableCell>

      <TableCell>
        <Chip label={item.category} size="small" variant="outlined" />
      </TableCell>

      <TableCell align="right">
        {item.weight != null ? `${item.weight.toFixed(2)} kg` : "—"}
      </TableCell>

      <TableCell align="right">
        {item.lastLowPrice != null ? (
          <Tooltip
            title={
              item.avg24hPrice != null
                ? `24h average: ${formatPrice(item.avg24hPrice)}`
                : ""
            }
          >
            <span>{formatPrice(item.lastLowPrice)}</span>
          </Tooltip>
        ) : item.noFlea ? (
          <Chip label="No flea" size="small" variant="outlined" />
        ) : (
          "N/A"
        )}
      </TableCell>

      <TableCell
        align="right"
        sx={{
          color:
            change == null || change === 0
              ? "text.secondary"
              : change > 0
              ? "success.main"
              : "error.main",
        }}
      >
        {item.lastLowPrice != null ? formatChange(change) : "—"}
      </TableCell>

      <TableCell align="right">
        {item.bestSell ? (
          <>
            {formatPrice(item.bestSell.price)}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              {traderName ?? "…"}
            </Typography>
          </>
        ) : (
          "—"
        )}
      </TableCell>
    </TableRow>
  );
});

export default ItemRow;
