/** Preferred expansion side before viewport flip. */
export type VuSpeeddialDirection = "top" | "bottom" | "left" | "right";

/** FAB intent color (Role A). */
export type VuSpeeddialColor = "default" | "primary" | "success" | "warning" | "danger";

/** FAB hit-target scale. */
export type VuSpeeddialSize = "sm" | "md" | "lg";

/** `vu-open-change` when `open` toggles (controlled / v-model:open). */
export type VuSpeeddialOpenChangeDetail = {
  open: boolean;
  /** Resolved expansion side after viewport clamping. */
  direction: VuSpeeddialDirection;
};
