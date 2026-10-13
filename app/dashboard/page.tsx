"use client";

import { useState, useEffect } from "react";
import { useAmmoData } from "@/hooks/useAmmoData";
import { Ammo } from "@/types/ammo";
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

interface SnackbarMessage {
  id: string;
  name: string;
  key: number; // for re-rendering
}

export default function UserDashboard() {
  const { user, error, isLoading } = useUser();
  // renamed to `ammoError` to avoid clashing with Auth0's `error` above
  const {
    ammo: allAmmo,
    error: ammoError,
    isLoading: ammoLoading,
  } = useAmmoData();

  const {
    userFavoriteAmmo,
    getUsersFavoriteAmmo,
    handleFavoriteAmmo,
    handleRemoveFavoriteAmmo,
  } = useFavoriteAmmo();

  // "removed — undo?" snackbar queue, one shown at a time
  const [snackbarQueue, setSnackbarQueue] = useState<SnackbarMessage[]>([]);
  const [currentSnackbar, setCurrentSnackbar] =
    useState<SnackbarMessage | null>(null);
  // cards hidden while their remove request is in flight
  const [itemsTemporarilyHidden, setItemsTemporarilyHidden] = useState<
    Set<string>
  >(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // fetch user's favorite ammo when user is available
  useEffect(() => {
    if (user) {
      getUsersFavoriteAmmo();
    }
  }, [user, getUsersFavoriteAmmo]);

  // process the next Snackbar message from the queue
  useEffect(() => {
    if (snackbarQueue.length > 0 && !currentSnackbar) {
      setCurrentSnackbar(snackbarQueue[0]);
      setSnackbarQueue((prev) => prev.slice(1));
    }
  }, [snackbarQueue, currentSnackbar]);

  // Remove a favorite right away (so it still happens if the user navigates
  // away), then offer an undo. The card is hidden while the request is in
  // flight; on failure it simply reappears and an error is shown.
  const handleRemoveWithUndo = async (ammo: Ammo) => {
    const { id, name } = ammo.item;

    setItemsTemporarilyHidden((prev) => new Set(prev).add(id));
    try {
      await handleRemoveFavoriteAmmo(id);
      setSnackbarQueue((prev) => [...prev, { id, name, key: Date.now() }]);
    } catch (err) {
      console.error("Failed to remove favorite ammo:", err);
      setErrorMessage(`Failed to remove "${name}", please try again`);
    } finally {
      setItemsTemporarilyHidden((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // undo = add the favorite back (the add endpoint is idempotent)
  const handleUndoRemoval = async () => {
    const target = currentSnackbar;
    setCurrentSnackbar(null); // close, allow the effect to show the next one
    if (!target) return;

    try {
      await handleFavoriteAmmo(target.id);
    } catch (err) {
      console.error("Failed to restore favorite ammo:", err);
      setErrorMessage(`Failed to restore "${target.name}", please try again`);
    }
  };

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setCurrentSnackbar(null);
  };

  if (isLoading || ammoLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from(new Array(6)).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={index}>
            <Card sx={{ maxWidth: 345, m: 2 }}>
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

  if (ammoError) {
    console.error("Error fetching ammo data:", ammoError);
    return (
      <Box textAlign="center" mt={4}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          Failed to load ammunition data. Please try again later.
        </Alert>
        <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Box>
    );
  }

  // filter user's favorite ammo, excluding temporarily hidden items
  const userAmmoData = allAmmo.filter(
    (ammoData) =>
      userFavoriteAmmo.some(
        (favAmmoData) => favAmmoData.itemId === ammoData.item.id,
      ) && !itemsTemporarilyHidden.has(ammoData.item.id),
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
            <FavoriteAmmoCard
              ammo={ammo}
              onRemoveWithDelay={() => handleRemoveWithUndo(ammo)}
            />
          </Grid>
        ))}
      </Grid>

      {/* "removed from favorites" with an undo action */}
      <Snackbar
        key={currentSnackbar ? currentSnackbar.key : undefined} // important for re-rendering
        open={!!currentSnackbar}
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
          {currentSnackbar
            ? `${currentSnackbar.name} removed from favorites`
            : ""}
        </Alert>
      </Snackbar>

      {/* request failures */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={5000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorMessage(null)}
          severity="error"
          variant="filled"
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  ) : (
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
