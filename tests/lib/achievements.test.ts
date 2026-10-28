import { describe, it, expect } from "vitest";
import {
  filterAchievements,
  formatPercent,
  listRarities,
  listSides,
  parseAchievements,
  rarityRank,
  sideLabel,
  sortAchievements,
} from "@/lib/achievements";
import type { AchievementFilters } from "@/types/achievement";

const FRIEND = "6512ea46f7a078264a4376e4";
const KILLER = "6512f16bde333c33d5127cbc";

const friend = {
  id: FRIEND,
  name: `${FRIEND} name`,
  normalizedName: "pmcs-best-friend",
  description: `${FRIEND} description`,
  hidden: false,
  side: "Pmc",
  normalizedSide: "pmc",
  rarity: "Achievements/Tab/CommonRarity",
  normalizedRarity: "common",
  playersCompletedPercent: 2.13,
  adjustedPlayersCompletedPercent: 4.33,
  imageLink: "https://assets.tarkov.dev/achievement-icon.webp",
};

const killer = {
  ...friend,
  id: KILLER,
  name: `${KILLER} name`,
  normalizedName: "killer-of-killers",
  description: `${KILLER} description`,
  hidden: true,
  playersCompletedPercent: 0.09,
  adjustedPlayersCompletedPercent: 0.18,
};

const raw = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  name: id,
  normalizedName: id,
  description: "",
  hidden: false,
  side: "Pmc",
  normalizedSide: "pmc",
  rarity: "x",
  normalizedRarity: "common",
  playersCompletedPercent: 1,
  adjustedPlayersCompletedPercent: 2,
  ...overrides,
});

const parse = (list: unknown[]) => parseAchievements({ achievements: list });
const ids = (list: { id: string }[]) => list.map((a) => a.id);

describe("parseAchievements", () => {
  it("reads the achievements out of the tasks payload", () => {
    const data = {
      tasks: { t1: { id: "t1" } },
      achievements: { [FRIEND]: friend },
    };
    const [a] = parseAchievements(data);
    expect(a).toMatchObject({
      id: FRIEND,
      // untranslated -> prettified normalizedName
      name: "Pmcs Best Friend",
      description: "",
      hidden: false,
      side: "PMC",
      normalizedSide: "pmc",
      // the localization key is never shown
      rarity: "Common",
      normalizedRarity: "common",
      playersCompletedPercent: 2.13,
      adjustedPlayersCompletedPercent: 4.33,
    });
  });

  it("uses the translation dictionary", () => {
    const [a] = parseAchievements(
      { achievements: { [FRIEND]: friend } },
      {
        [`${FRIEND} name`]: "PMC's Best Friend",
        [`${FRIEND} description`]: "Kill a Scav with a pet.",
        "Achievements/Tab/CommonRarity": "Common achievements",
      },
    );
    expect(a.name).toBe("PMC's Best Friend");
    expect(a.description).toBe("Kill a Scav with a pet.");
    expect(a.rarity).toBe("Common achievements");
    expect(a.searchText).toContain("kill a scav");
  });

  it("marks hidden achievements", () => {
    expect(parse([killer])[0].hidden).toBe(true);
  });

  it("accepts a bare array and skips junk entries", () => {
    expect(
      parseAchievements([friend, null, { name: "no id" }, 7]),
    ).toHaveLength(1);
  });

  it("returns [] when there are no achievements, or for a dictionary", () => {
    expect(parseAchievements(null)).toEqual([]);
    expect(parseAchievements({ tasks: { t1: { id: "t1" } } })).toEqual([]);
    // tasks_en is a key -> text map, not achievement data
    expect(parseAchievements({ [`${FRIEND} name`]: "x" })).toEqual([]);
  });

  it("treats missing percentages as null", () => {
    const [a] = parse([raw("x", { playersCompletedPercent: null })]);
    expect(a.playersCompletedPercent).toBeNull();
  });
});

describe("labels", () => {
  it("ranks rarities, unknown last", () => {
    expect(rarityRank("common")).toBe(0);
    expect(rarityRank("Legendary")).toBe(2);
    expect(rarityRank("mythic")).toBeGreaterThan(rarityRank("legendary"));
  });

  it("builds side labels", () => {
    expect(sideLabel("pmc", "Pmc")).toBe("PMC");
    expect(sideLabel("scavs", "")).toBe("Scav");
    expect(sideLabel("scav", "")).toBe("Scav");
    expect(sideLabel("all", "")).toBe("All");
    expect(sideLabel("", "")).toBe("Unknown");
  });
});

describe("filterAchievements", () => {
  const items = parse([
    raw("a", { name: "Debut Run", description: "Kill ten Scavs" }),
    raw("b", {
      name: "Ghost Job",
      description: "Stay unseen",
      hidden: true,
      normalizedRarity: "rare",
      normalizedSide: "scav",
    }),
    raw("c", { name: "Collector", normalizedRarity: "legendary" }),
  ]);
  const base: AchievementFilters = {
    query: "",
    rarity: "",
    side: "",
    visibility: "all",
  };

  it("returns everything without filters", () => {
    expect(filterAchievements(items, base)).toHaveLength(3);
  });

  it("searches name and description, requiring every word", () => {
    expect(
      ids(filterAchievements(items, { ...base, query: "ten scavs" })),
    ).toEqual(["a"]);
    expect(
      ids(filterAchievements(items, { ...base, query: "ghost unseen" })),
    ).toEqual(["b"]);
    expect(
      filterAchievements(items, { ...base, query: "debut ghost" }),
    ).toHaveLength(0);
  });

  it("filters by rarity, side and visibility", () => {
    expect(ids(filterAchievements(items, { ...base, rarity: "rare" }))).toEqual(
      ["b"],
    );
    expect(ids(filterAchievements(items, { ...base, side: "scav" }))).toEqual([
      "b",
    ]);
    expect(
      ids(filterAchievements(items, { ...base, visibility: "hidden" })),
    ).toEqual(["b"]);
    expect(
      ids(filterAchievements(items, { ...base, visibility: "visible" })),
    ).toEqual(["a", "c"]);
  });
});

describe("listRarities / listSides", () => {
  const items = parse([
    raw("1", { normalizedRarity: "legendary" }),
    raw("2", { normalizedRarity: "common" }),
    raw("3", { normalizedRarity: "common", normalizedSide: "scav" }),
    raw("4", { normalizedRarity: "rare" }),
  ]);

  it("lists rarities in rank order with counts", () => {
    expect(listRarities(items)).toEqual([
      { value: "common", label: "Common", count: 2 },
      { value: "rare", label: "Rare", count: 1 },
      { value: "legendary", label: "Legendary", count: 1 },
    ]);
  });

  it("lists sides alphabetically", () => {
    expect(listSides(items).map((o) => [o.label, o.count])).toEqual([
      ["PMC", 3],
      ["Scav", 1],
    ]);
  });
});

describe("sortAchievements", () => {
  const items = parse([
    raw("b", {
      name: "Bravo",
      playersCompletedPercent: 5,
      normalizedRarity: "rare",
    }),
    raw("a", {
      name: "Alpha",
      playersCompletedPercent: 20,
      normalizedRarity: "common",
    }),
    raw("n", {
      name: "NoData",
      playersCompletedPercent: null,
      normalizedRarity: "legendary",
    }),
  ]);

  it("sorts by completion, missing values always last", () => {
    expect(
      ids(sortAchievements(items, "playersCompletedPercent", "asc")),
    ).toEqual(["b", "a", "n"]);
    expect(
      ids(sortAchievements(items, "playersCompletedPercent", "desc")),
    ).toEqual(["a", "b", "n"]);
  });

  it("sorts rarity by rank, not alphabetically", () => {
    // alphabetical would be common, legendary, rare
    expect(ids(sortAchievements(items, "rarity", "asc"))).toEqual([
      "a",
      "b",
      "n",
    ]);
    expect(ids(sortAchievements(items, "rarity", "desc"))).toEqual([
      "n",
      "b",
      "a",
    ]);
  });

  it("sorts by name and does not mutate the input", () => {
    const before = ids(items);
    expect(ids(sortAchievements(items, "name", "asc"))).toEqual([
      "a",
      "b",
      "n",
    ]);
    expect(ids(items)).toEqual(before);
  });
});

describe("formatPercent", () => {
  it("keeps two decimals below 1%", () => {
    expect(formatPercent(0.09)).toBe("0.09%");
    expect(formatPercent(2.13)).toBe("2.1%");
    expect(formatPercent(14)).toBe("14.0%");
    expect(formatPercent(null)).toBe("—");
  });
});
