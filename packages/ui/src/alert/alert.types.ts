/** Intent palette — token keys only. */
export type VuAlertColor = "default" | "primary" | "success" | "warning" | "danger";

/** Visual treatment — aligned with `vu-button` / `vu-chip` vocabulary. */
export type VuAlertVariant = "solid" | "soft" | "outline" | "ghost";

/** Discrete padding + type scale. */
export type VuAlertSize = "sm" | "md" | "lg";

/** Who initiated close — mirrors `vu-chip` close reasons. */
export type VuAlertCloseReason = "user" | "method";

/** Payload for cancelable `vu-close` before optional host removal. */
export type VuAlertCloseDetail = {
  heading: string;
  message: string;
  reason: VuAlertCloseReason;
};
