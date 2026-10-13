/**
 * Service area lookup by ZIP prefix (first 3 digits).
 *
 * This is an approximation good enough for routing and calling-hour hints. Some 3-digit
 * prefixes straddle a time-zone line (e.g. parts of the Florida panhandle and Tennessee);
 * replace with a full ZIP database before relying on it for compliance decisions.
 */
export const SERVICE_STATES = ["FL", "GA", "AL", "MS", "TN", "SC", "NC", "LA"] as const;
export type ServiceState = (typeof SERVICE_STATES)[number];

export const EASTERN = "America/New_York";
export const CENTRAL = "America/Chicago";
export type TimeZone = typeof EASTERN | typeof CENTRAL;

export interface ZipArea {
  state: ServiceState;
  timeZone: TimeZone;
}

interface Zip3Range {
  from: number;
  to: number;
  state: ServiceState;
  timeZone: TimeZone;
}

const ZIP3_RANGES: readonly Zip3Range[] = [
  { from: 270, to: 289, state: "NC", timeZone: EASTERN },
  { from: 290, to: 299, state: "SC", timeZone: EASTERN },
  { from: 300, to: 319, state: "GA", timeZone: EASTERN },
  { from: 398, to: 399, state: "GA", timeZone: EASTERN },
  { from: 320, to: 323, state: "FL", timeZone: EASTERN },
  // Pensacola / Panama City area of the panhandle is Central time.
  { from: 324, to: 325, state: "FL", timeZone: CENTRAL },
  { from: 326, to: 339, state: "FL", timeZone: EASTERN },
  // 340 is military mail (AA), not Florida.
  { from: 341, to: 349, state: "FL", timeZone: EASTERN },
  { from: 350, to: 369, state: "AL", timeZone: CENTRAL },
  { from: 370, to: 372, state: "TN", timeZone: CENTRAL },
  // Chattanooga and East Tennessee are Eastern time.
  { from: 373, to: 374, state: "TN", timeZone: EASTERN },
  { from: 375, to: 375, state: "TN", timeZone: CENTRAL },
  { from: 376, to: 379, state: "TN", timeZone: EASTERN },
  { from: 380, to: 385, state: "TN", timeZone: CENTRAL },
  { from: 386, to: 397, state: "MS", timeZone: CENTRAL },
  { from: 700, to: 701, state: "LA", timeZone: CENTRAL },
  { from: 703, to: 708, state: "LA", timeZone: CENTRAL },
  { from: 710, to: 714, state: "LA", timeZone: CENTRAL },
];

const ZIP5 = /^\d{5}$/;

/** Returns the service-area info for a 5-digit ZIP, or undefined if outside the service area. */
export function lookupZip(zip: string): ZipArea | undefined {
  const trimmed = zip.trim();
  if (!ZIP5.test(trimmed)) return undefined;
  const prefix = Number(trimmed.slice(0, 3));
  const range = ZIP3_RANGES.find((r) => prefix >= r.from && prefix <= r.to);
  return range ? { state: range.state, timeZone: range.timeZone } : undefined;
}
