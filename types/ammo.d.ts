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
