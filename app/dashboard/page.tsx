"use client";

import { useState, useEffect } from "react";
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
  Snackbar,
} from "@mui/material";
// icons
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

export default function UserDashboard() {
  const { user, error, isLoading } = useUser();
  const { data } = useSuspenseQuery<FetchedData>(GET_AMMO_DATA);
  const { userFavoriteAmmo, getUsersFavoriteAmmo, handleRemoveFavoriteAmmo } =
    useFavoriteAmmo();

  // states for pending removal
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null); // pending removal ammo ID
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [removedName, setRemovedName] = useState(""); // ammo name to be removed

  useEffect(() => {
    if (user) {
      getUsersFavoriteAmmo(user.sub as string);
    }
  }, [user]);

  // remove favorite ammo with delay
  const handleRemoveWithDelay = (ammo: any) => {
    setPendingRemoval(ammo.item.id);
    setRemovedName(ammo.item.name);
    setShowSnackbar(true);
  };

  // undo removal
  const handleUndoRemoval = () => {
    setPendingRemoval(null);
    setShowSnackbar(false);
  };

  // confirm removal
  const confirmRemoval = () => {
    const ammoToRemove = data.ammo.find(
      (ammo) => ammo.item.id === pendingRemoval,
    );
    if (ammoToRemove) {
      if (user) {
        handleRemoveFavoriteAmmo(user, ammoToRemove.item.id);
      }
    }
    setPendingRemoval(null);
    setShowSnackbar(false);
  };

  // confirm removal after snackbar is closed
  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    confirmRemoval();
  };

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
  const userAmmoData = data.ammo.filter(
    (ammoData) =>
      userFavoriteAmmo.some(
        (favAmmoData) => favAmmoData.itemId === ammoData.item.id,
      ) && ammoData.item.id !== pendingRemoval, // exclude pending removal
  );

  return user ? (
    <>
      {/* user dashboard header */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ m: 4, fontWeight: 700, textAlign: "center" }}
      >
        Welcome, {user?.name}!
      </Typography>

      {/* favorite ammo list */}
      <Grid container spacing={2} sx={{ p: 2 }}>
        {userAmmoData.map((ammo) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={ammo.item.id}>
            <FavoriteAmmoCard
              ammo={ammo}
              onRemoveWithDelay={handleRemoveWithDelay}
            />
          </Grid>
        ))}
      </Grid>

      {/* Snackbar for pending removal confirmation */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="warning"
          variant="filled"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleUndoRemoval}
              startIcon={<FavoriteBorderIcon />}
            >
              UNDO REMOVAL
            </Button>
          }
        >
          {removedName} removed from favorites
        </Alert>
      </Snackbar>
    </>
  ) : (
    // if user is not logged in, show login button
    <Box textAlign="center" mt={4}>
      <Typography variant="h5" gutterBottom>
        Please log in to view your dashboard.
      </Typography>
      <Button variant="contained" color="warning" href="/api/auth/login">
        Log In
      </Button>
    </Box>
  );
}
