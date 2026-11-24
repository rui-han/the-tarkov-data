import { useMemo } from "react";
import { Box, Chip, Typography } from "@mui/material";
import { caliberLabel } from "@/lib/ammo";
import type { Ammo, AmmoTableFilterProps } from "@/types/ammo";

/** Distinct calibers, sorted; calibers without a label are skipped. */
function listCalibers(rounds: Ammo[]): string[] {
  const calibers = new Set<string>();
  for (const round of rounds) {
    if (caliberLabel(round.caliber).trim()) calibers.add(round.caliber);
  }
  return [...calibers].sort((a, b) =>
    caliberLabel(a).localeCompare(caliberLabel(b), undefined, {
      numeric: true,
    }),
  );
}

const AmmoTableFilter = ({
  ammo,
  currentCaliber,
  onFilterButtonClick,
}: AmmoTableFilterProps) => {
  // everything that isn't a plain bullet goes in the second group, so an
  // ammo type we don't know about still gets its filter button
  const { bullets, others } = useMemo(
    () => ({
      bullets: listCalibers(ammo.filter((a) => a.ammoType === "bullet")),
      others: listCalibers(ammo.filter((a) => a.ammoType !== "bullet")),
    }),
    [ammo],
  );

  // clicking the selected caliber again clears the filter; the same rule
  // applies to every group
  const toggle = (caliber: string) =>
    onFilterButtonClick(caliber === currentCaliber ? "" : caliber);

  const renderGroup = (title: string, calibers: string[]) =>
    calibers.length === 0 ? null : (
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ display: "block", lineHeight: 1.8 }}
        >
          {title}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {calibers.map((caliber) => {
            const selected = caliber === currentCaliber;
            return (
              <Chip
                key={caliber}
                label={caliberLabel(caliber)}
                size="small"
                clickable
                color={selected ? "primary" : "default"}
                variant={selected ? "filled" : "outlined"}
                aria-pressed={selected}
                onClick={() => toggle(caliber)}
              />
            );
          })}
        </Box>
      </Box>
    );

  return (
    <Box sx={{ mt: 2 }}>
      <Chip
        label="All calibers"
        size="small"
        clickable
        color={currentCaliber === "" ? "primary" : "default"}
        variant={currentCaliber === "" ? "filled" : "outlined"}
        aria-pressed={currentCaliber === ""}
        onClick={() => onFilterButtonClick("")}
      />
      {renderGroup("Bullets (rifles, pistols, etc.)", bullets)}
      {renderGroup("Other (buckshot, grenades, flashbangs…)", others)}
    </Box>
  );
};

export default AmmoTableFilter;
