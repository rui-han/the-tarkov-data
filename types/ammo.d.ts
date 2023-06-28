import { Dispatch, SetStateAction } from "react";

export interface FetchedData {
  ammo: Ammo[];
}

interface Ammo {
  caliber: string;
  item: Item;
  damage: number;
  penetrationPower: number;
  armorDamage: number;
  accuracyModifier: number;
  recoilModifier: number;
}

interface Item {
  id: string;
  name: string;
}

export interface AmmoTableProps {
  ammo: Ammo[];
  calibers: string[];
  filteredCalibers: string[];
  currentCaliber: string;
  setCurrentCaliber: Dispatch<SetStateAction<string>>;
}
