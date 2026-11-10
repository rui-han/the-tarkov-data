import { describe, it, expect } from "vitest";
import { armorClassOf, parseAmmo } from "@/lib/ammo";

const ID = "5c0d5e4486f77478390952fe";

const raw = (
  id: string,
  props: Record<string, unknown> = {},
  overrides: Record<string, unknown> = {},
) => ({
  id,
  name: `${id} Name`,
  shortName: `${id} ShortName`,
  normalizedName: "556x45mm-m855a1",
  types: ["ammo"],
  iconLink: "https://example.com/icon.webp",
  inspectImageLink: "https://example.com/inspect.webp",
  lastLowPrice: 120,
  properties: {
    caliber: "Caliber556x45NATO",
    ammoType: "bullet",
    projectileCount: 1,
    damage: 49,
    penetrationPower: 44,
    armorDamage: 55,
    accuracyModifier: 0,
    recoilModifier: 0,
    ...props,
  },
  ...overrides,
});

describe("armorClassOf", () => {
  it("is penetration / 10, from 0 to 6", () => {
    expect(armorClassOf(9)).toBe(0);
    expect(armorClassOf(10)).toBe(1);
    expect(armorClassOf(44)).toBe(4);
    expect(armorClassOf(59)).toBe(5);
    expect(armorClassOf(60)).toBe(6);
    expect(armorClassOf(95)).toBe(6);
    expect(armorClassOf(0)).toBe(0);
  });
});

describe("parseAmmo", () => {
  it("parses the id-keyed payload with the old-style name as a fallback", () => {
    const [a] = parseAmmo({ items: { [ID]: raw(ID) } });
    expect(a).toMatchObject({
      caliber: "Caliber556x45NATO",
      ammoType: "bullet",
      projectileCount: 1,
      damage: 49,
      penetrationPower: 44,
      armorClass: 4,
      armorDamage: 55,
      fleaPrice: 120,
      shortName: "",
      iconLink: "https://example.com/icon.webp",
    });
    // untranslated -> normalizedName in upper case
    expect(a.item).toEqual({
      id: ID,
      name: "556X45MM M855A1",
      inspectImageLink: "https://example.com/inspect.webp",
    });
  });

  it("uses the translation dictionary for names and searching", () => {
    const [a] = parseAmmo(
      { items: { [ID]: raw(ID) } },
      {
        [`${ID} Name`]: "5.56x45mm M855A1",
        [`${ID} ShortName`]: "M855A1",
      },
    );
    expect(a.item.name).toBe("5.56x45mm M855A1");
    expect(a.shortName).toBe("M855A1");
    expect(a.searchText).toContain("5.56x45mm m855a1");
    expect(a.searchText).toContain("556x45mm m855a1");
  });

  it("turns shotgun gauges into 12/70 and 20/70", () => {
    const [a] = parseAmmo({
      items: [raw(ID, {}, { normalizedName: "1270-7mm-buckshot" })],
    });
    expect(a.item.name).toBe("12/70 7MM BUCKSHOT");
  });

  it("only keeps ammo that has properties", () => {
    const list = parseAmmo({
      items: [
        raw("a"),
        raw("box", {}, { types: ["ammoBox"] }),
        raw("noprops", {}, { properties: null }),
        raw("barter", {}, { types: ["barter"] }),
      ],
    });
    expect(list.map((a) => a.item.id)).toEqual(["a"]);
  });

  it("falls back to sensible defaults", () => {
    const [a] = parseAmmo({
      items: [
        raw("x", {
          ammoType: undefined,
          projectileCount: undefined,
          damage: undefined,
        }),
      ],
    });
    expect(a).toMatchObject({
      ammoType: "bullet",
      projectileCount: 1,
      damage: 0,
    });
  });

  it("treats a missing or zero flea price as null", () => {
    const list = parseAmmo({
      items: [
        raw("a", {}, { lastLowPrice: 0 }),
        raw("b", {}, { lastLowPrice: undefined }),
      ],
    });
    expect(list.map((a) => a.fleaPrice)).toEqual([null, null]);
  });

  it("accepts an array and skips junk entries", () => {
    expect(parseAmmo([raw("a"), null, { name: "no id" }, 5])).toHaveLength(1);
    expect(parseAmmo(null)).toEqual([]);
  });
});
