/** Bounds surface shared by range handlers and the host. */
export type RangeBoundsHost = {
  min: number;
  max: number;
  step: number;
  from: number;
  to: number;
};

/** Clamps a number into `[min, max]`. */
export function clampRangeValue(host: RangeBoundsHost, value: number): number {
  return Math.min(host.max, Math.max(host.min, value));
}

/** Rounds a value to the nearest positive `step`. */
export function snapRangeValue(host: RangeBoundsHost, value: number): number {
  const step = host.step > 0 ? host.step : 1;
  return Math.round(value / step) * step;
}

/** Normalizes `from`/`to` so `from < to` after clamping and snapping. */
export function normalizeRangeSelection(
  host: RangeBoundsHost,
  from: number,
  to: number,
): { from: number; to: number } | null {
  const nextFrom = snapRangeValue(host, clampRangeValue(host, from));
  const nextTo = snapRangeValue(host, clampRangeValue(host, to));
  if (nextFrom >= nextTo) return null;
  return { from: nextFrom, to: nextTo };
}

/** Decimal places for the value summary from `step`. */
export function rangeValueDecimals(step: number): number {
  return step < 1 ? 2 : 0;
}

/** Formats one endpoint for the value summary. */
export function formatRangeEndpoint(value: number, step: number): string {
  return value.toFixed(rangeValueDecimals(step));
}

/** Parses `defaultValue` / form state `"from,to"`. */
export function parseRangeFormState(
  state: string,
  host: RangeBoundsHost,
): { from: number; to: number } | null {
  const parts = state.split(",").map((s) => Number(s.trim()));
  if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return null;
  return normalizeRangeSelection(host, parts[0], parts[1]);
}

/** Serializes the current range for form submission. */
export function serializeRangeFormValue(from: number, to: number): string {
  return `${from},${to}`;
}

/** Percent offsets for the selected highlight segment and thumb positions. */
export function rangeHighlightPercents(host: RangeBoundsHost): {
  fromPct: number;
  toPct: number;
  widthPct: number;
} {
  const span = Math.max(1, host.max - host.min);
  const fromPct = ((host.from - host.min) / span) * 100;
  const toPct = ((host.to - host.min) / span) * 100;
  return { fromPct, toPct, widthPct: Math.max(0, toPct - fromPct) };
}
