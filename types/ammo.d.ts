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
  inspectImageLink: string;
}

export interface AmmoTableProps {
  ammo: Ammo[];
  inputText: string;
  currentCaliber: string;
  setCurrentCaliber: Dispatch<SetStateAction<string>>;
  setInputText: Dispatch<SetStateAction<string>>;
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

interface AmmoTableFilterProps {
  ammo: Ammo[];
  currentCaliber: string;
  onFilterButtonClick: (caliber: string) => void;
}

interface AmmoTablePaginationProps {
  totalRows: number;
  rowsPerPage: number;
  page: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface AmmoTableRowProps {
  ammoData: Ammo;
  isFavorite: boolean;
  onFavoriteClick: (itemId: string) => void;
}

interface FavoriteAmmoCardProps {
  ammo: Ammo;
  onRemoveWithDelay: (ammo: AmmoData) => void;
}
