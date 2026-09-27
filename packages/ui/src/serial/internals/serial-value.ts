/** Value/separator surface shared by input handlers and the host. */
export type SerialValueHost = {
  length: number;
  alphanumeric: boolean;
  separator: string;
  separatorPositions: number[];
  withSeparator: boolean;
  value: string;
  displayValues: string[];
};

const DIGIT = /[0-9]/g;
const ALNUM = /[a-zA-Z0-9]/g;

/** Escapes a separator char for use inside a RegExp character class. */
function escapeSepChar(sep: string): string {
  return sep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Strips separators and keeps allowed characters only. */
export function normalizeSerialRaw(host: SerialValueHost, v: string): string {
  const sep = host.separator || "-";
  const noSeps = (v ?? "").replace(new RegExp(escapeSepChar(sep), "g"), "");
  const allowed = host.alphanumeric ? ALNUM : DIGIT;
  const filtered = (noSeps.match(allowed) ?? []).join("");
  return filtered.slice(0, host.length);
}

/** Inserts separator glyphs into a raw character string. */
export function addSerialSeparators(raw: string, separator: string, positions: number[]): string {
  if (!raw) return "";
  const chars = raw.split("");
  const sorted = [...positions].sort((a, b) => a - b);
  sorted.forEach((pos, i) => {
    if (pos <= chars.length + i) chars.splice(pos + i, 0, separator);
  });
  return chars.join("");
}

/** Joins the display buffer into a raw string. */
export function getSerialRawFromDisplay(host: SerialValueHost): string {
  return host.displayValues.join("").slice(0, host.length);
}

/** Builds the public `value` from raw buffer chars. */
export function canonicalSerialFromRaw(host: SerialValueHost, raw: string): string {
  return host.withSeparator
    ? addSerialSeparators(raw, host.separator, host.separatorPositions)
    : raw;
}

/** Syncs `displayValues` from the public `value`. */
export function syncSerialDisplayFromValue(host: SerialValueHost): void {
  ensureSerialDisplayBuffer(host);
  const raw = normalizeSerialRaw(host, host.value ?? "");
  for (let i = 0; i < host.length; i++) host.displayValues[i] = raw[i] ?? "";
}

/** Keeps `displayValues` aligned with `length`. */
export function ensureSerialDisplayBuffer(host: SerialValueHost): void {
  if (host.displayValues.length === host.length) return;
  const old = host.displayValues;
  host.displayValues = Array.from({ length: host.length }, (_, i) => old[i] ?? "");
}

/** Writes raw buffer back to the public `value` field. */
export function syncSerialValueFromDisplay(host: SerialValueHost): string {
  const raw = getSerialRawFromDisplay(host);
  return canonicalSerialFromRaw(host, raw);
}

/** Sorted separator indices used while rendering groups. */
export function serialSeparatorIndices(positions: number[]): number[] {
  return Array.isArray(positions) ? [...positions].sort((a, b) => a - b) : [];
}
