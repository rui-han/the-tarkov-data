"use client";

import { useTarkovData } from "@/hooks/useTarkovData";
import { toArray } from "@/lib/tarkovApi";
import { Ammo } from "@/types/ammo";

interface AmmoItemProperties {
  caliber?: string;
  ammoType?: string;
  projectileCount?: number;
  damage?: number;
  penetrationPower?: number;
  armorDamage?: number;
  accuracyModifier?: number;
  recoilModifier?: number;
}

interface RawItem {
  id: string;
  normalizedName: string;
  inspectImageLink?: string;
  types: string[];
  properties?: AmmoItemProperties;
}

interface ItemsResponse {
  items?: unknown; // shape is unconfirmed — could be an array or an id-keyed object
}

export function useAmmoData() {
  const { data, error, isLoading } = useTarkovData<ItemsResponse>("items");

  // TEMP: log once so we can see the real shape in the browser console,
  // remove this line once the shape is confirmed
  if (data && typeof window !== "undefined") {
    console.log("[useAmmoData] raw items payload:", data.items);
  }

  const ammo: Ammo[] = toArray<RawItem>(data?.items)
    // "ammo" is one of the ItemType enum values, so this is the official
    // discriminator for ammo items (see the "types" field on Item)
    .filter((item) => item.types?.includes("ammo") && item.properties)
    .map((item) => {
      const props = item.properties!;
      return {
        caliber: props.caliber ?? "",
        ammoType: props.ammoType ?? "bullet",
        projectileCount: props.projectileCount ?? 1,
        item: {
          id: item.id,
          name: item.normalizedName
            .replaceAll("-", " ")
            .replaceAll("1270", "12/70")
            .replaceAll("2070", "20/70")
            .toUpperCase(),
          inspectImageLink: item.inspectImageLink ?? "",
        },
        damage: props.damage ?? 0,
        penetrationPower: props.penetrationPower ?? 0,
        armorDamage: props.armorDamage ?? 0,
        accuracyModifier: props.accuracyModifier ?? 0,
        recoilModifier: props.recoilModifier ?? 0,
      };
    });

  return { ammo, error, isLoading };
}
