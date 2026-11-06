/**
 * Which endpoints are currently served from a saved copy because the API
 * could not be reached. A tiny external store so any component can subscribe.
 */

export interface StaleEntry {
  /** when the copy in use was saved */
  savedAt: number;
  gameMode: string;
  /** translation dictionaries (lang set) apply to every game mode */
  lang: string | null;
}

export interface StaleSummary {
  count: number;
  /** the oldest copy in use; null when nothing is stale */
  savedAt: number | null;
}

const EMPTY: ReadonlyMap<string, StaleEntry> = new Map();

let entries: ReadonlyMap<string, StaleEntry> = EMPTY;
const listeners = new Set<() => void>();

function commit(next: ReadonlyMap<string, StaleEntry>) {
  entries = next;
  listeners.forEach((listener) => listener());
}

export function markStale(path: string, entry: StaleEntry): void {
  const current = entries.get(path);
  if (current && current.savedAt === entry.savedAt) return; // nothing changed
  const next = new Map(entries);
  next.set(path, entry);
  commit(next);
}

export function markFresh(path: string): void {
  if (!entries.has(path)) return;
  const next = new Map(entries);
  next.delete(path);
  commit(next);
}

export function isStale(path: string): boolean {
  return entries.has(path);
}

/** For tests. */
export function resetStale(): void {
  commit(EMPTY);
}

export function subscribeStale(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The snapshot only changes identity when something changed. */
export function getStaleEntries(): ReadonlyMap<string, StaleEntry> {
  return entries;
}

export function getServerStaleEntries(): ReadonlyMap<string, StaleEntry> {
  return EMPTY;
}

/** What matters for the current game mode: its own entries and dictionaries. */
export function summarizeStale(
  all: ReadonlyMap<string, StaleEntry>,
  gameMode: string,
): StaleSummary {
  let count = 0;
  let oldest: number | null = null;

  for (const entry of all.values()) {
    if (entry.lang == null && entry.gameMode !== gameMode) continue;
    count++;
    oldest = oldest == null ? entry.savedAt : Math.min(oldest, entry.savedAt);
  }

  return { count, savedAt: oldest };
}
