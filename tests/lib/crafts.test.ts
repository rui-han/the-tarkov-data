import { describe, it, expect } from "vitest";
import { ROUBLES_ID } from "@/lib/hideout";
import { parseItemList } from "@/lib/items";
import {
  buildRows,
  computeEconomics,
  craftsAtLevel,
  filterCrafts,
  formatProfit,
  parseCrafts,
  sortCrafts,
} from "@/lib/crafts";
import type { Craft, CraftFilters } from "@/types/craft";
import type { HideoutStation } from "@/types/hideout";

const STATION_A = "5d484fda654e7600681d9315";
const STATION_B = "5d484fdf654e7600691aadf8";
const TASK = "5c0d4e61d09282029f53920e";

const tool = { tool: true };

// the shape of https://json.tarkov.dev/pve/crafts after the `data` envelope
const sample = [
  {
    id: "6002ed409f2c60461a2d0f5a",
    requiredItems: [
      { item: "5d4042a986f7743185265463", count: 1, attributes: tool },
      { item: "590c2d8786f774245b1f03f3", count: 1, attributes: tool },
      { item: "5af04b6486f774195a3ebb49", count: 1, attributes: tool },
      { item: "5c052f6886f7746b1e3db148", count: 1, attributes: {} },
    ],
    requiredQuestItems: [],
    station: STATION_A,
    duration: 8200,
    gameEditions: [],
    level: 2,
    productItem: { item: "5d0376a486f7747d8050965c", count: 1, attributes: {} },
  },
  {
    id: "63baedefe6ebc10fe0201083",
    requiredItems: [
      { item: "5ba2678ad4351e44f824b344", count: 120, attributes: {} },
      { item: "5af04b6486f774195a3ebb49", count: 1, attributes: tool },
      { item: "590a3d9c86f774385926e510", count: 1, attributes: tool },
      { item: "5c06782b86f77426df5407d2", count: 1, attributes: {} },
      { item: "61bf7b6302b3924be92fa8c3", count: 1, attributes: {} },
    ],
    requiredQuestItems: [],
    station: STATION_A,
    duration: 12400,
    gameEditions: [],
    level: 3,
    taskUnlock: TASK,
    productItem: {
      item: "5ba26835d4351e0035628ff5",
      count: 60,
      attributes: {},
    },
  },
  {
    id: "67da01179cbeb8d6f4011961",
    requiredItems: [
      { item: "590c2e1186f77425357b6124", count: 1, attributes: tool },
      { item: "5d4042a986f7743185265463", count: 1, attributes: tool },
      { item: "590a391c86f774385a33c404", count: 3, attributes: {} },
      { item: "6389c70ca33d8c4cdf4932c6", count: 1, attributes: {} },
      { item: "590a3b0486f7743954552bdb", count: 1, attributes: {} },
    ],
    requiredQuestItems: [],
    station: STATION_B,
    duration: 14400,
    gameEditions: [],
    level: 1,
    productItem: { item: "61bf7c024770ee6f9c6b8b53", count: 1, attributes: {} },
  },
];

describe("parseCrafts", () => {
  const [first, second, third] = parseCrafts(sample);

  it("parses every craft from the array payload", () => {
    expect(parseCrafts(sample)).toHaveLength(3);
    expect(first).toMatchObject({
      id: "6002ed409f2c60461a2d0f5a",
      stationId: STATION_A,
      stationLevel: 2,
      duration: 8200,
      productItemId: "5d0376a486f7747d8050965c",
      productCount: 1,
      taskUnlockId: null,
    });
    expect(third).toMatchObject({ stationId: STATION_B, stationLevel: 1 });
  });

  it("separates consumed ingredients from tools", () => {
    expect(first.ingredients).toEqual([
      { itemId: "5c052f6886f7746b1e3db148", count: 1 },
    ]);
    expect(first.tools.map((t) => t.itemId)).toEqual([
      "5d4042a986f7743185265463",
      "590c2d8786f774245b1f03f3",
      "5af04b6486f774195a3ebb49",
    ]);
    expect(second.ingredients).toHaveLength(3);
    expect(second.ingredients[0]).toEqual({
      itemId: "5ba2678ad4351e44f824b344",
      count: 120,
    });
    expect(second.tools).toHaveLength(2);
  });

  it("reads the product count and the unlocking task", () => {
    expect(second.productCount).toBe(60);
    expect(second.taskUnlockId).toBe(TASK);
  });

  it("recognises tools given as an attribute list", () => {
    const [craft] = parseCrafts([
      {
        id: "x",
        station: STATION_A,
        productItem: { item: "p", count: 1 },
        requiredItems: [
          {
            item: "t",
            count: 1,
            attributes: [{ name: "tool", value: "true" }],
          },
          { item: "i", count: 2, attributes: [] },
        ],
      },
    ]);
    expect(craft.tools).toEqual([{ itemId: "t", count: 1 }]);
    expect(craft.ingredients).toEqual([{ itemId: "i", count: 2 }]);
  });

  it("accepts wrapped payloads", () => {
    expect(parseCrafts({ crafts: sample })).toHaveLength(3);
    expect(parseCrafts({ data: sample })).toHaveLength(3);
  });

  it("skips junk entries", () => {
    expect(parseCrafts(null)).toEqual([]);
    expect(parseCrafts({})).toEqual([]);
    expect(
      parseCrafts([
        null,
        5,
        { id: "no-product" },
        { id: "no-item", productItem: { count: 1 } },
        { productItem: { item: "p" } },
      ]),
    ).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/* economics                                                          */
/* ------------------------------------------------------------------ */

const raw = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  name: id,
  normalizedName: id,
  types: ["barter"],
  ...overrides,
});

const items = new Map(
  parseItemList({
    items: [
      raw("ing", { lastLowPrice: 1000 }),
      raw("tool", { lastLowPrice: 99999 }),
      raw("prod", { lastLowPrice: 1000 }),
      raw("noflea", {
        types: ["noFlea"],
        sellToTrader: [{ trader: "t", priceRUB: 400 }],
      }),
      raw("avgonly", { avg24hPrice: 700 }),
    ],
  }).map((item) => [item.id, item]),
);

const craft = (overrides: Partial<Craft> = {}): Craft => ({
  id: "c",
  stationId: STATION_A,
  stationLevel: 1,
  duration: 3600,
  ingredients: [],
  tools: [],
  productItemId: "prod",
  productCount: 1,
  taskUnlockId: null,
  ...overrides,
});

describe("computeEconomics", () => {
  it("sums ingredients, counts roubles 1:1 and ignores tools", () => {
    const econ = computeEconomics(
      craft({
        ingredients: [
          { itemId: "ing", count: 2 },
          { itemId: ROUBLES_ID, count: 500 },
        ],
        tools: [{ itemId: "tool", count: 1 }],
        productItemId: "prod",
        productCount: 3,
        duration: 1800,
      }),
      items,
    );
    expect(econ).toEqual({
      cost: 2500,
      missingPrices: 0,
      value: 3000,
      profit: 500,
      profitPerHour: 1000,
    });
  });

  it("has no cost or profit when an ingredient has no price", () => {
    const econ = computeEconomics(
      craft({ ingredients: [{ itemId: "ghost", count: 1 }] }),
      items,
    );
    expect(econ.cost).toBeNull();
    expect(econ.missingPrices).toBe(1);
    expect(econ.profit).toBeNull();
    expect(econ.profitPerHour).toBeNull();
    // the product is still worth something
    expect(econ.value).toBe(1000);
  });

  it("falls back to the 24h average, then to the trader price", () => {
    expect(
      computeEconomics(craft({ productItemId: "avgonly" }), items).value,
    ).toBe(700);
    expect(
      computeEconomics(craft({ productItemId: "noflea" }), items).value,
    ).toBe(400);
  });

  it("has no hourly profit for an instant craft", () => {
    const econ = computeEconomics(
      craft({ ingredients: [{ itemId: "ing", count: 1 }], duration: 0 }),
      items,
    );
    expect(econ.profit).toBe(0);
    expect(econ.profitPerHour).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/* filter & sort                                                      */
/* ------------------------------------------------------------------ */

const stations = new Map<string, HideoutStation>([
  [
    STATION_A,
    {
      id: STATION_A,
      name: "Workbench",
      normalizedName: "workbench",
      areaType: 10,
      levels: [],
    },
  ],
  [
    STATION_B,
    {
      id: STATION_B,
      name: "Lavatory",
      normalizedName: "lavatory",
      areaType: 2,
      levels: [],
    },
  ],
]);

const rows = buildRows(
  [
    // cost 1000, value 1000 -> profit 0
    craft({ id: "a", ingredients: [{ itemId: "ing", count: 1 }] }),
    // cost 1000, value 5000 -> profit 4000, locked behind a task, other station
    craft({
      id: "b",
      stationId: STATION_B,
      productCount: 5,
      ingredients: [{ itemId: "ing", count: 1 }],
      taskUnlockId: "t1",
    }),
    // an ingredient has no price -> profit unknown
    craft({
      id: "c",
      productItemId: "avgonly",
      ingredients: [{ itemId: "ghost", count: 1 }],
    }),
  ],
  items,
  stations,
);
const ids = (list: { craft: { id: string } }[]) => list.map((r) => r.craft.id);

describe("buildRows", () => {
  it("joins product and station names", () => {
    expect(rows[0]).toMatchObject({
      productName: "prod",
      stationName: "Workbench",
    });
    expect(rows[1].stationName).toBe("Lavatory");
  });

  it("falls back to placeholders for unknown ids", () => {
    const [row] = buildRows(
      [craft({ productItemId: "nope", stationId: "nowhere" })],
      items,
      stations,
    );
    expect(row).toMatchObject({
      productName: "Unknown item",
      stationName: "Unknown station",
    });
  });
});

describe("filterCrafts", () => {
  const base: CraftFilters = {
    query: "",
    stationId: "",
    profitableOnly: false,
    hideTaskLocked: false,
  };

  it("returns everything without filters", () => {
    expect(filterCrafts(rows, base)).toHaveLength(3);
  });

  it("searches the product and the materials, requiring every word", () => {
    expect(ids(filterCrafts(rows, { ...base, query: "avgonly" }))).toEqual([
      "c",
    ]);
    expect(ids(filterCrafts(rows, { ...base, query: "ing" }))).toEqual([
      "a",
      "b",
    ]);
    expect(filterCrafts(rows, { ...base, query: "ing avgonly" })).toHaveLength(
      0,
    );
  });

  it("filters by station, profit and task lock", () => {
    expect(ids(filterCrafts(rows, { ...base, stationId: STATION_B }))).toEqual([
      "b",
    ]);
    expect(ids(filterCrafts(rows, { ...base, profitableOnly: true }))).toEqual([
      "b",
    ]);
    expect(ids(filterCrafts(rows, { ...base, hideTaskLocked: true }))).toEqual([
      "a",
      "c",
    ]);
  });
});

describe("sortCrafts", () => {
  it("sorts by hourly profit, unknown values always last", () => {
    expect(ids(sortCrafts(rows, "profitPerHour", "desc"))).toEqual([
      "b",
      "a",
      "c",
    ]);
    expect(ids(sortCrafts(rows, "profitPerHour", "asc"))).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("sorts by product name", () => {
    expect(ids(sortCrafts(rows, "product", "asc"))[0]).toBe("c");
  });

  it("does not mutate the input", () => {
    const before = ids(rows);
    sortCrafts(rows, "profit", "desc");
    expect(ids(rows)).toEqual(before);
  });
});

describe("formatProfit", () => {
  it("formats signed amounts", () => {
    expect(formatProfit(1500)).toBe("+1,500 ₽");
    expect(formatProfit(-250)).toBe("-250 ₽");
    expect(formatProfit(0)).toBe("0 ₽");
    expect(formatProfit(-0.4)).toBe("0 ₽");
    expect(formatProfit(null)).toBe("—");
  });
});

describe("craftsAtLevel", () => {
  const list = [
    craft({ id: "a", stationId: STATION_A, stationLevel: 2 }),
    craft({ id: "b", stationId: STATION_A, stationLevel: 3 }),
    craft({ id: "c", stationId: STATION_B, stationLevel: 2 }),
  ];

  it("keeps crafts of that station and level only", () => {
    expect(craftsAtLevel(list, STATION_A, 2).map((c) => c.id)).toEqual(["a"]);
    expect(craftsAtLevel(list, STATION_B, 3)).toEqual([]);
  });
});
