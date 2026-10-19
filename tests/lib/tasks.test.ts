import { describe, it, expect } from "vitest";
import {
  ANY_MAP,
  filterTasks,
  formatStanding,
  objectiveText,
  parseMaps,
  parseTasks,
  sortTasks,
} from "@/lib/tasks";
import { ROUBLES_ID } from "@/lib/hideout";
import type { TaskFilters, TaskLabels } from "@/types/task";

const ID = "657315ddab5a49b71f098853";
const TRADER = "54cb57776803fa99248b456e";
const GROUND_ZERO = "653e6760052c01c1c805532f";

const firstInLine = {
  id: ID,
  name: `${ID} name`,
  trader: TRADER,
  wikiLink: "https://example.com/First_in_Line",
  minPlayerLevel: 1,
  taskRequirements: [],
  traderRequirements: [],
  objectives: [
    {
      id: "65732ac3c67dcd96adffa3c7",
      description: "65732ac3c67dcd96adffa3c7",
      type: "visit",
      optional: false,
      maps: [GROUND_ZERO, "65b8d6f5cdde2479cb2a3125"],
    },
    {
      id: "65817bf31404f3565aef9fec",
      description: "65817bf31404f3565aef9fec",
      type: "giveItem",
      count: 3,
      optional: false,
      items: ["a", "b", "c", "d"],
      foundInRaid: true,
    },
  ],
  finishRewards: {
    traderStanding: [{ standing: 0.1, trader: TRADER }],
    items: [{ item: ROUBLES_ID, count: 80000, attributes: {} }],
    offerUnlock: [],
    craftUnlock: [{}, {}],
  },
  experience: 3000,
  factionName: "Any",
  normalizedName: "first-in-line",
  kappaRequired: false,
  lightkeeperRequired: false,
  taskImageLink: "https://assets.tarkov.dev/657315ddab5a49b71f098853.webp",
  map: GROUND_ZERO,
};

const raw = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  name: id,
  normalizedName: id,
  trader: TRADER,
  minPlayerLevel: 1,
  experience: 0,
  ...overrides,
});

describe("parseTasks", () => {
  it("parses the id-keyed payload", () => {
    const [task] = parseTasks({ tasks: { [ID]: firstInLine } });
    expect(task).toMatchObject({
      id: ID,
      // untranslated -> prettified normalizedName
      name: "First In Line",
      traderId: TRADER,
      mapId: GROUND_ZERO,
      minPlayerLevel: 1,
      experience: 3000,
      kappaRequired: false,
      lightkeeperRequired: false,
      factionName: "Any",
      wikiLink: "https://example.com/First_in_Line",
    });
    expect(task.searchText).toContain("first in line");
  });

  it("uses the translation dictionary", () => {
    const [task] = parseTasks(
      { tasks: { [ID]: firstInLine } },
      { [`${ID} name`]: "First in Line" },
    );
    expect(task.name).toBe("First in Line");
  });

  it("treats a missing map as null", () => {
    const [task] = parseTasks({ tasks: [raw("x", { map: null })] });
    expect(task.mapId).toBeNull();
  });

  it("parses prerequisites given as ids or objects", () => {
    const [task] = parseTasks({
      tasks: [
        raw("x", {
          taskRequirements: [
            { task: "t1", status: ["complete"] },
            { task: { id: "t2" } },
          ],
          traderRequirements: [{ trader: "tr", level: 2 }],
        }),
      ],
    });
    expect(task.taskRequirements).toEqual([
      { taskId: "t1", status: ["complete"] },
      { taskId: "t2", status: [] },
    ]);
    expect(task.traderRequirements).toEqual([{ traderId: "tr", level: 2 }]);
  });

  it("skips junk entries, including a translation dictionary", () => {
    expect(parseTasks(null)).toEqual([]);
    expect(parseTasks({})).toEqual([]);
    expect(parseTasks([firstInLine, null, { name: "no id" }, 5])).toHaveLength(
      1,
    );
    // tasks_en is a key -> text map, not task data
    expect(parseTasks({ [`${ID} name`]: "First in Line" })).toEqual([]);
  });
});

describe("objectives", () => {
  const [task] = parseTasks({ tasks: { [ID]: firstInLine } });
  const [visit, give] = task.objectives;

  it("parses fields", () => {
    expect(visit).toMatchObject({ type: "visit", description: "" });
    expect(visit.mapIds).toHaveLength(2);
    expect(give).toMatchObject({
      type: "giveItem",
      count: 3,
      foundInRaid: true,
      optional: false,
    });
    expect(give.itemIds).toEqual(["a", "b", "c", "d"]);
  });

  it("falls back to a label built from the type", () => {
    expect(objectiveText(visit)).toBe("Visit");
    expect(objectiveText(give)).toBe("Give Item ×3");
  });

  it("uses the dictionary entry keyed by the objective id", () => {
    const [translated] = parseTasks(
      { tasks: { [ID]: firstInLine } },
      { "65732ac3c67dcd96adffa3c7": "Locate the medical area" },
    );
    expect(objectiveText(translated.objectives[0])).toBe(
      "Locate the medical area",
    );
  });
});

describe("rewards", () => {
  it("parses standing, items and unlock counts", () => {
    const [task] = parseTasks({ tasks: { [ID]: firstInLine } });
    expect(task.rewards.traderStanding).toEqual([
      { traderId: TRADER, standing: 0.1 },
    ]);
    expect(task.rewards.items).toEqual([{ itemId: ROUBLES_ID, count: 80000 }]);
    expect(task.rewards.unlocks).toEqual(["2 crafts"]);
  });

  it("is empty for tasks without finishRewards", () => {
    const [task] = parseTasks({ tasks: [raw("x")] });
    expect(task.rewards).toEqual({
      traderStanding: [],
      items: [],
      unlocks: [],
    });
  });

  it("formats standing with a sign", () => {
    expect(formatStanding(0.1)).toBe("+0.10");
    expect(formatStanding(-0.05)).toBe("-0.05");
  });
});

describe("parseMaps", () => {
  it("resolves names via the dictionary or normalizedName", () => {
    const data = {
      maps: {
        [GROUND_ZERO]: {
          id: GROUND_ZERO,
          name: `${GROUND_ZERO} Name`,
          normalizedName: "ground-zero",
        },
      },
    };
    expect(parseMaps(data).get(GROUND_ZERO)?.name).toBe("Ground Zero");
    expect(
      parseMaps(data, { [`${GROUND_ZERO} Name`]: "Ground Zero 2.0" }).get(
        GROUND_ZERO,
      )?.name,
    ).toBe("Ground Zero 2.0");
  });
});

describe("filterTasks", () => {
  const tasks = parseTasks({
    tasks: [
      raw("a", {
        name: "Debut",
        normalizedName: "debut",
        map: "m1",
        kappaRequired: true,
      }),
      raw("b", {
        name: "Shootout Picnic",
        normalizedName: "shootout-picnic",
        map: null,
      }),
      raw("c", {
        name: "Gunsmith Part 1",
        normalizedName: "gunsmith-part-1",
        trader: "other",
        map: "m1",
        lightkeeperRequired: true,
      }),
    ],
  });
  const base: TaskFilters = {
    query: "",
    traderId: "",
    mapId: "",
    kappaOnly: false,
    lightkeeperOnly: false,
  };
  const ids = (list: { id: string }[]) => list.map((t) => t.id);

  it("returns everything without filters", () => {
    expect(filterTasks(tasks, base)).toHaveLength(3);
  });

  it("requires every query word to match", () => {
    expect(ids(filterTasks(tasks, { ...base, query: "part 1" }))).toEqual([
      "c",
    ]);
    expect(filterTasks(tasks, { ...base, query: "debut picnic" })).toHaveLength(
      0,
    );
  });

  it("filters by trader, map and flags", () => {
    expect(ids(filterTasks(tasks, { ...base, traderId: "other" }))).toEqual([
      "c",
    ]);
    expect(ids(filterTasks(tasks, { ...base, mapId: "m1" }))).toEqual([
      "a",
      "c",
    ]);
    expect(ids(filterTasks(tasks, { ...base, mapId: ANY_MAP }))).toEqual(["b"]);
    expect(ids(filterTasks(tasks, { ...base, kappaOnly: true }))).toEqual([
      "a",
    ]);
    expect(ids(filterTasks(tasks, { ...base, lightkeeperOnly: true }))).toEqual(
      ["c"],
    );
  });
});

describe("sortTasks", () => {
  const labels: TaskLabels = {
    traderName: (id) => (id === "t1" ? "Prapor" : "Therapist"),
    mapName: (id) => (id === null ? "Any map" : "Customs"),
  };
  const tasks = parseTasks({
    tasks: [
      raw("b", {
        name: "Bravo",
        minPlayerLevel: 5,
        experience: 100,
        trader: "t2",
      }),
      raw("a", {
        name: "Alpha",
        minPlayerLevel: 5,
        experience: 900,
        trader: "t1",
      }),
      raw("c", {
        name: "Charlie",
        minPlayerLevel: 1,
        experience: 500,
        trader: "t1",
      }),
    ],
  });
  const ids = (list: { id: string }[]) => list.map((t) => t.id);

  it("sorts by level, breaking ties by name", () => {
    expect(ids(sortTasks(tasks, "minPlayerLevel", "asc", labels))).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("sorts numerically in both directions", () => {
    expect(ids(sortTasks(tasks, "experience", "desc", labels))).toEqual([
      "a",
      "c",
      "b",
    ]);
    expect(ids(sortTasks(tasks, "experience", "asc", labels))).toEqual([
      "b",
      "c",
      "a",
    ]);
  });

  it("sorts by the resolved trader name", () => {
    expect(ids(sortTasks(tasks, "trader", "asc", labels))).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("does not mutate the input", () => {
    const before = ids(tasks);
    sortTasks(tasks, "name", "desc", labels);
    expect(ids(tasks)).toEqual(before);
  });
});
