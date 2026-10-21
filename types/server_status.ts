export type StatusLevel = "ok" | "updating" | "issues" | "down" | "unknown";

export interface ServiceStatus {
  id: string;
  name: string;
  level: StatusLevel;
  /** text shown next to the name, e.g. "OK", "Issues" */
  label: string;
}

/** The `status` endpoint, normalized (see lib/serverStatus.ts) */
export interface ServerStatusInfo {
  /** `generalStatus`: drives the dot in the nav */
  overall: ServiceStatus;
  /** message that comes with the general status, may be empty */
  message: string;
  /** individual services, without the duplicate "Global" entry */
  services: ServiceStatus[];
  /** announcements, plain text */
  messages: string[];
}
