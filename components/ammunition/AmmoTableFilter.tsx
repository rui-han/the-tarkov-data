import { Button, Box, Paper } from "@mui/material";
import { AmmoTableFilterProps } from "@/types/ammo";

const changeCaliberToShortName = (caliber: string) =>
  caliber.replace("Caliber", "");

const AmmoTableFilter = ({
  ammo,
  currentCaliber,
  onFilterButtonClick,
}: AmmoTableFilterProps) => {
  // clicking the selected caliber again clears the filter; the same rule
  // applies to every group of buttons
  const handleButtonClick = (caliber: string) => {
    onFilterButtonClick(caliber === currentCaliber ? "" : caliber);
  };

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

  const renderButton = (caliber: string) => (
    <Button
      sx={{ m: "4px", fontSize: "16px" }}
      key={caliber}
      color="inherit"
      variant={caliber === currentCaliber ? "contained" : "outlined"}
      onClick={() => handleButtonClick(caliber)}
    >
      {changeCaliberToShortName(caliber) || caliber}
    </Button>
  );

  const hasLabel = (caliber: string) =>
    Boolean(caliber && changeCaliberToShortName(caliber)?.trim());

  return (
    <Paper sx={{ my: 3 }} elevation={3}>
      <Box p={4}>
        <h4>Bullets (Rifles, Pistols, etc):</h4>
        {uniqueCalibers.filter(hasLabel).map(renderButton)}
        <h4>Others (Buckshots, Grenades, Flashbangs):</h4>
        {otherCalibers.filter(hasLabel).map(renderButton)}
      </Box>
    </Paper>
  );
};

export default AmmoTableFilter;
