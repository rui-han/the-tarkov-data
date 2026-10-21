import { describe, it, expect } from "vitest";
import { levelOf, parseServerStatus } from "@/lib/serverStatus";

const service = (name: string, status = 0, statusCode = "OK") => ({
  _id: `id-${name}`,
  name,
  status,
  statusCode,
});

// the shape of https://json.tarkov.dev/status after the `data` envelope
const sample = {
  generalStatus: { name: "Global", message: "", status: 0, statusCode: "OK" },
  currentStatuses: [
    service("Website"),
    service("Matchmaking"),
    service("Trading"),
    // the list ends with a copy of the general status, without an _id
    { name: "Global", message: "", status: 0, statusCode: "OK" },
  ],
  messages: [],
};

describe("levelOf", () => {
  it("maps the numeric status", () => {
    expect(levelOf(0, "OK")).toBe("ok");
    expect(levelOf(1, "Updating")).toBe("updating");
    expect(levelOf(2, "Issues")).toBe("issues");
    expect(levelOf(3, "Down")).toBe("down");
  });

  it("falls back to the status code", () => {
    expect(levelOf(undefined, "OK")).toBe("ok");
    expect(levelOf(undefined, "down")).toBe("down");
  });

  it("never guesses", () => {
    expect(levelOf(9, undefined)).toBe("unknown");
    expect(levelOf("0", "Maintenance")).toBe("unknown");
    expect(levelOf(undefined, undefined)).toBe("unknown");
  });
});

describe("parseServerStatus", () => {
  it("parses the sample response", () => {
    const status = parseServerStatus(sample);
    expect(status?.overall).toEqual({
      id: "overall",
      name: "Global",
      level: "ok",
      label: "OK",
    });
    expect(status?.message).toBe("");
    expect(status?.messages).toEqual([]);
  });

  it("drops the duplicate Global entry from the services", () => {
    const status = parseServerStatus(sample);
    expect(status?.services.map((s) => s.name)).toEqual([
      "Website",
      "Matchmaking",
      "Trading",
    ]);
  });

  it("reflects the general status in `overall`", () => {
    const status = parseServerStatus({
      ...sample,
      generalStatus: {
        name: "Global",
        message: "Server restart",
        status: 3,
        statusCode: "Down",
      },
      currentStatuses: [service("Matchmaking", 2, "Issues")],
    });
    expect(status?.overall.level).toBe("down");
    expect(status?.message).toBe("Server restart");
    expect(status?.services[0]).toMatchObject({
      name: "Matchmaking",
      level: "issues",
      label: "Issues",
    });
  });

  it("shows an unrecognized status code as the label", () => {
    const status = parseServerStatus({
      ...sample,
      generalStatus: { name: "Global", status: 7, statusCode: "Maintenance" },
    });
    expect(status?.overall).toMatchObject({
      level: "unknown",
      label: "Maintenance",
    });
  });

  it("accepts announcements as strings or objects and caps them", () => {
    const status = parseServerStatus({
      ...sample,
      messages: [
        "plain text",
        { time: "2026-10-20", type: "info", content: "  from content  " },
        { content: "" },
        42,
        null,
        "third",
        "fourth",
      ],
    });
    expect(status?.messages).toEqual(["plain text", "from content", "third"]);
  });

  it("tolerates missing lists", () => {
    const status = parseServerStatus({ generalStatus: sample.generalStatus });
    expect(status?.services).toEqual([]);
    expect(status?.messages).toEqual([]);
  });

  it("returns null for anything unrecognizable", () => {
    expect(parseServerStatus(null)).toBeNull();
    expect(parseServerStatus({})).toBeNull();
    expect(parseServerStatus("nope")).toBeNull();
    expect(parseServerStatus({ generalStatus: "OK" })).toBeNull();
    // the old GraphQL shape
    expect(parseServerStatus({ status: { generalStatus: {} } })).toBeNull();
  });
});
