export type NumericStepperBounds = {
  min: number;
  max?: number;
  step: number;
  precision: number;
  wrap: boolean;
};

export function roundPrecision(n: number, precision: number): number {
  if (!Number.isFinite(n) || precision <= 0) return n;
  const f = 10 ** precision;
  return Math.round(n * f) / f;
}

export function clampNumber(n: number, min: number, max?: number): number {
  if (!Number.isFinite(n)) return n;
  let v = n;
  if (v < min) v = min;
  if (max !== undefined && v > max) v = max;
  return v;
}

export function snapToStep(n: number, bounds: NumericStepperBounds): number {
  if (!(bounds.step > 0) || !Number.isFinite(n)) return n;
  const base = Number.isFinite(bounds.min) ? bounds.min : 0;
  const k = Math.round((n - base) / bounds.step);
  return roundPrecision(base + k * bounds.step, bounds.precision);
}

export function normalizeStepperNumber(n: number, bounds: NumericStepperBounds): number {
  if (!Number.isFinite(n)) return n;
  return clampNumber(snapToStep(n, bounds), bounds.min, bounds.max);
}

export function stepWrapped(current: number, delta: number, bounds: NumericStepperBounds): number {
  if (!bounds.wrap || bounds.max === undefined) {
    return clampNumber(snapToStep(current + delta, bounds), bounds.min, bounds.max);
  }
  const span = bounds.max - bounds.min + bounds.step;
  if (!(span > 0)) return clampNumber(current, bounds.min, bounds.max);
  let next = current + delta;
  while (next > bounds.max) next -= span;
  while (next < bounds.min) next += span;
  return roundPrecision(next, bounds.precision);
}

export function canDecrease(value: number, bounds: NumericStepperBounds): boolean {
  if (bounds.wrap) return true;
  return !Number.isFinite(value) || value - bounds.step >= bounds.min;
}

export function canIncrease(value: number, bounds: NumericStepperBounds): boolean {
  if (bounds.wrap) return true;
  if (bounds.max === undefined) return true;
  return !Number.isFinite(value) || value + bounds.step <= bounds.max;
}
