import {
  Box,
  Chip,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import type { HideoutItem, ItemRequirement } from "@/types/hideout";
import { formatPrice, levelCost, unitPrice } from "@/lib/hideout";
import FallbackImage from "./FallbackImage";

interface ItemRequirementsTableProps {
  requirements: ItemRequirement[];
  itemsById: ReadonlyMap<string, HideoutItem>;
  /** items payload still downloading */
  itemsLoading: boolean;
}

export default function ItemRequirementsTable({
  requirements,
  itemsById,
  itemsLoading,
}: ItemRequirementsTableProps) {
  if (requirements.length === 0) {
    return (
      <Typography sx={{ my: 2, textAlign: "center" }}>
        No items required for this level.
      </Typography>
    );
  }

  const { total, missing } = levelCost(requirements, itemsById);

  return (
    <>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderColor: "primary.main" }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Unit price</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requirements.map((req) => {
              const item = itemsById.get(req.itemId);
              const price = unitPrice(item, req.itemId);

              return (
                <TableRow key={req.id} hover>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <FallbackImage
                        key={item?.iconLink ?? "none"}
                        sources={[item?.iconLink]}
                        alt={item?.name ?? ""}
                        size={56}
                      />
                      {itemsLoading ? (
                        <Skeleton width={140} />
                      ) : (
                        <Typography variant="body2" title={req.itemId}>
                          {item?.name ?? "Unknown item"}
                        </Typography>
                      )}
                      {req.foundInRaid && (
                        <Tooltip title="Must be found in raid">
                          <Chip
                            label="FIR"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">× {req.count}</TableCell>
                  <TableCell align="right">
                    {itemsLoading ? (
                      <Skeleton width={70} sx={{ ml: "auto" }} />
                    ) : (
                      formatPrice(price)
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {itemsLoading ? (
                      <Skeleton width={70} sx={{ ml: "auto" }} />
                    ) : (
                      formatPrice(price == null ? null : price * req.count)
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            <TableRow>
              <TableCell colSpan={3} align="right" sx={{ fontWeight: "bold" }}>
                Estimated total
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                {itemsLoading ? (
                  <Skeleton width={80} sx={{ ml: "auto" }} />
                ) : (
                  formatPrice(total)
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 1 }}
      >
        Prices are flea market estimates (24h low, falling back to the 24h
        average).
        {!itemsLoading && missing > 0
          ? ` ${missing} item${missing > 1 ? "s" : ""} without a price ${
              missing > 1 ? "are" : "is"
            } not included in the total.`
          : ""}
      </Typography>
    </>
  );
}
