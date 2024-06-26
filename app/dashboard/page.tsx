"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useFavoriteAmmo } from "@/hooks/useFavoriteAmmo";
// MUI
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  Tooltip,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import ShieldIcon from "@mui/icons-material/Shield";
import SpeedIcon from "@mui/icons-material/Speed";
import AdjustIcon from "@mui/icons-material/Adjust";

import { useEffect } from "react";
import { useSuspenseQuery } from "@apollo/client";
import { FetchedData } from "@/types/ammo";
import { GET_AMMO_DATA } from "@/graphql/queries";

const headCells = [
  { id: "icon", label: "Icon" },
  { id: "name", label: "Name" },
];

export default function UserDashboard() {
  const { user, error, isLoading } = useUser();
  const { data } = useSuspenseQuery<FetchedData>(GET_AMMO_DATA);
  const {
    userFavoriteAmmo,
    getUsersFavoriteAmmo,
    handleFavoriteAmmo,
    handleRemoveFavoriteAmmo,
  } = useFavoriteAmmo();

  useEffect(() => {
    if (user) {
      getUsersFavoriteAmmo(user.sub as string);
    }
  }, [user]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  const userAmmoData = data.ammo.filter((ammoData) =>
    userFavoriteAmmo.some(
      (favAmmoData) => favAmmoData.itemId === ammoData.item.id,
    ),
  );

  return user ? (
    <>
      <h2>Welcome! {user?.name}</h2>
      <Grid container>
        {userAmmoData.map((ammo) => (
          <Grid item xs={6} md={4}>
            <Card sx={{ maxWidth: 345, m: 2 }}>
              <CardMedia
                component="img"
                height="100%"
                image={ammo.item.inspectImageLink}
                alt={ammo.item.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {ammo.item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {ammo.caliber} - {ammo.ammoType}
                </Typography>

                <Grid container spacing={1} sx={{ mt: 2 }}>
                  <Grid item xs={6}>
                    <Tooltip title="Damage">
                      <Box display="flex" alignItems="center">
                        <GavelIcon color="error" sx={{ mr: 1 }} />
                        <Typography variant="body2">{ammo.damage}</Typography>
                      </Box>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={6}>
                    <Tooltip title="Penetration Power">
                      <Box display="flex" alignItems="center">
                        <ShieldIcon color="info" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {ammo.penetrationPower}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={6}>
                    <Tooltip title="Armor Damage">
                      <Box display="flex" alignItems="center">
                        <ShieldIcon color="warning" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {ammo.armorDamage}%
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={6}>
                    <Tooltip title="Projectile Count">
                      <Box display="flex" alignItems="center">
                        <SpeedIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {ammo.projectileCount}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Tooltip title="Accuracy Modifier">
                    <Box display="flex" alignItems="center">
                      <AdjustIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Accuracy: {ammo.accuracyModifier > 0 ? "+" : ""}
                        {ammo.accuracyModifier}%
                      </Typography>
                    </Box>
                  </Tooltip>
                  <Tooltip title="Recoil Modifier">
                    <Box display="flex" alignItems="center">
                      <AdjustIcon color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Recoil: {ammo.recoilModifier > 0 ? "+" : ""}
                        {ammo.recoilModifier}%
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  ) : (
    <h1>PLEASE LOGIN</h1>
  );
}
