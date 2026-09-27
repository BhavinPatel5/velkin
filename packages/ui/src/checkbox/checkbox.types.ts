/** Public type aliases for `<vu-checkbox>`. Re-exported from `checkbox.ts`. */

import type { VuSurfaceTone } from "../internals/utils/surface-tone.js";

/** Discrete control scale; mirrors `VuButtonSize`. */
export type VuCheckboxSize = "sm" | "md" | "lg";

/** Neutral idle-box weight; `color` still pins the checked accent. */
export type VuCheckboxTone = VuSurfaceTone;

/** Explicit corner preset; `full` is capsule ends, `none` is square. */
export type VuCheckboxRadius = "none" | "sm" | "md" | "lg" | "full";

/** Intent palette; mirrors `VuButtonColor` — token keys only, no arbitrary CSS colors. */
export type VuCheckboxColor = "default" | "primary" | "success" | "warning" | "danger";

/** Visual treatment of the box and label chrome. */
export type VuCheckboxVariant = "default" | "soft" | "outline";

/** First click from `indeterminate`: native `check` (default) or force `uncheck`. */
export type VuCheckboxIndeterminateClick = "check" | "uncheck";

/** Payload for `vu-change`. */
export type VuCheckboxChangeDetail = {
  checked: boolean;
  value: string | boolean | undefined;
};

/** Payload for `vu-invalid`. */
export type VuCheckboxValidationErrorDetail = { errors: string[] };

/** Payload for `vu-clear` after `reset()`. */
export type VuCheckboxValueClearedDetail = { value: string; checked: boolean };
