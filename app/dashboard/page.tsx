"use client";

import { useEffect } from "react";
import { useSuspenseQuery } from "@apollo/client";
import { FetchedData } from "@/types/ammo";
import { GET_AMMO_DATA } from "@/graphql/queries";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useFavoriteAmmo } from "@/hooks/useFavoriteAmmo";
// components
import FavoriteAmmoCard from "@/components/users/dashboard/FavoriteAmmoCard";
// MUI
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Skeleton,
  Button,
  Alert,
  AlertTitle,
  useTheme,
} from "@mui/material";

export default function UserDashboard() {
  const { user, error, isLoading } = useUser();
  const { data } = useSuspenseQuery<FetchedData>(GET_AMMO_DATA);
  const {
    userFavoriteAmmo,
    getUsersFavoriteAmmo,
    handleFavoriteAmmo,
    handleRemoveFavoriteAmmo,
  } = useFavoriteAmmo();
  const theme = useTheme();

  useEffect(() => {
    if (user) {
      getUsersFavoriteAmmo(user.sub as string);
    }
  }, [user]);

  // loading
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from(new Array(6)).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={index}>
            <Card
              sx={{
                maxWidth: 345,
                m: 2,
              }}
            >
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // error
  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error.message}
        </Alert>
        <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Box>
    );
  }

  // filter user's favorite ammo
  const userAmmoData = data.ammo.filter((ammoData) =>
    userFavoriteAmmo.some(
      (favAmmoData) => favAmmoData.itemId === ammoData.item.id,
    ),
  );

  return user ? (
    <>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ m: 4, fontWeight: 700, textAlign: "center" }}
      >
        Welcome, {user?.name}!
      </Typography>
      <Grid container spacing={2} sx={{ p: 2 }}>
        {userAmmoData.map((ammo) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={ammo.item.id}>
            <FavoriteAmmoCard ammo={ammo} />
          </Grid>
        ))}
      </Grid>
    </>
  ) : (
    <Box textAlign="center" mt={4}>
      <Typography variant="h5" gutterBottom>
        Please log in to view your dashboard.
      </Typography>
      <Button variant="contained" color="primary" href="/api/auth/login">
        Log In
      </Button>
    </Box>
  );
}
