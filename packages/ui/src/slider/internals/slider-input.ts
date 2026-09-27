import { clampSliderValue, snapSliderValue, type SliderBoundsHost } from "./slider-value.js";

/** Slider thumb handler surface. */
export type SliderInputHost = SliderBoundsHost & {
  displayValue: number;
  commitOnly: boolean;
  disabled: boolean;
  readonly: boolean;
  requestUpdate(name?: PropertyKey, oldValue?: unknown): void;
  onSliderChange(): void;
};

/** Live `input` on the thumb. */
export function handleSliderInput(host: SliderInputHost, event: Event): void {
  if (host.disabled || host.readonly) return;
  const input = event.target as HTMLInputElement;
  const clamped = clampSliderValue(host, Number(input.value));

  if (host.commitOnly) {
    host.displayValue = clamped;
    host.requestUpdate("displayValue");
    return;
  }

  const snapped = snapSliderValue(host, clamped);
  if (snapped === host.value) return;

  host.value = snapped;
  host.displayValue = snapped;
  host.requestUpdate("value");
  host.onSliderChange();
}

/** Committed `change` on the thumb. */
export function handleSliderChange(host: SliderInputHost, event: Event): void {
  if (host.disabled || host.readonly) return;
  const input = event.target as HTMLInputElement;
  const snapped = snapSliderValue(host, clampSliderValue(host, Number(input.value)));

  host.value = snapped;
  host.displayValue = snapped;
  input.value = String(snapped);
  host.requestUpdate("value");

  if (!host.commitOnly) return;
  host.onSliderChange();
}
