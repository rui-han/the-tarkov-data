import { useState, useEffect } from "react";
import { getAmmoPropertyColor } from "@/utils/ammo-utils";
import FallbackImage from "@/components/hideout/FallbackImage";
import { formatPrice } from "@/lib/hideout";
import {
  Box,
  Chip,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { AmmoTableRowProps } from "@/types/ammo";
// icons
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

export default function AmmoTableRow({
  ammoData,
  isFavorite,
  handleFavoriteClick,
  user,
}: AmmoTableRowProps) {
  // local state tracking of favorite status
  const [localFavorite, setLocalFavorite] = useState(isFavorite);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setLocalFavorite(isFavorite);
  }, [isFavorite]);

  // optimistic update of the favorite status, rolled back if the request fails
  const localFavoriteClick = async () => {
    if (pending) return;

    if (!user) {
      // not logged in: don't touch local state, the parent shows the
      // "please log in" snackbar
      await handleFavoriteClick(ammoData.item.id);
      return;
    }

    const previous = localFavorite;
    setLocalFavorite(!previous);
    setPending(true);
    try {
      const ok = await handleFavoriteClick(ammoData.item.id);
      if (!ok) setLocalFavorite(previous); // roll back
    } finally {
      setPending(false);
    }
  };

  const armorClassTip =
    ammoData.armorClass === 0
      ? `Penetration ${ammoData.penetrationPower} is below class 1 (10). A rule of thumb, not a penetration chance.`
      : `Penetration ${ammoData.penetrationPower} roughly matches class ${ammoData.armorClass} (${ammoData.armorClass} x 10). A rule of thumb, not a penetration chance.`;

  return (
    <TableRow hover>
      {/* the favorite icon */}
      <TableCell>
        <IconButton
          color="inherit"
          disabled={pending}
          aria-pressed={localFavorite}
          aria-label={
            localFavorite ? "Remove from favorites" : "Add to favorites"
          }
          onClick={localFavoriteClick}
        >
          {localFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </TableCell>
      {/* name */}
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <FallbackImage
            key={ammoData.iconLink || "none"}
            sources={[ammoData.iconLink]}
            alt=""
            size={40}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              noWrap
              title={ammoData.item.name}
              sx={{ fontWeight: 600, maxWidth: 260 }}
            >
              {ammoData.item.name}
            </Typography>
            {ammoData.shortName &&
              ammoData.shortName !== ammoData.item.name && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  {ammoData.shortName}
                </Typography>
              )}
          </Box>
        </Box>
      </TableCell>
      {/* damage */}
      <TableCell align="center">
        {ammoData.projectileCount > 1
          ? ammoData.projectileCount + " x " + ammoData.damage
          : ammoData.damage}
      </TableCell>
      {/* penetration power */}
      <TableCell align="center">{ammoData.penetrationPower}</TableCell>
      {/* armor class reference */}
      <TableCell align="center">
        <Tooltip title={armorClassTip}>
          <Chip
            size="small"
            variant="outlined"
            label={
              ammoData.armorClass === 0 ? "<1" : `Class ${ammoData.armorClass}`
            }
          />
        </Tooltip>
      </TableCell>
      {/* armor damage */}
      <TableCell align="center">{ammoData.armorDamage}</TableCell>
      {/* accuracy */}
      <TableCell
        align="center"
        sx={{
          color: getAmmoPropertyColor(ammoData.accuracyModifier, "accuracy"),
          fontWeight: "bold",
        }}
      >
        {ammoData.accuracyModifier}
      </TableCell>
      {/* recoil */}
      <TableCell
        align="center"
        sx={{
          color: getAmmoPropertyColor(ammoData.recoilModifier, "recoil"),
          fontWeight: "bold",
        }}
      >
        {ammoData.recoilModifier}
      </TableCell>
      {/* flea price of one round */}
      <TableCell align="right">{formatPrice(ammoData.fleaPrice)}</TableCell>
    </TableRow>
  );
}
