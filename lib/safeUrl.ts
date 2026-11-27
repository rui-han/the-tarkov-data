/**
 * Links and image addresses come from a data source we don't control, so they
 * are checked before they reach an href or src: only plain http(s) URLs pass.
 * Anything else (javascript:, data:, vbscript:, protocol-relative or relative
 * paths, junk) is dropped, and the UI shows what it shows without a link or
 * image. The URL is returned exactly as given (trimmed), not rewritten.
 */
export function safeUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed === "") return undefined;

  try {
    const { protocol } = new URL(trimmed);
    return protocol === "https:" || protocol === "http:" ? trimmed : undefined;
  } catch {
    return undefined; // not an absolute URL
  }
}
