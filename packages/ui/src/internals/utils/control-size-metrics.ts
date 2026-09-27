/** Shared `size` union for Role A / D / E controls. */
export type VuControlSize = "sm" | "md" | "lg";

/** CSS custom properties set by `controlSizeMetricsTokens` — alias in component styles. */
export const CONTROL_SIZE_METRICS_ACTION = {
  py: "--vu-csm-action-py",
  px: "--vu-csm-action-px",
  gap: "--vu-csm-action-gap",
  minBlockSize: "--vu-csm-action-min-block-size",
  fontSize: "--vu-csm-action-font-size",
  iconSize: "--vu-csm-action-icon-size",
  spinnerSize: "--vu-csm-action-spinner-size",
} as const;

/** Field chrome metrics — slightly roomier pad and md body type at default size. */
export const CONTROL_SIZE_METRICS_FIELD = {
  py: "--vu-csm-field-py",
  px: "--vu-csm-field-px",
  gap: "--vu-csm-field-gap",
  minBlockSize: "--vu-csm-field-min-block-size",
  fontSize: "--vu-csm-field-font-size",
  iconSize: "--vu-csm-field-icon-size",
  btnPx: "--vu-csm-field-btn-px",
} as const;

/** Role D chrome shells — taller than inline controls (`--vu-chrome-height-*`). */
export const CONTROL_SIZE_METRICS_CHROME = {
  minBlockSize: "--vu-csm-chrome-min-block-size",
  fontSize: "--vu-csm-chrome-font-size",
} as const;

/** Overlay / alert dismiss control — one step smaller than Role A hit targets. */
export const CONTROL_SIZE_METRICS_DISMISS = {
  size: "--vu-csm-dismiss-size",
  iconSize: "--vu-csm-dismiss-icon-size",
} as const;
