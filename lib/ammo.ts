import { toArray } from "@/lib/tarkovApi";
import { looksUntranslated, translate, type Translations } from "@/lib/hideout";
import type { Ammo } from "@/types/ammo";

type UnknownRecord = Record<string, unknown>;

const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const num = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;
const positiveOrNull = (v: unknown): number | null =>
  typeof v === "number" && v > 0 ? v : null;

/**
 * Rule of thumb for comparing rounds: the highest armor class (1 to 6) whose
 * resistance, class x 10, the penetration power reaches. 0 means below class 1.
 * This is NOT a penetration chance: the real chance also depends on the
 * armor's remaining durability.
 */
export function armorClassOf(penetrationPower: number): number {
  return Math.min(6, Math.max(0, Math.floor(penetrationPower / 10)));
}

/**
 * "Caliber556x45NATO" -> "556x45 NATO". A single trailing letter stays
 * attached ("762x54R"), and names without an "x" size are left alone.
 */
export function caliberLabel(caliber: string): string {
  return caliber
    .replace(/^Caliber/, "")
    .replace(/(x\d+)([A-Za-z]{2,})$/, "$1 $2");
}

/** Name used until (or without) the translation dictionary. */
function fallbackName(normalizedName: string): string {
  return normalizedName
    .replaceAll("-", " ")
    .replaceAll("1270", "12/70")
    .replaceAll("2070", "20/70")
    .toUpperCase();
}

/**
 * Ammo is part of the items payload: an item whose `types` contain "ammo" and
 * that has `properties`. Names come from the `items_en` dictionary when it is
 * available.
 */
export function parseAmmo(data: unknown, translations?: Translations): Ammo[] {
  const inner = isRecord(data) && data.items != null ? data.items : data;
  const ammo: Ammo[] = [];

  for (const raw of toArray<unknown>(inner)) {
    if (!isRecord(raw) || typeof raw.id !== "string") continue;

    const types = Array.isArray(raw.types) ? raw.types : [];
    const props = isRecord(raw.properties) ? raw.properties : null;
    if (!props || !types.includes("ammo")) continue;

    const normalizedName = str(raw.normalizedName);
    const rawName = str(raw.name);
    const name =
      translate(translations, rawName) ??
      (looksUntranslated(rawName)
        ? fallbackName(normalizedName) || raw.id
        : rawName);

    const rawShort = str(raw.shortName);
    const shortName =
      translate(translations, rawShort) ??
      (looksUntranslated(rawShort) ? "" : rawShort);

    const penetrationPower = num(props.penetrationPower);

    ammo.push({
      caliber: str(props.caliber),
      ammoType: str(props.ammoType) || "bullet",
      projectileCount: num(props.projectileCount, 1),
      item: {
        id: raw.id,
        name,
        inspectImageLink: str(raw.inspectImageLink),
      },
      shortName,
      iconLink: str(raw.iconLink) || str(raw.gridImageLink),
      damage: num(props.damage),
      penetrationPower,
      armorClass: armorClassOf(penetrationPower),
      armorDamage: num(props.armorDamage),
      accuracyModifier: num(props.accuracyModifier),
      recoilModifier: num(props.recoilModifier),
      fleaPrice: positiveOrNull(raw.lastLowPrice),
      searchText: `${name} ${shortName} ${normalizedName.replace(
        /-/g,
        " ",
      )}`.toLowerCase(),
    });
  }

  return ammo;
}
