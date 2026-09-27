import type { VuSerialChangeDetail, VuSerialClearDetail } from "../serial.types.js";

/** Commit surface for blur/enter handlers. */
export type SerialCommitHost = {
  disabled: boolean;
  value: string;
  _lastCommitted: string;
  _activateAndValidate(): void;
  dispatchEvent(event: Event): boolean;
};

/** Commits the current value, validates, and emits `vu-change` when it changed. */
export function commitSerialValue(host: SerialCommitHost & { _lastCommitted: string }): void {
  if (host.disabled) return;

  const canonical = host.value ?? "";
  host._activateAndValidate();

  if (canonical !== host._lastCommitted) {
    host._lastCommitted = canonical;
    const detail: VuSerialChangeDetail = { value: canonical };
    host.dispatchEvent(
      new CustomEvent<VuSerialChangeDetail>("vu-change", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }
}

/** Clears serial state and emits `vu-clear`. */
export function dispatchSerialClear(host: SerialCommitHost, value: string): void {
  const detail: VuSerialClearDetail = { value };
  host.dispatchEvent(
    new CustomEvent<VuSerialClearDetail>("vu-clear", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}
