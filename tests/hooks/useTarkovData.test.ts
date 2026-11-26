import { describe, it, expect } from "vitest";
import { FRESH_MS, tarkovSwrConfig } from "@/hooks/useTarkovData";

describe("tarkovSwrConfig", () => {
  it("keeps big static files fresh for a long window and skips reconnect refetches", () => {
    expect(tarkovSwrConfig()).toMatchObject({
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: FRESH_MS,
    });
    expect(FRESH_MS).toBeGreaterThanOrEqual(5 * 60_000);
  });

  it("polled data uses a window shorter than its interval and refreshes on reconnect", () => {
    const config = tarkovSwrConfig(60_000);
    expect(config).toMatchObject({
      refreshInterval: 60_000,
      revalidateOnReconnect: true,
    });
    expect(config.dedupingInterval).toBeLessThan(60_000);
  });
});
