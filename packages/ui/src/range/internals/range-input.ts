import {
  clampRangeValue,
  normalizeRangeSelection,
  snapRangeValue,
  type RangeBoundsHost,
} from "./range-value.js";

/** Range thumb handler surface. */
export type RangeInputHost = RangeBoundsHost & {
  commitOnly: boolean;
  disabled: boolean;
  readonly: boolean;
  requestUpdate(name?: PropertyKey, oldValue?: unknown): void;
  onRangeChange(): void;
};

function canMoveFrom(host: RangeInputHost, value: number): boolean {
  return value < host.to;
}

function canMoveTo(host: RangeInputHost, value: number): boolean {
  return value > host.from;
}

/** Live `input` on the lower thumb. */
export function handleRangeFromInput(host: RangeInputHost, event: Event): void {
  if (host.disabled || host.readonly) return;
  const input = event.target as HTMLInputElement;
  const clamped = clampRangeValue(host, Number(input.value));
  if (!canMoveFrom(host, clamped)) return;

  if (host.commitOnly) {
    host.from = clamped;
    host.requestUpdate("from");
    return;
  }

  const snapped = snapRangeValue(host, clamped);
  if (!canMoveFrom(host, snapped)) return;
  if (snapped === host.from) return;

  host.from = snapped;
  host.requestUpdate("from");
  host.onRangeChange();
}

/** Committed `change` on the lower thumb. */
export function handleRangeFromChange(host: RangeInputHost, event: Event): void {
  if (host.disabled || host.readonly) return;
  const input = event.target as HTMLInputElement;
  const normalized = normalizeRangeSelection(host, Number(input.value), host.to);
  if (!normalized) {
    input.value = String(host.from);
    return;
  }

  host.from = normalized.from;
  input.value = String(host.from);
  host.requestUpdate("from");

  if (!host.commitOnly) return;
  host.onRangeChange();
}

/** Live `input` on the upper thumb. */
export function handleRangeToInput(host: RangeInputHost, event: Event): void {
  if (host.disabled || host.readonly) return;
  const input = event.target as HTMLInputElement;
  const clamped = clampRangeValue(host, Number(input.value));
  if (!canMoveTo(host, clamped)) return;

  if (host.commitOnly) {
    host.to = clamped;
    host.requestUpdate("to");
    return;
  }

  const snapped = snapRangeValue(host, clamped);
  if (!canMoveTo(host, snapped)) return;
  if (snapped === host.to) return;

  host.to = snapped;
  host.requestUpdate("to");
  host.onRangeChange();
}

/** Committed `change` on the upper thumb. */
export function handleRangeToChange(host: RangeInputHost, event: Event): void {
  if (host.disabled || host.readonly) return;
  const input = event.target as HTMLInputElement;
  const normalized = normalizeRangeSelection(host, host.from, Number(input.value));
  if (!normalized) {
    input.value = String(host.to);
    return;
  }

  host.to = normalized.to;
  input.value = String(host.to);
  host.requestUpdate("to");

  if (!host.commitOnly) return;
  host.onRangeChange();
}
