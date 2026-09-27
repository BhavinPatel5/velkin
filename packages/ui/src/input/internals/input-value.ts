import type { VuInputValue } from "../input.types.js";

/** Emitted scalar for text/number fields; empty stays empty. */
export function emittedInputValue(type: string, value: VuInputValue): string | number {
  if (type !== "number") return value == null ? "" : (value as string | number);
  if (value === "" || value == null) return "";
  const n = Number(value);
  return Number.isFinite(n) ? n : (value as string);
}

export function stepInputNumber(
  value: VuInputValue,
  step: string | null,
  min: string | null,
  max: string | null,
  direction: 1 | -1,
): string | null {
  const current = parseFloat(String(value ?? "")) || 0;
  const delta = parseFloat(step ?? "") || 1;
  const next = current + delta * direction;
  const minN = min != null ? parseFloat(min) : -Infinity;
  const maxN = max != null ? parseFloat(max) : Infinity;
  if (next < minN || next > maxN) return null;
  return String(next);
}
