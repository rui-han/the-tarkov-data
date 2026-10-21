import type {
  ServerStatusInfo,
  ServiceStatus,
  StatusLevel,
} from "@/types/server_status";

type UnknownRecord = Record<string, unknown>;

const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v : "");

const MAX_MESSAGES = 3;

const LEVEL_BY_NUMBER: Record<number, StatusLevel> = {
  0: "ok",
  1: "updating",
  2: "issues",
  3: "down",
};

const LEVEL_BY_CODE: Record<string, StatusLevel> = {
  ok: "ok",
  updating: "updating",
  issues: "issues",
  down: "down",
};

export const LEVEL_LABELS: Record<Exclude<StatusLevel, "unknown">, string> = {
  ok: "OK",
  updating: "Updating",
  issues: "Issues",
  down: "Down",
};

/**
 * `status` is a number (0 = OK, 1 = Updating, 2 = Issues, 3 = Down) and
 * `statusCode` its text form. Prefer the number, fall back to the text, and
 * never guess: anything unrecognized is "unknown".
 */
export function levelOf(status: unknown, statusCode: unknown): StatusLevel {
  if (typeof status === "number") {
    const level = LEVEL_BY_NUMBER[status];
    if (level) return level;
  }
  if (typeof statusCode === "string") {
    return LEVEL_BY_CODE[statusCode.toLowerCase()] ?? "unknown";
  }
  return "unknown";
}

function parseService(raw: UnknownRecord, fallbackId: string): ServiceStatus {
  const name = str(raw.name) || "Unknown";
  const level = levelOf(raw.status, raw.statusCode);
  return {
    id: str(raw._id) || fallbackId,
    name,
    level,
    // an unrecognized code is more informative than "Unknown"
    label:
      level === "unknown"
        ? str(raw.statusCode) || "Unknown"
        : LEVEL_LABELS[level],
  };
}

/** Announcements are shown as plain text; strings and { content } both work. */
function messageText(raw: unknown): string {
  if (typeof raw === "string") return raw.trim();
  if (isRecord(raw)) return (str(raw.content) || str(raw.message)).trim();
  return "";
}

/** Normalize the `status` payload; null when it isn't recognizable. */
export function parseServerStatus(data: unknown): ServerStatusInfo | null {
  if (!isRecord(data) || !isRecord(data.generalStatus)) return null;

  const overall = parseService(data.generalStatus, "overall");

  const services = (
    Array.isArray(data.currentStatuses) ? data.currentStatuses : []
  )
    .filter(isRecord)
    .map((raw, i) => parseService(raw, `service-${i}`))
    // the list ends with a copy of the general status
    .filter((s) => s.name.toLowerCase() !== overall.name.toLowerCase());

  const messages = (Array.isArray(data.messages) ? data.messages : [])
    .map(messageText)
    .filter(Boolean)
    .slice(0, MAX_MESSAGES);

  return {
    overall,
    message: str(data.generalStatus.message).trim(),
    services,
    messages,
  };
}
