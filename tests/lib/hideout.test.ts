import { describe, it, expect } from "vitest";
import {
  ROUBLES_ID,
  collectItemIds,
  displayName,
  formatDuration,
  levelCost,
  looksUntranslated,
  parseItems,
  parseStations,
  parseTraders,
  parseTranslations,
  translate,
  pickDefaultStation,
} from "@/lib/hideout";
import type { HideoutItem, ItemRequirement } from "@/types/hideout";

const gym = {
  id: "6377a9b9a93bde8fa30eb79a",
  name: "hideout_area_23_name",
  normalizedName: "gym",
  areaType: 23,
  imageLink: "https://assets.tarkov.dev/station-gym.png",
  levels: [
    {
      id: "6377a9b9a93bde8fa30eb79a-1",
      level: 1,
      constructionTime: 14400,
      traderRequirements: [],
      stationLevelRequirements: [
        {
          id: "6377a9b9a93bde8fa30eb79a-1-0",
          station: "637b39f02e873739ec490215",
          level: 6,
        },
      ],
      itemRequirements: [
        {
          id: "6377a9b9a93bde8fa30eb79a-1-1",
          item: "590c2e1186f77425357b6124",
          count: 1,
          attributes: { foundInRaid: true },
        },
        {
          id: "6377a9b9a93bde8fa30eb79a-1-4",
          item: "57347c77245977448d35f6e2",
          count: 5,
          attributes: { foundInRaid: false },
        },
      ],
      skillRequirements: [],
      bonuses: [],
      description: "hideout_area_23_stage_1_description",
    },
  ],
};

const vents = { ...gym, id: "vents", normalizedName: "vents", areaType: 0 };

// what `hideout_en` looks like: translation key -> text
const hideoutEn = {
  hideout_area_23_name: "Gymnasium",
  hideout_area_23_stage_1_description: "Train your physical skills.",
};

describe("looksUntranslated / displayName", () => {
  it("detects translation keys", () => {
    expect(looksUntranslated("hideout_area_23_name")).toBe(true);
    expect(looksUntranslated("54cb50c76803fa8b248b4571 Nickname")).toBe(true);
    expect(looksUntranslated("Prapor")).toBe(false);
  });

  it("falls back to a prettified normalizedName", () => {
    expect(displayName("hideout_area_23_name", "gym")).toBe("Gym");
    expect(displayName(undefined, "air-filtering-unit")).toBe(
      "Air Filtering Unit",
    );
  });

  it("keeps real names", () => {
    expect(displayName("Gym", "gym")).toBe("Gym");
  });

  it("prefers the dictionary entry", () => {
    expect(displayName("hideout_area_23_name", "gym", "x", hideoutEn)).toBe(
      "Gymnasium",
    );
  });
});

describe("translations", () => {
  it("translate only returns non-empty strings", () => {
    const t = { a: "A", b: "", c: 3 };
    expect(translate(t, "a")).toBe("A");
    expect(translate(t, "b")).toBeUndefined();
    expect(translate(t, "c")).toBeUndefined();
    expect(translate(t, "missing")).toBeUndefined();
    expect(translate(undefined, "a")).toBeUndefined();
  });

  it("parseTranslations ignores non-objects", () => {
    expect(parseTranslations(hideoutEn)).toBe(hideoutEn);
    expect(parseTranslations(null)).toEqual({});
    expect(parseTranslations([1, 2])).toEqual({});
  });
});

describe("parseStations", () => {
  it("parses an id-keyed object", () => {
    const [station] = parseStations({ [gym.id]: gym });
    expect(station.name).toBe("Gym");
    expect(station.levels).toHaveLength(1);

    const level = station.levels[0];
    expect(level.constructionTime).toBe(14400);
    // untranslated description is dropped
    expect(level.description).toBe("");
    // station references are plain ids
    expect(level.stationRequirements[0]).toEqual({
      id: "6377a9b9a93bde8fa30eb79a-1-0",
      stationId: "637b39f02e873739ec490215",
      level: 6,
    });
    // `count` + attributes.foundInRaid
    expect(level.itemRequirements[0]).toMatchObject({
      itemId: "590c2e1186f77425357b6124",
      count: 1,
      foundInRaid: true,
    });
    expect(level.itemRequirements[1]).toMatchObject({
      count: 5,
      foundInRaid: false,
    });
  });

  it("uses the dictionary for names and descriptions", () => {
    const [station] = parseStations({ [gym.id]: gym }, hideoutEn);
    expect(station.name).toBe("Gymnasium");
    expect(station.levels[0].description).toBe("Train your physical skills.");
  });

  it("accepts a { data } wrapper and a bare array", () => {
    expect(parseStations({ data: { [gym.id]: gym } })).toHaveLength(1);
    expect(parseStations([gym])).toHaveLength(1);
    expect(parseStations({ hideoutStations: [gym] })).toHaveLength(1);
  });

  it("sorts by areaType", () => {
    const stations = parseStations({ [gym.id]: gym, vents });
    expect(stations.map((s) => s.id)).toEqual(["vents", gym.id]);
  });

  it("returns [] for junk, including a translation dictionary", () => {
    expect(parseStations(null)).toEqual([]);
    expect(parseStations({})).toEqual([]);
    expect(parseStations("nope")).toEqual([]);
    // hideout_en is a key -> text map, not station data
    expect(parseStations(hideoutEn)).toEqual([]);
  });
});

describe("collectItemIds", () => {
  it("collects every referenced item id once", () => {
    const ids = collectItemIds(parseStations([gym, vents]));
    expect(ids).toEqual(
      new Set(["590c2e1186f77425357b6124", "57347c77245977448d35f6e2"]),
    );
  });
});

describe("parseTraders", () => {
  const prapor = {
    id: "54cb50c76803fa8b248b4571",
    name: "54cb50c76803fa8b248b4571 Nickname",
    normalizedName: "prapor",
    imageLink: "https://assets.tarkov.dev/54cb50c76803fa8b248b4571.webp",
  };

  it("resolves untranslated names from normalizedName", () => {
    const traders = parseTraders({ [prapor.id]: prapor });
    expect(traders.get(prapor.id)?.name).toBe("Prapor");
  });

  it("uses the dictionary when available", () => {
    const traders = parseTraders(
      { [prapor.id]: prapor },
      { "54cb50c76803fa8b248b4571 Nickname": "Prapor (Nickname)" },
    );
    expect(traders.get(prapor.id)?.name).toBe("Prapor (Nickname)");
  });
});

describe("parseItems", () => {
  const items = [
    {
      id: "590c2e1186f77425357b6124",
      name: "590c2e1186f77425357b6124 Name",
      normalizedName: "toolset",
      iconLink: "https://example.com/toolset.webp",
      low24hPrice: 100,
      avg24hPrice: 120,
    },
    { id: "other", name: "Other", normalizedName: "other" },
  ];
  const wanted = new Set(["590c2e1186f77425357b6124"]);

  it("keeps only the requested items", () => {
    const map = parseItems({ items }, wanted);
    expect(map.size).toBe(1);
    expect(map.get("590c2e1186f77425357b6124")).toEqual({
      id: "590c2e1186f77425357b6124",
      name: "Toolset",
      iconLink: "https://example.com/toolset.webp",
      lowPrice: 100,
      avgPrice: 120,
    });
  });

  it("uses the dictionary for the item name", () => {
    const map = parseItems({ items }, wanted, {
      "590c2e1186f77425357b6124 Name": "Toolset (Real Name)",
    });
    expect(map.get("590c2e1186f77425357b6124")?.name).toBe(
      "Toolset (Real Name)",
    );
  });

  it("also works for an id-keyed items object", () => {
    const keyed = Object.fromEntries(items.map((i) => [i.id, i]));
    expect(parseItems({ items: keyed }, wanted).size).toBe(1);
  });

  it("treats missing or zero prices as null", () => {
    const map = parseItems(
      { items: [{ id: "x", name: "X", low24hPrice: 0 }] },
      new Set(["x"]),
    );
    expect(map.get("x")?.lowPrice).toBeNull();
    expect(map.get("x")?.avgPrice).toBeNull();
  });
});

describe("levelCost", () => {
  const items = new Map<string, HideoutItem>([
    ["a", { id: "a", name: "A", lowPrice: 1000, avgPrice: 1200 }],
    ["b", { id: "b", name: "B", lowPrice: null, avgPrice: 500 }],
  ]);
  const req = (itemId: string, count: number): ItemRequirement => ({
    id: itemId,
    itemId,
    count,
    foundInRaid: false,
  });

  it("sums count × unit price, counts roubles 1:1, reports unknowns", () => {
    const result = levelCost(
      [req("a", 2), req("b", 1), req(ROUBLES_ID, 100000), req("zzz", 1)],
      items,
    );
    expect(result).toEqual({ total: 2000 + 500 + 100000, missing: 1 });
  });
});

describe("formatDuration", () => {
  it("formats seconds", () => {
    expect(formatDuration(0)).toBe("Instant");
    expect(formatDuration(45)).toBe("1m");
    expect(formatDuration(1800)).toBe("30m");
    expect(formatDuration(14400)).toBe("4h");
    expect(formatDuration(5400)).toBe("1h 30m");
  });
});

describe("pickDefaultStation", () => {
  const empty = {
    ...gym,
    id: "empty",
    normalizedName: "empty",
    areaType: 0,
    levels: [],
  };
  const full = { ...gym, id: "full", normalizedName: "full", areaType: 1 };

  it("skips stations without levels", () => {
    const stations = parseStations([full, empty]);
    // empty sorts first by areaType, but has nothing to show
    expect(stations[0].id).toBe("empty");
    expect(pickDefaultStation(stations)?.id).toBe("full");
  });

  it("falls back to the first station, and to undefined for none", () => {
    expect(pickDefaultStation(parseStations([empty]))?.id).toBe("empty");
    expect(pickDefaultStation([])).toBeUndefined();
  });
});
