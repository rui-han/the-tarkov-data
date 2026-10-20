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

interface FetchTarkovJsonOptions {
  gameMode?: GameMode;
  lang?: string; // only supported by endpoints with translations: true
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

/**
 * Fetch a static JSON snapshot for a given domain from json.tarkov.dev and unwrap
 * the `{ data: {...} }` envelope (these files are most likely cached GraphQL
 * query results, so the envelope shape matches what we had before).
 */
export async function fetchTarkovJson<T>(
  endpoint: string,
  { gameMode = DEFAULT_GAME_MODE, lang }: FetchTarkovJsonOptions = {},
): Promise<T> {
  const path =
    endpoint === "status"
      ? "status"
      : `${gameMode}/${endpoint}${lang ? `_${lang}` : ""}`;

  const res = await fetch(`${JSON_TARKOV_BASE}/${path}`, {
    // These static files don't update often, so let Next revalidate hourly
    // (this only takes effect in server components; client components' fetch
    // will just ignore this option without erroring)
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Tarkov API requests failed (${path}): ${res.status}`);
  }

  const json = await res.json();
  return (json.data ?? json) as T;
}
