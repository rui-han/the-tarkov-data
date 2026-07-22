import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAchievementSort } from "../../hooks/useAchievementSort";

interface TestItem {
  name: string;
  value: number;
}

const data: TestItem[] = [
  { name: "Charlie", value: 3 },
  { name: "alice", value: 1 },
  { name: "Bob", value: 2 },
];

describe("useAchievementSort", () => {
  it("returns data unsorted when no default sort key is provided", () => {
    const { result } = renderHook(() => useAchievementSort(data));
    expect(result.current.sortedAchievements).toEqual(data);
  });

  it("sorts by the default key on initial render", () => {
    const { result } = renderHook(() =>
      useAchievementSort(data, {
        defaultOrderBy: "value",
        defaultOrder: "asc",
      }),
    );
    expect(result.current.sortedAchievements.map((item) => item.value)).toEqual(
      [1, 2, 3],
    );
  });

  it("sorts strings case-insensitively", () => {
    const { result } = renderHook(() =>
      useAchievementSort(data, {
        defaultOrderBy: "name",
        defaultOrder: "asc",
      }),
    );
    expect(result.current.sortedAchievements.map((item) => item.name)).toEqual([
      "alice",
      "Bob",
      "Charlie",
    ]);
  });

  it("toggles direction when sorting the same column twice", () => {
    const { result } = renderHook(() => useAchievementSort(data));

    act(() => {
      result.current.handleSort("value");
    });
    expect(result.current.order).toBe("asc");
    expect(result.current.sortedAchievements.map((item) => item.value)).toEqual(
      [1, 2, 3],
    );

    act(() => {
      result.current.handleSort("value");
    });
    expect(result.current.order).toBe("desc");
    expect(result.current.sortedAchievements.map((item) => item.value)).toEqual(
      [3, 2, 1],
    );
  });

  it("resets to ascending when switching to a new column", () => {
    const { result } = renderHook(() => useAchievementSort(data));

    // each call needs its own act() so the hook re-renders in between and
    // picks up the updated `orderBy`/`order` state — batching both calls
    // into a single act() would read stale closure values on the 2nd call
    act(() => {
      result.current.handleSort("value");
    });
    act(() => {
      result.current.handleSort("value"); // now desc
    });
    expect(result.current.order).toBe("desc");

    act(() => {
      result.current.handleSort("name");
    });
    expect(result.current.orderBy).toBe("name");
    expect(result.current.order).toBe("asc");
  });
});
