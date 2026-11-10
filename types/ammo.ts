import type { ChangeEvent, Dispatch, MouseEvent, SetStateAction } from "react";
import type { UserProfile } from "@auth0/nextjs-auth0/client";

export interface FetchedData {
  ammo: Ammo[];
}

export interface Ammo {
  caliber: string;
  ammoType: string;
  projectileCount: number;
  item: Item;
  /** short name, e.g. "M855A1"; empty when not available */
  shortName: string;
  /** small icon for the table; empty when not available */
  iconLink: string;
  damage: number;
  penetrationPower: number;
  /** highest armor class the penetration roughly matches (pen / 10), 0 to 6 */
  armorClass: number;
  armorDamage: number;
  accuracyModifier: number;
  recoilModifier: number;
  /** last lowest flea price of one round; null when it isn't sold */
  fleaPrice: number | null;
  /** lowercased text used by the search box */
  searchText: string;
}

export interface Item {
  id: string;
  name: string;
  inspectImageLink: string;
}

export interface AmmoTableProps {
  ammo: Ammo[];
}

export interface AmmoSearchbarProps {
  setInputText: Dispatch<SetStateAction<string>>;
  /** when given, the search box shows this text (controlled); otherwise it keeps its own */
  value?: string;
}

export type Order = "asc" | "desc";

export interface AmmoTableHeadProps {
  onRequestSort: (event: MouseEvent<unknown>, property: keyof Ammo) => void;
  order: Order;
  orderBy: string;
}

export interface HeadCell {
  id: keyof Ammo;
  label: string;
}

export interface AmmoTableFilterProps {
  ammo: Ammo[];
  currentCaliber: string;
  /** receives the caliber to select, or "" to clear the filter */
  onFilterButtonClick: (caliber: string) => void;
}

export interface AmmoTablePaginationProps {
  totalRows: number;
  rowsPerPage: number;
  page: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export interface AmmoTableRowProps {
  ammoData: Ammo;
  isFavorite: boolean;
  /** resolves to true when the favorite status was actually updated */
  handleFavoriteClick: (itemId: string) => Promise<boolean>;
  user: UserProfile | undefined;
}

export interface FavoriteAmmoCardProps {
  ammo: Ammo;
  onRemoveWithDelay: (ammo: Ammo) => void;
}
