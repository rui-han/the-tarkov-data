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

  useEffect(() => {
    setLocalFavorite(isFavorite);
  }, [isFavorite]);

  // optimistic update of the favorite status
  const localFavoriteClick = () => {
    if (user) {
      // update the local state
      setLocalFavorite(!localFavorite);
      // call the parent function to update the favorite status in the database
      handleFavoriteClick(ammoData.item.id);
    } else {
      // do not update the local state if the user is not logged in
      // instead, call the parent function and show PLEASE LOGIN snackbar
      handleFavoriteClick(ammoData.item.id);
    }
  };

  return (
    <TableRow hover>
      {/* the favorite icon */}
      <TableCell>
        <IconButton color="inherit" onClick={() => localFavoriteClick()}>
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
