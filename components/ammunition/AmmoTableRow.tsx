import { getAmmoPropertyColor } from "@/utils/ammo-utils";
import { Box, IconButton, TableCell, TableRow } from "@mui/material";
import { AmmoTableRowProps } from "@/types/ammo";
// icons
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

export default function AmmoTableRow({
  ammoData,
  isFavorite,
  onFavoriteClick,
}: AmmoTableRowProps) {
  return (
    <TableRow hover>
      {/* the favorite icon */}
      <TableCell>
        <IconButton
          color="inherit"
          onClick={() => onFavoriteClick(ammoData.item.id)}
        >
          {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
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
