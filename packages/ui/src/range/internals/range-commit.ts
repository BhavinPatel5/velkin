import type { VuRangeChangeDetail, VuRangeClearDetail } from "../range.types.js";

/** Commit surface for range change emission. */
export type RangeCommitHost = {
  from: number;
  to: number;
  _lastCommittedFrom: number;
  _lastCommittedTo: number;
  dispatchEvent(event: Event): boolean;
};

/** Emits `vu-change` when the range changed since the last emission. */
export function emitRangeChange(host: RangeCommitHost): void {
  if (host.from === host._lastCommittedFrom && host.to === host._lastCommittedTo) {
    return;
  }
  host._lastCommittedFrom = host.from;
  host._lastCommittedTo = host.to;
  const detail: VuRangeChangeDetail = { from: host.from, to: host.to };
  host.dispatchEvent(
    new CustomEvent<VuRangeChangeDetail>("vu-change", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}

/** Emits `vu-clear` after `reset()`. */
export function dispatchRangeClear(host: RangeCommitHost): void {
  const detail: VuRangeClearDetail = { from: host.from, to: host.to };
  host.dispatchEvent(
    new CustomEvent<VuRangeClearDetail>("vu-clear", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}
