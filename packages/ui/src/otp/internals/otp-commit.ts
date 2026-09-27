import type { VuOtpChangeDetail, VuOtpClearDetail } from "../otp.types.js";

/** Commit surface for blur/enter handlers. */
export type OtpCommitHost = {
  disabled: boolean;
  value: string;
  length: number;
  _lastCommitted: string;
  _activateAndValidate(): void;
  dispatchEvent(event: Event): boolean;
};

/** Commits the current value, validates, and emits `vu-change` when it changed. */
export function commitOtpValue(host: OtpCommitHost & { _lastCommitted: string }): void {
  if (host.disabled) return;

  const canonical = (host.value ?? "").slice(0, host.length);
  host._activateAndValidate();

  if (canonical !== host._lastCommitted) {
    host._lastCommitted = canonical;
    const detail: VuOtpChangeDetail = { value: canonical };
    host.dispatchEvent(
      new CustomEvent<VuOtpChangeDetail>("vu-change", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }
}

/** Clears OTP state and emits `vu-clear`. */
export function dispatchOtpClear(host: OtpCommitHost, value: string): void {
  const detail: VuOtpClearDetail = { value };
  host.dispatchEvent(
    new CustomEvent<VuOtpClearDetail>("vu-clear", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}
