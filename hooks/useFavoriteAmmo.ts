import { useCallback, useState } from "react";
import { UserProfile } from "@auth0/nextjs-auth0/client";

export interface FavoriteAmmo {
  itemId: string;
}

export function useFavoriteAmmo() {
  const [userFavoriteAmmo, setUserFavoriteAmmo] = useState<FavoriteAmmo[]>([]);

  // get user's all favorite ammo data, in array of objects
  const getUsersFavoriteAmmo = useCallback(async (auth0Id: string) => {
    const res = await fetch(
      `/api/users/ammo/get-favorite-ammo?auth0Id=${auth0Id}`,
    );
    const favoriteAmmos = await res.json();
    setUserFavoriteAmmo(favoriteAmmos);
    return favoriteAmmos;
  }, []);

  // handle favorite ammo
  const handleFavoriteAmmo = async (user: UserProfile, itemId: string) => {
    const res = await fetch("/api/users/ammo/add-favorite-ammo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth0Id: user.sub,
        itemId: itemId,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to add favorite ammo");
    }

    return await getUsersFavoriteAmmo(user.sub as string);
  };

  // handle remove favorite ammo
  const handleRemoveFavoriteAmmo = async (
    user: UserProfile,
    itemId: string,
  ) => {
    try {
      const res = await fetch("/api/users/ammo/remove-favorite-ammo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth0Id: user.sub,
          itemId: itemId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to remove favorite ammo");
      }

      return await getUsersFavoriteAmmo(user.sub as string);
    } catch (error) {
      console.error("Error removing users favorite ammo: ", error);
      throw error;
    }
  };

  return {
    userFavoriteAmmo,
    getUsersFavoriteAmmo,
    handleFavoriteAmmo,
    handleRemoveFavoriteAmmo,
  };
}
