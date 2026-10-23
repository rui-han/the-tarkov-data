"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useAmmoData } from "@/hooks/useAmmoData";
import { useFavorites } from "@/hooks/useFavorites";
import { useItems } from "@/hooks/useItems";
import { useTraderMap } from "@/hooks/useHideoutData";
import { useGameMode } from "@/contexts/GameModeContext";
import { GAME_MODE_LABELS } from "@/lib/tarkovApi";
// components
import FavoriteAmmoCard from "@/components/users/dashboard/FavoriteAmmoCard";
import Watchlist from "@/components/users/dashboard/Watchlist";
// MUI
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Skeleton,
  Snackbar,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
// icons
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

interface SnackbarMessage {
  id: string;
  name: string;
  key: number; // for re-rendering
}

type TabId = "watchlist" | "ammo";

function CardSkeletons() {
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

/**
 * Everything that needs data. Rendered only for a logged-in user, so visitors
 * who are not logged in don't download the (large) items files.
 */
function DashboardContent() {
  const { gameMode } = useGameMode();
  const {
    ammo: allAmmo,
    error: ammoError,
    isLoading: ammoLoading,
  } = useAmmoData();
  const { items, error: itemsError, isLoading: itemsLoading } = useItems();
  // only for trader names, never blocks the page
  const { tradersById } = useTraderMap();
  const {
    favoriteIds,
    isLoaded,
    loadFailed,
    loadFavorites,
    addFavorite,
    removeFavorite,
  } = useFavorites();

  const [tab, setTab] = useState<TabId>("watchlist");

  // "removed — undo?" snackbar queue, one shown at a time
  const [snackbarQueue, setSnackbarQueue] = useState<SnackbarMessage[]>([]);
  const [currentSnackbar, setCurrentSnackbar] =
    useState<SnackbarMessage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // guards against a double click queuing two removals of the same item
  const removing = useRef(new Set<string>());

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // process the next Snackbar message from the queue
  useEffect(() => {
    if (snackbarQueue.length > 0 && !currentSnackbar) {
      setCurrentSnackbar(snackbarQueue[0]);
      setSnackbarQueue((prev) => prev.slice(1));
    }
  }, [snackbarQueue, currentSnackbar]);

  // Removal is optimistic: the row/card disappears at once and the hook
  // restores it if the request fails. The request is sent right away (so it
  // still happens if the user navigates away); undo adds the favorite back.
  const handleRemove = useCallback(
    async (itemId: string, name: string) => {
      if (removing.current.has(itemId)) return;
      removing.current.add(itemId);
      try {
        await removeFavorite(itemId);
        setSnackbarQueue((prev) => [
          ...prev,
          { id: itemId, name, key: Date.now() },
        ]);
      } catch (err) {
        console.error("Failed to remove favorite:", err);
        setErrorMessage(`Failed to remove "${name}", please try again`);
      } finally {
        removing.current.delete(itemId);
      }
    },
    [removeFavorite],
  );

  const handleUndoRemoval = async () => {
    const target = currentSnackbar;
    setCurrentSnackbar(null); // close, allow the effect to show the next one
    if (!target) return;

    try {
      await addFavorite(target.id);
    } catch (err) {
      console.error("Failed to restore favorite:", err);
      setErrorMessage(`Failed to restore "${target.name}", please try again`);
    }
  };

  const handleCloseSnackbar = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setCurrentSnackbar(null);
  };

  const favoriteAmmo = useMemo(
    () => allAmmo.filter((a) => favoriteIds.has(a.item.id)),
    [allAmmo, favoriteIds],
  );

  if (loadFailed && !isLoaded) {
    return (
      <Box textAlign="center" mt={4}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          Failed to load your favorites. Please try again.
        </Alert>
        <Button onClick={() => loadFavorites()} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Box>
    );
  }

  if (!isLoaded) return <CardSkeletons />;

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: 2, pb: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value: TabId) => setTab(value)}
          aria-label="Dashboard sections"
        >
          <Tab value="watchlist" label={`Watchlist (${favoriteIds.size})`} />
          <Tab
            value="ammo"
            label={ammoLoading ? "Ammo" : `Ammo (${favoriteAmmo.length})`}
          />
        </Tabs>
        <Typography variant="caption" color="text.secondary">
          Showing {GAME_MODE_LABELS[gameMode].full} data
        </Typography>
      </Box>

      {tab === "watchlist" && (
        <Watchlist
          favoriteIds={favoriteIds}
          items={items}
          itemsLoading={itemsLoading}
          itemsError={itemsError}
          tradersById={tradersById}
          onRemove={handleRemove}
        />
      )}

      {tab === "ammo" &&
        (ammoError ? (
          <Alert severity="error">
            Failed to load ammunition data. Please try again later.
          </Alert>
        ) : ammoLoading ? (
          <CardSkeletons />
        ) : favoriteAmmo.length === 0 ? (
          <Box
            component={Paper}
            variant="outlined"
            sx={{ p: 4, textAlign: "center" }}
          >
            <Typography variant="h6" gutterBottom>
              No favorite ammo yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Favorite ammo from the ammunition table to compare its stats here.
            </Typography>
            <Button
              component={Link}
              href="/ammunition"
              variant="outlined"
              color="inherit"
            >
              Browse ammunition
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {favoriteAmmo.map((ammo) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                xl={2.4}
                key={ammo.item.id}
              >
                <FavoriteAmmoCard
                  ammo={ammo}
                  onRemoveWithDelay={() =>
                    handleRemove(ammo.item.id, ammo.item.name)
                  }
                />
              </Grid>
            ))}
          </Grid>
        ))}

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
    </Box>
  );
}

export default function UserDashboard() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <CardSkeletons />;

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

  if (!user) {
    return (
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

  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ m: 4, fontWeight: 700, textAlign: "center" }}
      >
        Welcome, {user.name}!
      </Typography>
      <DashboardContent />
    </>
  );
}
