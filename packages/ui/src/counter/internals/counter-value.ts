import type { FieldValidationController } from "../../internals/form/field-validation-controller.js";
import type { VuCounterChangeDetail, VuCounterChangeReason } from "../counter.types.js";

/** Value / input surface the counter value helpers mutate. */
export type CounterValueHost = {
  value: number;
  min: number;
  max?: number;
  step: number;
  disabled: boolean;
  readonly: boolean;
  allowTyping: boolean;
  allowEmpty: boolean;
  commitOnly: boolean;
  defaultNumber: number;
  _lastCommitted: number;
  _validation: FieldValidationController;
  normalizeNumber(n: number): number;
  clamp(n: number): number;
  stepWrapped(current: number, delta: number): number;
  syncFormValue(): void;
  syncValidity(): void;
  validateInput(): boolean;
  setValue(next: number): void;
  dispatchEvent(event: Event): boolean;
};

/** Assigns `value` and optionally emits `vu-change` when it differs from the last committed value. */
export function commitCounterValue(
  host: CounterValueHost,
  next: number,
  reason: VuCounterChangeReason,
  emit: boolean,
): void {
  const previous = Number.isFinite(host.value) ? host.value : host._lastCommitted;
  if (Object.is(previous, next) && !emit) {
    host.value = next;
    return;
  }
  host.value = next;
  if (emit) {
    emitCounterChange(host, reason, previous);
  }
}

/** Dispatches `vu-change` and updates `_lastCommitted`. */
export function emitCounterChange(
  host: CounterValueHost,
  reason: VuCounterChangeReason,
  previous: number,
): void {
  const detail: VuCounterChangeDetail = {
    value: host.value,
    previous,
    reason,
  };
  host.dispatchEvent(
    new CustomEvent<VuCounterChangeDetail>("vu-change", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
  host._lastCommitted = Number.isFinite(host.value) ? host.value : previous;
}

/** Applies a signed step delta, validates, and syncs form state. */
export function applyCounterStep(
  host: CounterValueHost,
  delta: number,
  reason: "increment" | "decrement",
): void {
  if (host.disabled || host.readonly) return;
  const base = Number.isFinite(host.value) ? host.value : host.min;
  const next = host.stepWrapped(base, delta);
  host._validation.activate();
  commitCounterValue(host, next, reason, true);
  host.validateInput();
  host.syncFormValue();
  host.syncValidity();
}

/** Handles live typing in the number input. */
export function onCounterInputChange(host: CounterValueHost, e: Event): void {
  if (host.disabled || host.readonly || !host.allowTyping) return;

  const raw = (e.target as HTMLInputElement).value;

  if (raw.trim() === "") {
    host.value = host.allowEmpty ? Number.NaN : host.min;
  } else {
    const parsed = Number(raw);
    host.value = Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  host._validation.activate();
  if (!host.commitOnly) {
    const next = Number.isFinite(host.value) ? host.normalizeNumber(host.value) : host.value;
    commitCounterValue(host, next, "input", true);
    host.validateInput();
  }

  host.syncFormValue();
  host.syncValidity();
}

/** Normalizes on blur and emits `vu-change` when the committed value changed. */
export function onCounterInputBlur(host: CounterValueHost): void {
  host._validation.activate();
  const previous = host._lastCommitted;
  if (!Number.isFinite(host.value)) {
    if (!host.allowEmpty) host.value = host.clamp(host.defaultNumber);
  } else {
    host.value = host.normalizeNumber(host.value);
  }
  const changed =
    !(Number.isNaN(previous) && Number.isNaN(host.value)) && !Object.is(previous, host.value);
  if (changed) emitCounterChange(host, "input", previous);
  host.validateInput();
  host.syncFormValue();
  host.syncValidity();
}

/** Arrow / Page / Home / End keyboard stepping for the spinbutton input. */
export function onCounterKeyDown(host: CounterValueHost, e: KeyboardEvent): void {
  if (host.disabled || host.readonly) return;
  const pageDelta = host.step * 10;
  switch (e.key) {
    case "ArrowUp":
      e.preventDefault();
      applyCounterStep(host, host.step, "increment");
      break;
    case "ArrowDown":
      e.preventDefault();
      applyCounterStep(host, -host.step, "decrement");
      break;
    case "PageUp":
      e.preventDefault();
      applyCounterStep(host, pageDelta, "increment");
      break;
    case "PageDown":
      e.preventDefault();
      applyCounterStep(host, -pageDelta, "decrement");
      break;
    case "Home":
      e.preventDefault();
      host.setValue(host.min);
      break;
    case "End":
      e.preventDefault();
      if (host.max !== undefined) host.setValue(host.max);
      break;
    default:
      break;
  }
}
