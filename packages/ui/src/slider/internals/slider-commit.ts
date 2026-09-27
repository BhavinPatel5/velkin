import type { VuSliderChangeDetail, VuSliderClearDetail } from "../slider.types.js";

/** Commit surface for slider change emission. */
export type SliderCommitHost = {
  value: number;
  _lastCommitted: number;
  dispatchEvent(event: Event): boolean;
};

/** Emits `vu-change` when the value changed since the last emission. */
export function emitSliderChange(host: SliderCommitHost): void {
  if (host.value === host._lastCommitted) return;
  host._lastCommitted = host.value;
  const detail: VuSliderChangeDetail = { value: host.value };
  host.dispatchEvent(
    new CustomEvent<VuSliderChangeDetail>("vu-change", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}

/** Emits `vu-clear` after `reset()`. */
export function dispatchSliderClear(host: SliderCommitHost): void {
  const detail: VuSliderClearDetail = { value: host.value };
  host.dispatchEvent(
    new CustomEvent<VuSliderClearDetail>("vu-clear", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}
