import { useMemo } from "react";
import { Box, Chip, Typography } from "@mui/material";
import { caliberLabel } from "@/lib/ammo";
import type { Ammo, AmmoTableFilterProps } from "@/types/ammo";

interface CaliberCount {
  caliber: string;
  count: number;
}

/** Calibers with how many rounds each has; calibers without a label are skipped. */
function countCalibers(rounds: Ammo[]): CaliberCount[] {
  const counts = new Map<string, number>();
  for (const round of rounds) {
    if (!caliberLabel(round.caliber).trim()) continue;
    counts.set(round.caliber, (counts.get(round.caliber) ?? 0) + 1);
  }
  return [...counts]
    .map(([caliber, count]) => ({ caliber, count }))
    .sort((a, b) =>
      caliberLabel(a.caliber).localeCompare(
        caliberLabel(b.caliber),
        undefined,
        {
          numeric: true,
        },
      ),
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
      bullets: countCalibers(ammo.filter((a) => a.ammoType === "bullet")),
      others: countCalibers(ammo.filter((a) => a.ammoType !== "bullet")),
    }),
    [ammo],
  );

  // clicking the selected caliber again clears the filter; the same rule
  // applies to every group
  const toggle = (caliber: string) =>
    onFilterButtonClick(caliber === currentCaliber ? "" : caliber);

  const renderGroup = (title: string, calibers: CaliberCount[]) =>
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
          {calibers.map(({ caliber, count }) => {
            const selected = caliber === currentCaliber;
            return (
              <Chip
                key={caliber}
                label={`${caliberLabel(caliber)} (${count})`}
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
