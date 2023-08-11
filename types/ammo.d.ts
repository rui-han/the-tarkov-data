import { Dispatch, SetStateAction } from "react";

export interface FetchedData {
  ammo: Ammo[];
}

interface Ammo {
  caliber: string;
  ammoType: string;
  projectileCount: number;
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
  inputText: string;
  currentCaliber: string;
  setCurrentCaliber: Dispatch<SetStateAction<string>>;
}

export interface AmmoSearchbarProps {
  setInputText: Dispatch<SetStateAction<string>>;
}

type Order = "asc" | "desc";

interface AmmoTableHeadProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Ammo,
  ) => void;
  order: Order;
  orderBy: string;
}

interface HeadCell {
  id: keyof Ammo;
  label: string;
}
