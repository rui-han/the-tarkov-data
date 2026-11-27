import { describe, it, expect } from "vitest";
import { safeUrl } from "@/lib/safeUrl";

describe("safeUrl", () => {
  it("lets plain http(s) URLs through unchanged", () => {
    expect(safeUrl("https://assets.tarkov.dev/a-icon.webp")).toBe(
      "https://assets.tarkov.dev/a-icon.webp",
    );
    expect(
      safeUrl(
        "https://escapefromtarkov.fandom.com/wiki/5.56x45mm_M855_ammo_pack_(50_pcs)",
      ),
    ).toBe(
      "https://escapefromtarkov.fandom.com/wiki/5.56x45mm_M855_ammo_pack_(50_pcs)",
    );
    expect(safeUrl("http://example.com/x")).toBe("http://example.com/x");
    expect(safeUrl("  https://example.com/x  ")).toBe("https://example.com/x");
  });

  it("drops script, data and other schemes, however they are disguised", () => {
    expect(safeUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeUrl("  JavaScript:alert(1)")).toBeUndefined();
    expect(safeUrl("java\nscript:alert(1)")).toBeUndefined();
    expect(safeUrl("data:text/html;base64,AAAA")).toBeUndefined();
    expect(safeUrl("vbscript:msgbox(1)")).toBeUndefined();
    expect(safeUrl("file:///etc/passwd")).toBeUndefined();
  });

  it("drops relative, protocol-relative and junk values", () => {
    expect(safeUrl("/icons/a.png")).toBeUndefined();
    expect(safeUrl("//evil.example/x.png")).toBeUndefined();
    expect(safeUrl("not a url")).toBeUndefined();
    expect(safeUrl("")).toBeUndefined();
    expect(safeUrl("   ")).toBeUndefined();
    expect(safeUrl(null)).toBeUndefined();
    expect(safeUrl(undefined)).toBeUndefined();
    expect(safeUrl(42)).toBeUndefined();
    expect(safeUrl({ href: "https://example.com" })).toBeUndefined();
  });
});
