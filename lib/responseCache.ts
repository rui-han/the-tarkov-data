/**
 * The last good json.tarkov.dev responses, kept in IndexedDB so the site keeps
 * working when the API is down. IndexedDB because the items file is far too
 * big for localStorage (~5 MB); the raw response text is stored as it is, so
 * nothing large has to be structured-cloned.
 *
 * Two stores: `responses` holds the big text, `meta` a tiny record per path
 * (when it was saved). Questions like "is there a usable copy?" and "was it
 * saved recently?" only read the meta record, never the multi-MB text.
 *
 * Everything here is best effort: when IndexedDB is missing, blocked (some
 * private modes) or full, the functions resolve to null / do nothing.
 */

const DB_NAME = "tarkov-data-cache";
const STORE = "responses";
const META = "meta";
const DB_VERSION = 2;

/** Older copies are more misleading than useful (prices, patches). */
export const MAX_CACHE_AGE_MS = 14 * 24 * 60 * 60 * 1000;
/**
 * Don't rewrite a multi-MB response that was saved recently. The saved copy is
 * only a fallback, so being up to this much older than the last success is
 * fine.
 */
export const MIN_SAVE_INTERVAL_MS = 60 * 60 * 1000;

export interface CachedResponse {
  savedAt: number;
  /** the response body exactly as received */
  text: string;
}

interface CacheMeta {
  savedAt: number;
  /** characters of the saved text */
  size: number;
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

function isFreshMeta(meta: unknown, now: number): boolean {
  if (typeof meta !== "object" || meta === null) return false;
  const { savedAt } = meta as Partial<CacheMeta>;
  return typeof savedAt === "number" && now - savedAt <= MAX_CACHE_AGE_MS;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        // out-of-line keys: the key is the endpoint path
        request.onupgradeneeded = (event) => {
          const db = request.result;
          // version 1 had no meta store, so there was no way to tell how old
          // an entry was without reading it; start clean (the copies are only
          // a fallback and are saved again on the next visit)
          if (
            event.oldVersion > 0 &&
            event.oldVersion < 2 &&
            db.objectStoreNames.contains(STORE)
          ) {
            db.deleteObjectStore(STORE);
          }
          if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
          if (!db.objectStoreNames.contains(META)) db.createObjectStore(META);
        };
        request.onsuccess = () => {
          const db = request.result;
          // a newer version in another tab must not be blocked by this one
          db.onversionchange = () => {
            db.close();
            dbPromise = null;
          };
          resolve(db);
        };
        request.onerror = () => resolve(null);
        request.onblocked = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    // once per session: drop copies that are too old to be useful
    void dbPromise.then((db) => (db ? pruneStores(db, Date.now()) : undefined));
  }
  return dbPromise;
}

/** Runs one request in a transaction; null on any failure. */
async function run<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;

  return new Promise<T | null>((resolve) => {
    try {
      const tx = db.transaction(storeName, mode);
      const request = fn(tx.objectStore(storeName));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      tx.onabort = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Cheap check used to decide how patient to be: only the tiny meta record is
 * read, and an expired copy doesn't count (it wouldn't be shown anyway).
 */
export async function hasCached(
  path: string,
  now = Date.now(),
): Promise<boolean> {
  const meta = await run<unknown>(META, "readonly", (store) => store.get(path));
  return isFreshMeta(meta, now);
}

export async function loadCached(
  path: string,
  now = Date.now(),
): Promise<CachedResponse | null> {
  const entry = await run<unknown>(STORE, "readonly", (store) =>
    store.get(path),
  );
  return isUsable(entry, now) ? entry : null;
}

/**
 * Saves a response unless one was saved less than MIN_SAVE_INTERVAL_MS ago.
 * The check and the write happen in one transaction, and the meta record is
 * stored, so the interval holds across page loads and tabs.
 */
export async function saveCached(
  path: string,
  text: string,
  now = Date.now(),
): Promise<void> {
  const db = await openDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction([STORE, META], "readwrite");
      const meta = tx.objectStore(META);
      const lookup = meta.get(path);

      lookup.onsuccess = () => {
        const existing = lookup.result as Partial<CacheMeta> | undefined;
        if (existing && typeof existing.savedAt === "number") {
          const age = now - existing.savedAt;
          // saved recently: skip the multi-MB write (a clock that went
          // backwards gives a negative age and is not "recent")
          if (age >= 0 && age < MIN_SAVE_INTERVAL_MS) return;
        }
        const entry: CachedResponse = { savedAt: now, text };
        const info: CacheMeta = { savedAt: now, size: text.length };
        tx.objectStore(STORE).put(entry, path);
        meta.put(info, path);
      };

      // a full disk or a private mode ends up here: nothing to do about it
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

/** Deletes every copy older than MAX_CACHE_AGE_MS (or without a valid meta). */
function pruneStores(db: IDBDatabase, now: number): Promise<void> {
  return new Promise<void>((resolve) => {
    try {
      const tx = db.transaction([META, STORE], "readwrite");
      const meta = tx.objectStore(META);
      const responses = tx.objectStore(STORE);

      const request = meta.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        if (!isFreshMeta(cursor.value, now)) {
          responses.delete(cursor.key);
          cursor.delete();
        }
        cursor.continue();
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

/** Runs automatically once per session; exported for tests. */
export async function pruneExpired(now = Date.now()): Promise<void> {
  const db = await openDb();
  if (db) await pruneStores(db, now);
}
