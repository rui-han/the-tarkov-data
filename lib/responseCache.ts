/**
 * The last good json.tarkov.dev responses, kept in IndexedDB so the site keeps
 * working when the API is down. IndexedDB because the items file is far too
 * big for localStorage (~5 MB); the raw response text is stored as it is, so
 * nothing large has to be structured-cloned.
 *
 * Everything here is best effort: when IndexedDB is missing, blocked (some
 * private modes) or full, the functions resolve to null / do nothing.
 */

const DB_NAME = "tarkov-data-cache";
const STORE = "responses";
const DB_VERSION = 1;

/** Older copies are more misleading than useful (prices, patches). */
export const MAX_CACHE_AGE_MS = 14 * 24 * 60 * 60 * 1000;
/** Don't rewrite a multi-MB response that was saved a moment ago. */
const MIN_SAVE_INTERVAL_MS = 10 * 60 * 1000;

export interface CachedResponse {
  savedAt: number;
  /** the response body exactly as received */
  text: string;
}

export function isUsable(
  entry: unknown,
  now = Date.now(),
): entry is CachedResponse {
  if (typeof entry !== "object" || entry === null) return false;
  const { savedAt, text } = entry as Partial<CachedResponse>;
  return (
    typeof savedAt === "number" &&
    typeof text === "string" &&
    text !== "" &&
    now - savedAt <= MAX_CACHE_AGE_MS
  );
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        // out-of-line keys: the key is the endpoint path
        request.onupgradeneeded = () => request.result.createObjectStore(STORE);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
        request.onblocked = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }
  return dbPromise;
}

/** Runs one request in a transaction; null on any failure. */
async function run<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;

  return new Promise<T | null>((resolve) => {
    try {
      const tx = db.transaction(STORE, mode);
      const request = fn(tx.objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      tx.onabort = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/** Cheap check (no data is read) used to decide how patient to be. */
export async function hasCached(path: string): Promise<boolean> {
  const key = await run("readonly", (store) => store.getKey(path));
  return key != null;
}

export async function loadCached(path: string): Promise<CachedResponse | null> {
  const entry = await run<unknown>("readonly", (store) => store.get(path));
  return isUsable(entry) ? entry : null;
}

const lastSaved = new Map<string, number>();

export async function saveCached(path: string, text: string): Promise<void> {
  const now = Date.now();
  const last = lastSaved.get(path);
  if (last != null && now - last < MIN_SAVE_INTERVAL_MS) return;

  lastSaved.set(path, now);
  const entry: CachedResponse = { savedAt: now, text };
  const result = await run("readwrite", (store) => store.put(entry, path));
  // a failed write (quota, private mode) shouldn't block the next attempt
  if (result == null) lastSaved.delete(path);
}
