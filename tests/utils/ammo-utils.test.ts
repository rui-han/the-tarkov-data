import { describe, it, expect } from "vitest";
import {
  filterAmmo,
  filterAndSortAmmo,
  getComparator,
  getAmmoPropertyColor,
} from "@/utils/ammo-utils";

// Build a minimal, structurally-compatible Ammo object without importing the
// (currently unexported) `Ammo` type from "@/types/ammo" — TypeScript checks
// this structurally against the function signatures we're calling.
const makeAmmo = (overrides: Record<string, unknown> = {}) => ({
  caliber: "Caliber556x45NATO",
  ammoType: "bullet",
  projectileCount: 1,
  item: {
    id: "1",
    name: "M855A1",
    inspectImageLink: "https://example.com/m855a1.png",
  },
  damage: 49,
  penetrationPower: 31,
  armorDamage: 55,
  accuracyModifier: 0,
  recoilModifier: 0,
  ...overrides,
});

describe("filterAmmo", () => {
  it("returns true when no filters are active", () => {
    expect(filterAmmo(makeAmmo() as any, "", "")).toBe(true);
  });

  it("filters by caliber only", () => {
    const ammo = makeAmmo({ caliber: "Caliber9x19PARA" }) as any;
    expect(filterAmmo(ammo, "Caliber9x19PARA", "")).toBe(true);
    expect(filterAmmo(ammo, "Caliber556x45NATO", "")).toBe(false);
  });

  it("filters by search text only, case-insensitively", () => {
    const ammo = makeAmmo({
      item: { id: "1", name: "M855A1", inspectImageLink: "" },
    }) as any;
    expect(filterAmmo(ammo, "", "m855")).toBe(true);
    expect(filterAmmo(ammo, "", "M855")).toBe(true);
    expect(filterAmmo(ammo, "", "does-not-exist")).toBe(false);
  });

  it("requires both caliber and search text to match when both are provided", () => {
    const ammo = makeAmmo({
      caliber: "Caliber556x45NATO",
      item: { id: "1", name: "M855A1", inspectImageLink: "" },
    }) as any;
    expect(filterAmmo(ammo, "Caliber556x45NATO", "m855")).toBe(true);
    expect(filterAmmo(ammo, "Caliber9x19PARA", "m855")).toBe(false);
    expect(filterAmmo(ammo, "Caliber556x45NATO", "does-not-exist")).toBe(
      false,
    );
  });
});

describe("getComparator / filterAndSortAmmo", () => {
  const ammoList = [
    makeAmmo({
      item: { id: "1", name: "Low Damage", inspectImageLink: "" },
      damage: 10,
    }),
    makeAmmo({
      item: { id: "2", name: "High Damage", inspectImageLink: "" },
      damage: 90,
    }),
    makeAmmo({
      item: { id: "3", name: "Mid Damage", inspectImageLink: "" },
      damage: 50,
    }),
  ] as any[];

  it("sorts descending by a numeric property", () => {
    const sorted = filterAndSortAmmo(ammoList, "", "", "desc", "damage");
    expect(sorted.map((a) => a.damage)).toEqual([90, 50, 10]);
  });

  it("sorts ascending by a numeric property", () => {
    const sorted = filterAndSortAmmo(ammoList, "", "", "asc", "damage");
    expect(sorted.map((a) => a.damage)).toEqual([10, 50, 90]);
  });

  it("does not mutate the original array", () => {
    const original = [...ammoList];
    filterAndSortAmmo(ammoList, "", "", "desc", "damage");
    expect(ammoList).toEqual(original);
  });

  it("never reorders by the 'item' key (names are intentionally left unsorted)", () => {
    const comparator = getComparator("asc", "item");
    const result = comparator(ammoList[0], ammoList[1]);
    // avoid the classic -0 !== 0 with `toBe` gotcha
    expect(result === 0).toBe(true);
  });
});

describe("getAmmoPropertyColor", () => {
  it("returns green for positive accuracy", () => {
    expect(getAmmoPropertyColor(5, "accuracy")).toBe("green");
  });

  it("returns red for negative accuracy", () => {
    expect(getAmmoPropertyColor(-5, "accuracy")).toBe("red");
  });

  it("returns grey for neutral accuracy", () => {
    expect(getAmmoPropertyColor(0, "accuracy")).toBe("grey");
  });

  it("returns red for positive recoil (worse)", () => {
    expect(getAmmoPropertyColor(5, "recoil")).toBe("red");
  });

  it("returns green for negative recoil (better)", () => {
    expect(getAmmoPropertyColor(-5, "recoil")).toBe("green");
  });
});
