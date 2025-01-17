import { Button, Box, Paper } from "@mui/material";
import { AmmoTableFilterProps } from "@/types/ammo";

const AmmoTableFilter = ({
  ammo,
  currentCaliber,
  onFilterButtonClick,
}: AmmoTableFilterProps) => {
  const changeCaliberToShortName = (caliber: string) =>
    caliber.replace("Caliber", "");

  const uniqueCalibers = [
    ...new Set(
      ammo
        .filter((ammoData) => ammoData.ammoType === "bullet")
        .map((ammoData) => ammoData.caliber),
    ),
  ];

  const otherCalibers = [
    ...new Set(
      ammo
        .filter((ammoData) =>
          ["buckshot", "grenade", "flashbang"].includes(ammoData.ammoType),
        )
        .map((ammoData) => ammoData.caliber),
    ),
  ];

  return (
    <Paper sx={{ my: 3 }} elevation={3}>
      <Box p={4}>
        <h4>Bullets (Rifles, Pistols, etc):</h4>
        {uniqueCalibers.map((caliber) => (
          <Button
            sx={{ m: "4px", fontSize: "16px" }}
            key={caliber}
            color="inherit"
            variant={caliber === currentCaliber ? "contained" : "outlined"}
            onClick={() => onFilterButtonClick(caliber)}
          >
            {changeCaliberToShortName(caliber)}
          </Button>
        ))}
        <h4>Others (Buckshots, Grenades, Flashbangs):</h4>
        {otherCalibers.map((caliber) => (
          <Button
            sx={{ m: "4px", fontSize: "16px" }}
            key={caliber}
            color="inherit"
            variant={caliber === currentCaliber ? "contained" : "outlined"}
            onClick={() => onFilterButtonClick(caliber)}
          >
            {changeCaliberToShortName(caliber)}
          </Button>
        ))}
      </Box>
    </Paper>
  );
};

export default AmmoTableFilter;
