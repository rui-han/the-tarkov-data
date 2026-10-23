"use client";

import { useCallback, useMemo, useRef, useState } from "react";

export interface Favorite {
  itemId: string;
}

/** The server refused to add more favorites (per-user cap). */
export class FavoriteLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FavoriteLimitError";
  }
}

const GENERIC_ERROR = "Failed to update favorite status, please try again";

/** Message that is safe and useful to show to the user. */
export function favoriteErrorMessage(error: unknown): string {
  return error instanceof FavoriteLimitError ? error.message : GENERIC_ERROR;
}

async function send(kind: "add" | "remove", itemId: string): Promise<void> {
  const res = await fetch(`/api/users/ammo/${kind}-favorite-ammo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId }),
  });

  if (res.status === 409) {
    const body = await res.json().catch(() => null);
    throw new FavoriteLimitError(
      typeof body?.error === "string" ? body.error : "Favorites limit reached",
    );
  }
  if (!res.ok) {
    throw new Error(`Failed to ${kind} favorite (${res.status})`);
  }
}

/**
 * The logged-in user's favorite items (any item, not just ammo).
 *
 * add / remove / toggle are optimistic: the list changes immediately and is
 * rolled back if the request fails (the error is rethrown). The server
 * identifies the user from the session.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  // The ref is the source of truth; state only mirrors it for rendering. That
  // way callbacks always see the latest list without changing identity, even
  // when two updates happen before a re-render.
  const favoritesRef = useRef<Favorite[]>([]);
  const update = useCallback((fn: (prev: Favorite[]) => Favorite[]) => {
    const next = fn(favoritesRef.current);
    favoritesRef.current = next;
    setFavorites(next);
  }, []);

  const favoriteIds = useMemo<ReadonlySet<string>>(
    () => new Set(favorites.map((f) => f.itemId)),
    [favorites],
  );

  // Never throws: on failure it keeps the current list and returns false.
  const loadFavorites = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/users/ammo/get-favorite-ammo", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch favorites (${res.status})`);
      }

      const data: unknown = await res.json();
      // 401 / 429 bodies look like { error: "..." } — never store those
      if (!Array.isArray(data)) {
        throw new Error("Unexpected favorites response shape");
      }

      update(() =>
        data.filter(
          (f): f is Favorite =>
            typeof f === "object" &&
            f !== null &&
            typeof (f as Favorite).itemId === "string",
        ),
      );
      setIsLoaded(true);
      setLoadFailed(false);
      return true;
    } catch (error) {
      console.error("Error fetching favorites: ", error);
      setLoadFailed(true);
      return false;
    }
  }, [update]);

  const addFavorite = useCallback(
    async (itemId: string): Promise<void> => {
      const had = favoritesRef.current.some((f) => f.itemId === itemId);
      if (!had) update((prev) => [...prev, { itemId }]);
      try {
        await send("add", itemId);
      } catch (error) {
        if (!had) update((prev) => prev.filter((f) => f.itemId !== itemId));
        throw error;
      }
    },
    [update],
  );

  const removeFavorite = useCallback(
    async (itemId: string): Promise<void> => {
      const had = favoritesRef.current.some((f) => f.itemId === itemId);
      if (had) update((prev) => prev.filter((f) => f.itemId !== itemId));
      try {
        await send("remove", itemId);
      } catch (error) {
        if (had) update((prev) => [...prev, { itemId }]);
        throw error;
      }
    },
    [update],
  );

  /** Resolves to whether the item is a favorite afterwards. */
  const toggleFavorite = useCallback(
    async (itemId: string): Promise<boolean> => {
      const wasFavorite = favoritesRef.current.some((f) => f.itemId === itemId);
      if (wasFavorite) await removeFavorite(itemId);
      else await addFavorite(itemId);
      return !wasFavorite;
    },
    [addFavorite, removeFavorite],
  );

  return {
    favorites,
    favoriteIds,
    /** the first load has succeeded */
    isLoaded,
    /** the last load failed (a later success clears it) */
    loadFailed,
    loadFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
}
