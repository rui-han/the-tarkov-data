import { markFresh, markStale } from "@/lib/cacheStatus";
import { hasCached, loadCached, saveCached } from "@/lib/responseCache";

export const GAME_MODES = ["regular", "pve", "pvp-season"] as const;
export type GameMode = (typeof GAME_MODES)[number];

export const DEFAULT_GAME_MODE: GameMode = "regular";

/** `short` fits the nav bar, `full` is for sentences */
export const GAME_MODE_LABELS: Record<
  GameMode,
  { short: string; full: string }
> = {
  regular: { short: "PvP", full: "PvP" },
  pve: { short: "PvE", full: "PvE" },
  "pvp-season": { short: "Season", full: "PvP Season" },
};

export function isGameMode(value: unknown): value is GameMode {
  return (
    typeof value === "string" &&
    (GAME_MODES as readonly string[]).includes(value)
  );
}

const JSON_TARKOV_BASE = "https://json.tarkov.dev";

/**
 * How long to wait for a response before giving up and showing the saved copy.
 * Only applies when there is a saved copy; without one waiting is all we can do.
 */
export const REQUEST_TIMEOUT_MS = 30_000;

interface FetchTarkovJsonOptions {
  gameMode?: GameMode;
  lang?: string; // only supported by endpoints with translations: true
}

/** "regular/items", "regular/items_en", or "status" (not per game mode) */
export function tarkovPath(
  endpoint: string,
  gameMode: GameMode = DEFAULT_GAME_MODE,
  lang?: string,
): string {
  return endpoint === "status"
    ? "status"
    : `${gameMode}/${endpoint}${lang ? `_${lang}` : ""}`;
}

/**
 * Normalize a value that's expected to represent a list, but whose actual
 * shape from json.tarkov.dev might vary: a plain array, a `{ data: [...] }`
 * wrapper, or an object keyed by id (`{ "<id>": {...}, ... }`). Using this
 * everywhere we expect a list avoids "X.filter is not a function" crashes
 * when a domain's real shape turns out to differ from our best guess.
 */
export function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const maybeData = (value as { data?: unknown }).data;
    if (Array.isArray(maybeData)) return maybeData as T[];
    // id-keyed object, e.g. { "5c0e874...": {...}, "5c0e875...": {...} }
    return Object.values(value) as T[];
  }
  return [];
}

export class TarkovFetchError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "TarkovFetchError";
    this.status = status;
  }
}

/**
 * Is this failure an outage (use the saved copy) rather than a definite
 * answer? A 404 means "no such file" (e.g. no season is running), and showing
 * old data for it would be wrong.
 */
export function canUseSavedCopy(error: unknown): boolean {
  if (error instanceof TarkovFetchError && error.status != null) {
    return error.status >= 500 || error.status === 429;
  }
  // network failure, timeout, invalid JSON
  return true;
}

/** The files are wrapped in `{ data: ... }`. */
function unwrap<T>(json: unknown): T {
  const data = (json as { data?: unknown } | null)?.data;
  return (data ?? json) as T;
}

async function fetchText(
  path: string,
  hasSavedCopy: Promise<boolean>,
): Promise<string> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let finished = false;

  // Only give up on a slow server when there is a saved copy to show instead.
  void hasSavedCopy.then((has) => {
    if (has && !finished) {
      timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    }
  });

  try {
    const res = await fetch(`${JSON_TARKOV_BASE}/${path}`, {
      signal: controller.signal,
      // These static files don't update often, so let Next revalidate hourly
      // (this only takes effect in server components; client components' fetch
      // will just ignore this option without erroring)
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new TarkovFetchError(
        `Tarkov API requests failed (${path}): ${res.status}`,
        res.status,
      );
    }
    return await res.text();
  } finally {
    finished = true;
    clearTimeout(timer);
  }
}

/**
 * Fetch a static JSON snapshot for a given domain from json.tarkov.dev and
 * unwrap the `{ data: {...} }` envelope.
 *
 * Every successful response is also saved in the browser. When the API cannot
 * be reached (see `canUseSavedCopy`), that saved copy is returned instead and
 * flagged through `cacheStatus`, so the UI can say the data may be out of
 * date. `status` is never saved: a saved "OK" would be wrong during an outage.
 */
export async function fetchTarkovJson<T>(
  endpoint: string,
  { gameMode = DEFAULT_GAME_MODE, lang }: FetchTarkovJsonOptions = {},
): Promise<T> {
  const path = tarkovPath(endpoint, gameMode, lang);
  const cacheable = endpoint !== "status";
  const hasSavedCopy = cacheable ? hasCached(path) : Promise.resolve(false);

  try {
    const text = await fetchText(path, hasSavedCopy);
    const json: unknown = JSON.parse(text);

    if (cacheable) {
      markFresh(path);
      void saveCached(path, text);
    }
    return unwrap<T>(json);
  } catch (error) {
    if (!cacheable || !canUseSavedCopy(error)) throw error;

    const saved = await loadCached(path);
    if (!saved) throw error;

    let parsed: unknown;
    try {
      parsed = JSON.parse(saved.text);
    } catch {
      throw error; // a corrupt copy is no help
    }

    markStale(path, {
      savedAt: saved.savedAt,
      gameMode,
      lang: lang ?? null,
    });
    return unwrap<T>(parsed);
  }
}
