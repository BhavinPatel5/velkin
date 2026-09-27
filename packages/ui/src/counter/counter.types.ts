/** Payload for `vu-change` when the numeric value updates. */
export type VuCounterChangeDetail = {
  value: number;
  previous: number;
  reason: VuCounterChangeReason;
};

/** Who initiated the value change. */
export type VuCounterChangeReason = "increment" | "decrement" | "input" | "programmatic";

/** Payload for `vu-clear` after `reset()` restores the default value. */
export type VuCounterClearDetail = {
  value: number;
};

/** Payload for `vu-invalid` when validation messages are recomputed while `validationActive`. */
export type VuCounterInvalidDetail = {
  errors: string[];
};

/** Discrete control scale; mirrors `VuButtonSize`. */
export type VuCounterSize = "sm" | "md" | "lg";

/** Explicit corner preset; `full` is capsule ends, `none` is square. */
export type VuCounterRadius = "none" | "sm" | "md" | "lg" | "full";

/** Neutral surface weight for the stepper chrome (`variant` + `tone`, no intent `color`). */
export type { VuSurfaceTone as VuCounterTone } from "../internals/utils/surface-tone.js";

/** Visual treatment of the stepper chrome (Role E field variants). */
export type { VuFieldVariant as VuCounterVariant } from "../internals/utils/field-variant.js";
