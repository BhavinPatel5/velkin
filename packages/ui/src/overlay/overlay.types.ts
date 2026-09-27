/** Who initiated close — parent sets `open` false when `vu-close` is not prevented. */
export type VuOverlayCloseReason = "backdrop" | "escape";

/** Payload for cancelable `vu-close`. */
export type VuOverlayCloseDetail = {
  reason: VuOverlayCloseReason;
};
