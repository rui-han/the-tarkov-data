import { describe, it, expect } from "vitest";
import {
  categoryOf,
  filterItems,
  formatChange,
  listCategories,
  parseItemList,
  sortItems,
  typeLabel,
} from "@/lib/items";

const ID = "5447ac644bdc2d6c208b4567";

const ammoBox = {
  id: ID,
  name: `${ID} Name`,
  shortName: `${ID} ShortName`,
  normalizedName: "556x45mm-m855-ammo-pack-50-pcs",
  weight: 0.01,
  types: ["ammoBox"],
  wikiLink: "https://example.com/wiki",
  iconLink: "https://example.com/icon.webp",
  gridImageLink: "https://example.com/grid.webp",
  lastLowPrice: 35000,
  avg24hPrice: 48727,
  changeLast48hPercent: -19.31,
  sellToTrader: [
    {
      trader: "579dc571d53a0658a154fbec",
      price: 240,
      priceRUB: 240,
      currency: "RUB",
    },
    {
      trader: "5a7c2eca46aef81a7ca2145d",
      price: 450,
      priceRUB: 450,
      currency: "RUB",
    },
  ],
};

const raw = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  name: id,
  normalizedName: id,
  types: ["barter"],
  ...overrides,
});

describe("categories", () => {
  it("labels camelCase types", () => {
    expect(typeLabel("ammoBox")).toBe("Ammo Box");
    expect(typeLabel("gun")).toBe("Gun");
  });

  it("skips flag types", () => {
    expect(categoryOf(["noFlea", "gun"])).toBe("Gun");
    expect(categoryOf(["preset", "wearable"])).toBe("Other");
    expect(categoryOf([])).toBe("Other");
  });
});

describe("parseItemList", () => {
  it("parses the id-keyed payload", () => {
    const [item] = parseItemList({ items: { [ID]: ammoBox } });
    expect(item).toMatchObject({
      id: ID,
      // untranslated -> prettified normalizedName
      name: "556x45mm M855 Ammo Pack 50 Pcs",
      shortName: "",
      category: "Ammo Box",
      weight: 0.01,
      noFlea: false,
      lastLowPrice: 35000,
      avg24hPrice: 48727,
      changeLast48hPercent: -19.31,
      wikiLink: "https://example.com/wiki",
    });
  });

  it("picks the best trader sell price", () => {
    const [item] = parseItemList({ items: { [ID]: ammoBox } });
    expect(item.bestSell).toEqual({
      traderId: "5a7c2eca46aef81a7ca2145d",
      price: 450,
    });
  });

  it("uses the translation dictionary", () => {
    const [item] = parseItemList(
      { items: { [ID]: ammoBox } },
      {
        [`${ID} Name`]: "5.56x45mm M855 ammo pack (50 pcs)",
        [`${ID} ShortName`]: "M855 pack",
      },
    );
    expect(item.name).toBe("5.56x45mm M855 ammo pack (50 pcs)");
    expect(item.shortName).toBe("M855 pack");
    expect(item.searchText).toContain("m855 pack");
  });

  it("accepts an array and skips junk entries", () => {
    expect(parseItemList([ammoBox, null, { name: "no id" }, 5])).toHaveLength(
      1,
    );
    expect(parseItemList(null)).toEqual([]);
  });

  it("treats zero/missing prices as null and detects noFlea", () => {
    const [item] = parseItemList({
      items: [raw("x", { lastLowPrice: 0, types: ["noFlea", "keys"] })],
    });
    expect(item.lastLowPrice).toBeNull();
    expect(item.bestSell).toBeNull();
    expect(item.noFlea).toBe(true);
    expect(item.category).toBe("Keys");
  });
});

describe("filterItems", () => {
  const items = parseItemList({
    items: [
      ammoBox,
      raw("a", {
        name: "Salewa FAK",
        normalizedName: "salewa-fak",
        types: ["meds"],
      }),
    ],
  });

  it("returns everything without filters", () => {
    expect(filterItems(items, "", "")).toHaveLength(2);
  });

  it("requires every word to match", () => {
    expect(filterItems(items, "m855 pack", "")).toHaveLength(1);
    expect(filterItems(items, "m855 fak", "")).toHaveLength(0);
  });

  it("filters by category", () => {
    expect(filterItems(items, "", "Meds").map((i) => i.id)).toEqual(["a"]);
  });
});

describe("listCategories", () => {
  it("counts and sorts categories", () => {
    const items = parseItemList({
      items: [
        raw("1", { types: ["meds"] }),
        raw("2", { types: ["meds"] }),
        raw("3", { types: ["gun"] }),
      ],
    });
    expect(listCategories(items)).toEqual([
      { label: "Gun", count: 1 },
      { label: "Meds", count: 2 },
    ]);
  });
});

describe("sortItems", () => {
  const items = parseItemList({
    items: [
      raw("a", { lastLowPrice: 100 }),
      raw("b"), // no price
      raw("c", { lastLowPrice: 300 }),
    ],
  });
  const ids = (list: { id: string }[]) => list.map((i) => i.id);

  it("sorts numerically in both directions", () => {
    expect(ids(sortItems(items, "lastLowPrice", "desc"))).toEqual([
      "c",
      "a",
      "b",
    ]);
    expect(ids(sortItems(items, "lastLowPrice", "asc"))).toEqual([
      "a",
      "c",
      "b",
    ]);
  });

  it("always puts missing values last", () => {
    expect(ids(sortItems(items, "lastLowPrice", "asc")).at(-1)).toBe("b");
    expect(ids(sortItems(items, "lastLowPrice", "desc")).at(-1)).toBe("b");
  });

  it("sorts by name ignoring case and does not mutate the input", () => {
    const named = parseItemList({
      items: [raw("1", { name: "beta" }), raw("2", { name: "Alpha" })],
    });
    const before = ids(named);
    expect(ids(sortItems(named, "name", "asc"))).toEqual(["2", "1"]);
    expect(ids(named)).toEqual(before);
  });

  it("sorts by best trader sell price", () => {
    const sellers = parseItemList({
      items: [
        raw("low", { sellToTrader: [{ trader: "t", priceRUB: 10 }] }),
        raw("high", { sellToTrader: [{ trader: "t", priceRUB: 99 }] }),
      ],
    });
    expect(ids(sortItems(sellers, "bestSellPrice", "desc"))).toEqual([
      "high",
      "low",
    ]);
  });
});

describe("formatChange", () => {
  it("formats signed percentages", () => {
    expect(formatChange(-19.31)).toBe("-19.3%");
    expect(formatChange(4)).toBe("+4.0%");
    expect(formatChange(0)).toBe("0.0%");
    expect(formatChange(null)).toBe("—");
  });
});
