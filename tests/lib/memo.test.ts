import { describe, it, expect, vi } from "vitest";
import { EMPTY_TRANSLATIONS } from "@/lib/hideout";
import { memoizeParse } from "@/lib/memo";

describe("memoizeParse", () => {
  it("parses a payload once per data object, whoever asks", () => {
    const parse = vi.fn((data: unknown) => [data]);
    const memo = memoizeParse(parse);
    const data = { items: {} };

    const first = memo(data);
    expect(memo(data)).toBe(first);
    expect(parse).toHaveBeenCalledTimes(1);
  });

  it("parses again for another payload or another dictionary", () => {
    const parse = vi.fn((data: unknown) => [data]);
    const memo = memoizeParse(parse);
    const data = { items: {} };

    memo(data);
    memo({ items: {} });
    memo(data, { someKey: "text" });
    expect(parse).toHaveBeenCalledTimes(3);
  });

  it("does not cache what it cannot key on", () => {
    const parse = vi.fn(() => []);
    const memo = memoizeParse(parse);

    memo(null);
    memo(null);
    memo(undefined);
    memo("nope");
    expect(parse).toHaveBeenCalledTimes(4);
  });

  it("treats a missing dictionary like the shared empty one", () => {
    const parse = vi.fn((data: unknown) => [data]);
    const memo = memoizeParse(parse);
    const data = {};

    expect(memo(data, EMPTY_TRANSLATIONS)).toBe(memo(data));
    expect(parse).toHaveBeenCalledTimes(1);
  });
});
