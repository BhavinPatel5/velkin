/** Public type aliases for `<vu-switch>`. Re-exported from `switch.ts`. */

import type { VuSurfaceTone } from "../internals/utils/surface-tone.js";

/** Discrete control scale; mirrors `VuCheckboxSize`. */
export type VuSwitchSize = "sm" | "md" | "lg";

/** Neutral idle-track weight; `color` still pins the checked accent. */
export type VuSwitchTone = VuSurfaceTone;

/** Intent palette; mirrors `VuCheckboxColor`. */
export type VuSwitchColor = "default" | "primary" | "success" | "warning" | "danger";

/** Visual treatment of the track and label chrome. */
export type VuSwitchVariant = "default" | "soft" | "outline";

/** Payload for `vu-change`. */
export type VuSwitchChangeDetail = {
  checked: boolean;
  value: string | boolean | undefined;
};

/** Payload for `vu-invalid`. */
export type VuSwitchValidationErrorDetail = { errors: string[] };

/** Payload for `vu-clear` after `reset()`. */
export type VuSwitchValueClearedDetail = { value: string; checked: boolean };
