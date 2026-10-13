import { useCallback, useState } from "react";

export interface FavoriteAmmo {
  itemId: string;
}

export function useFavoriteAmmo() {
  const [userFavoriteAmmo, setUserFavoriteAmmo] = useState<FavoriteAmmo[]>([]);

  // Load the logged-in user's favorites (the server identifies the user from
  // the session). Never throws: on failure it logs and returns null, leaving
  // the current state untouched, so callers inside useEffect don't create
  // unhandled promise rejections.
  const getUsersFavoriteAmmo = useCallback(async (): Promise<
    FavoriteAmmo[] | null
  > => {
    try {
      const res = await fetch("/api/users/ammo/get-favorite-ammo", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch favorite ammo (${res.status})`);
      }

      const data: unknown = await res.json();
      // 401 / 429 bodies look like { error: "..." } — never store those
      if (!Array.isArray(data)) {
        throw new Error("Unexpected favorite ammo response shape");
      }

      const favoriteAmmos = data as FavoriteAmmo[];
      setUserFavoriteAmmo(favoriteAmmos);
      return favoriteAmmos;
    } catch (error) {
      console.error("Error fetching users favorite ammo: ", error);
      return null;
    }
  }, []);

  // Add a favorite. Throws on failure; on success the local list is updated
  // directly, so a follow-up refetch can't leave state out of sync.
  const handleFavoriteAmmo = useCallback(async (itemId: string) => {
    const res = await fetch("/api/users/ammo/add-favorite-ammo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });

    if (!res.ok) {
      throw new Error(`Failed to add favorite ammo (${res.status})`);
    }

    setUserFavoriteAmmo((prev) =>
      prev.some((fav) => fav.itemId === itemId) ? prev : [...prev, { itemId }],
    );
  }, []);

  // Remove a favorite. Throws on failure.
  const handleRemoveFavoriteAmmo = useCallback(async (itemId: string) => {
    const res = await fetch("/api/users/ammo/remove-favorite-ammo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });

    if (!res.ok) {
      throw new Error(`Failed to remove favorite ammo (${res.status})`);
    }

    setUserFavoriteAmmo((prev) => prev.filter((fav) => fav.itemId !== itemId));
  }, []);

  return {
    userFavoriteAmmo,
    getUsersFavoriteAmmo,
    handleFavoriteAmmo,
    handleRemoveFavoriteAmmo,
  };
}
