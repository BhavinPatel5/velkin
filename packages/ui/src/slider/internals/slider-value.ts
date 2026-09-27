/** Bounds surface shared by slider handlers and the host. */
export type SliderBoundsHost = {
  min: number;
  max: number;
  step: number;
  value: number;
};

/** Clamps a number into `[min, max]`. */
export function clampSliderValue(host: SliderBoundsHost, value: number): number {
  return Math.min(host.max, Math.max(host.min, value));
}

/** Rounds a value to the nearest positive `step`. */
export function snapSliderValue(host: SliderBoundsHost, value: number): number {
  const step = host.step > 0 ? host.step : 1;
  return Math.round(value / step) * step;
}

/** Decimal places for the value summary from `step`. */
export function sliderValueDecimals(step: number): number {
  return step < 1 ? 2 : 0;
}

/** Formats the value for the header summary. */
export function formatSliderValue(value: number, step: number): string {
  return value.toFixed(sliderValueDecimals(step));
}

/** Parses `defaultValue` / form state as a number. */
export function parseSliderFormState(state: string, host: SliderBoundsHost): number | null {
  const next = Number(state.trim());
  if (Number.isNaN(next)) return null;
  return snapSliderValue(host, clampSliderValue(host, next));
}

/** Serializes the current value for form submission. */
export function serializeSliderFormValue(value: number): string {
  return String(value);
}

/** Fill width percent for the accent segment (`0` at min, `100` at max). */
export function sliderFillPercent(host: SliderBoundsHost, position: number): number {
  const span = Math.max(1, host.max - host.min);
  const clamped = clampSliderValue(host, position);
  return ((clamped - host.min) / span) * 100;
}
