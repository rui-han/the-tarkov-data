import { useState, useEffect } from "react";
import { getAmmoPropertyColor } from "@/utils/ammo-utils";
import { Box, IconButton, TableCell, TableRow } from "@mui/material";
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

  return (
    <TableRow hover>
      {/* the favorite icon */}
      <TableCell>
        <IconButton
          color="inherit"
          disabled={pending}
          onClick={localFavoriteClick}
        >
          {localFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </TableCell>
      {/* name */}
      <TableCell>
        <Box
          component="div"
          sx={{
            width: 300,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {ammoData.item.name}
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
    </TableRow>
  );
}
