import { Ammo, AmmoTableHeadProps, HeadCell } from "@/types/ammo";
import {
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Box,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";

// table head content
const headCells: readonly HeadCell[] = [
  {
    id: "item",
    label: "Name",
  },
  {
    id: "damage",
    label: "Damage",
  },
  {
    id: "penetrationPower",
    label: "Penatration",
  },
  {
    id: "armorDamage",
    label: "Armor Damage",
  },
  {
    id: "accuracyModifier",
    label: "Accuracy",
  },
  {
    id: "recoilModifier",
    label: "Recoil",
  },
];

export default function AmmoTableHead(props: AmmoTableHeadProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof Ammo) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {/* dummy table head cell for favorite button */}
        <TableCell sx={{ backgroundColor: "#1a120b" }}></TableCell>
        {headCells.map((headCell) => (
          <TableCell
            sx={{
              fontSize: 16,
              fontWeight: "bold",
              backgroundColor: "#1a120b",
            }}
            align={headCell.label === "Name" ? "left" : "center"}
            key={headCell.id}
            sortDirection={orderBy == headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy == headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                // sorting arrow indicator
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
