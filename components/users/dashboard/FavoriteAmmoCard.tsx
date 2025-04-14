// MUI
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Tooltip,
  Typography,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Paper,
  alpha,
} from "@mui/material";
// icons
import GavelIcon from "@mui/icons-material/Gavel"; // damage
import RemoveModeratorIcon from "@mui/icons-material/RemoveModerator"; // armor damage
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward"; // penetration power
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"; // projectile count
import AdjustIcon from "@mui/icons-material/Adjust"; // accuracy
import VibrationIcon from "@mui/icons-material/Vibration"; // recoil

import { FavoriteAmmoCardProps } from "@/types/ammo";

export default function FavoriteAmmoCard({ ammo }: FavoriteAmmoCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getTypeColor = (ammoType: string) => {
    const types = {
      bullet: "#FEBA17",
      buckshot: "#D84040",
      flashbang: "#F2F6D0",
    };
    return types[ammoType as keyof typeof types] || theme.palette.grey[700];
  };

  // stat icon size and spacing
  const statIconSize = isMobile ? "1rem" : "1.2rem";
  const statSpacing = isMobile ? 0.5 : 1;

  return (
    <Card
      elevation={3}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 8,
        },
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* the upper part: image and caliber */}
      <Box
        sx={{
          position: "relative",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(0,0,0,0.2)"
              : "rgba(245,245,245,0.6)",
          p: 2,
        }}
      >
        {/* image */}
        <CardMedia
          component="img"
          height={isMobile ? "140" : "180"}
          image={ammo.item.inspectImageLink}
          alt={ammo.item.name}
          sx={{
            objectFit: "contain",
            borderRadius: 1,
          }}
        />
        {/* caliber showing at top right corner */}
        <Chip
          label={ammo.caliber}
          size="small"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            backgroundColor: alpha(theme.palette.background.default, 0.85),
            color: "#DBDBDB",
            fontWeight: "bold",
          }}
        />
      </Box>
      {/* the bottom part: stats and description */}
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* name of the ammo */}
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{
            fontWeight: 700,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            height: isMobile ? "3rem" : "3.5rem",
            mb: 0,
          }}
        >
          {ammo.item.name}
        </Typography>
        {/* ammo type tag */}
        <Box sx={{ display: "flex", alignItems: "center", my: 1 }}>
          <Chip
            label={ammo.ammoType}
            size="small"
            sx={{
              backgroundColor: alpha(getTypeColor(ammo.ammoType), 0.15),
              color: getTypeColor(ammo.ammoType),
              borderRadius: 1,
              height: 24,
              "& .MuiChip-icon": {
                color: getTypeColor(ammo.ammoType),
                marginLeft: "4px",
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* stats */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            borderRadius: 1.5,
            mb: 2,
          }}
        >
          <Grid container spacing={isMobile ? 1 : 2}>
            {/* damage */}
            <Grid item xs={6}>
              <Tooltip title="Damage">
                <Box display="flex" alignItems="center">
                  <GavelIcon
                    sx={{
                      mr: statSpacing,
                      fontSize: statIconSize,
                    }}
                  />
                  <Typography variant="body2" fontWeight={500}>
                    {ammo.damage}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
            {/* penetration */}
            <Grid item xs={6}>
              <Tooltip title="Penetration Power">
                <Box display="flex" alignItems="center">
                  <ArrowOutwardIcon
                    sx={{
                      mr: statSpacing,
                      fontSize: statIconSize,
                    }}
                  />
                  <Typography variant="body2" fontWeight={500}>
                    {ammo.penetrationPower}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
            {/* armor piercing */}
            <Grid item xs={6}>
              <Tooltip title="Armor Damage">
                <Box display="flex" alignItems="center">
                  <RemoveModeratorIcon
                    sx={{
                      mr: statSpacing,
                      fontSize: statIconSize,
                    }}
                  />
                  <Typography variant="body2" fontWeight={500}>
                    {ammo.armorDamage}%
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
            {/* projectile count */}
            <Grid item xs={6}>
              <Tooltip title="Projectile Count">
                <Box display="flex" alignItems="center">
                  <DragIndicatorIcon
                    sx={{
                      mr: statSpacing,
                      fontSize: statIconSize,
                    }}
                  />
                  <Typography variant="body2" fontWeight={500}>
                    {ammo.projectileCount}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>
        {/* accuracy and recoil modifiers */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          {/* accuracy */}
          <Tooltip title="Accuracy Modifier">
            <Box
              display="flex"
              alignItems="center"
              sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                flex: 1,
              }}
            >
              <AdjustIcon
                sx={{
                  mr: statSpacing,
                  fontSize: statIconSize,
                }}
              />
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{
                  color:
                    ammo.accuracyModifier == 0
                      ? theme.palette.text.primary
                      : ammo.accuracyModifier > 0
                      ? "green"
                      : "red",
                }}
              >
                {ammo.accuracyModifier > 0 ? "+" : ""}
                {ammo.accuracyModifier}
              </Typography>
            </Box>
          </Tooltip>
          {/* recoil */}
          <Tooltip title="Recoil Modifier">
            <Box
              display="flex"
              alignItems="center"
              sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                flex: 1,
              }}
            >
              <VibrationIcon
                sx={{
                  mr: statSpacing,
                  fontSize: statIconSize,
                }}
              />
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{
                  color:
                    ammo.accuracyModifier == 0
                      ? theme.palette.text.primary
                      : ammo.accuracyModifier > 0
                      ? "red"
                      : "green",
                }}
              >
                {ammo.recoilModifier > 0 ? "+" : ""}
                {ammo.recoilModifier}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
