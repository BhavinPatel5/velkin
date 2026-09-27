import type { PropertyValues } from "lit";
import { devWarnInvalidPropValue } from "./dev-warn.js";

/** Runtime set from a literal tuple — single source of truth with the exported type. */
export function strictEnumSet<T extends string>(values: readonly T[]): ReadonlySet<T> {
  return new Set(values);
}

/** Coerce an attribute/property string to a known union member or fallback. */
export function normalizeStrictEnum<T extends string>(
  value: string,
  allowed: ReadonlySet<T>,
  fallback: T,
  warn?: { host: Element; prop: string },
): T {
  const normalized = allowed.has(value as T) ? (value as T) : fallback;
  if (warn && value && value !== normalized) {
    devWarnInvalidPropValue(warn.host, warn.prop, value, [...allowed], fallback);
  }
  return normalized;
}

/** Bind allowed values + fallback once per finite `@property`. */
export function createStrictEnum<T extends string>(
  values: readonly T[],
  fallback: T,
): {
  readonly values: readonly T[];
  readonly set: ReadonlySet<T>;
  normalize: (value: string) => T;
} {
  const set = strictEnumSet(values);
  return {
    values,
    set,
    normalize: (value: string) => normalizeStrictEnum(value, set, fallback),
  };
}

/** Normalize changed finite-string props in `willUpdate` (invalid attrs → default). */
export function coerceChangedStrictProps(
  changed: PropertyValues,
  host: object,
  entries: ReadonlyArray<readonly [string, ReturnType<typeof createStrictEnum<string>>]>,
): void {
  const record = host as Record<string, unknown>;
  for (const [key, spec] of entries) {
    if (changed.has(key)) {
      record[key] = spec.normalize(String(record[key] ?? ""));
    }
  }
}
