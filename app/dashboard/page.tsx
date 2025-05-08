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

interface SnackbarMessage {
  id: string;
  name: string;
  key: number; // for re-rendering
}

export default function UserDashboard() {
  const { user, error, isLoading } = useUser();
  const { data } = useSuspenseQuery<FetchedData>(GET_AMMO_DATA);
  const { userFavoriteAmmo, getUsersFavoriteAmmo, handleRemoveFavoriteAmmo } =
    useFavoriteAmmo();

  // states for Snackbar queue and temporarily hidden items
  const [snackbarQueue, setSnackbarQueue] = useState<SnackbarMessage[]>([]);
  const [currentSnackbar, setCurrentSnackbar] =
    useState<SnackbarMessage | null>(null);
  const [itemsTemporarilyHidden, setItemsTemporarilyHidden] = useState<
    Set<string>
  >(new Set());

  // fetch user's favorite ammo when user is available
  useEffect(() => {
    if (user) {
      getUsersFavoriteAmmo(user.sub as string);
    }
  }, [user, getUsersFavoriteAmmo]);

  // process the next Snackbar message from the queue
  useEffect(() => {
    if (snackbarQueue.length > 0 && !currentSnackbar) {
      setCurrentSnackbar(snackbarQueue[0]);
      setSnackbarQueue((prev) => prev.slice(1));
    }
  }, [snackbarQueue, currentSnackbar]);

  // remove favorite ammo: add to temporary hidden list and snackbar queue
  const handleRemoveWithDelay = (ammo: any) => {
    const itemId = ammo.item.id;
    const itemName = ammo.item.name;

    setItemsTemporarilyHidden((prev) => new Set(prev).add(itemId));
    setSnackbarQueue((prev) => [
      ...prev,
      { id: itemId, name: itemName, key: new Date().getTime() },
    ]);
  };

  // undo removal for the current snackbar item
  const handleUndoRemoval = () => {
    if (currentSnackbar) {
      setItemsTemporarilyHidden((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentSnackbar.id);
        return newSet;
      });
      // the item is visually restored. The actual removal from backend was never called.
    }
    setCurrentSnackbar(null); // close current snackbar, allow useEffect to process next
  };

  // confirm removal after snackbar is closed (or times out)
  // this is called by Snackbar's onClose prop
  const handleConfirmAndCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    if (currentSnackbar) {
      // this is the actual confirmation of removal
      if (user) {
        handleRemoveFavoriteAmmo(user, currentSnackbar.id);
        // After successful removal, `userFavoriteAmmo` should update,
        // which will naturally filter out the item from `userAmmoData`.
        // `itemsTemporarilyHidden` doesn't need to be changed here for this item,
        // as it will no longer be in the source list `userFavoriteAmmo`.
      }
    }
    setCurrentSnackbar(null); // allow useEffect to process the next snackbar in queue
  };

  if (isLoading) {
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

  // filter user's favorite ammo, excluding temporarily hidden items
  const userAmmoData = data.ammo.filter(
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
              onRemoveWithDelay={() => handleRemoveWithDelay(ammo)} // pass the specific ammo object
            />
          </Grid>
        ))}
      </Grid>

      <Snackbar
        key={currentSnackbar ? currentSnackbar.key : undefined} // important for re-rendering
        open={!!currentSnackbar}
        autoHideDuration={6000}
        onClose={handleConfirmAndCloseSnackbar} // this confirms removal on timeout or close
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleConfirmAndCloseSnackbar} // clicking 'X' on Alert also confirms
          severity="warning"
          variant="filled"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleUndoRemoval} // explicit undo action
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
