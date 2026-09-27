/** Public type aliases for `<vu-radio>`. Re-exported from `radio.ts`. */

import type { VuSurfaceTone } from "../internals/utils/surface-tone.js";

/** Discrete control scale; mirrors `VuCheckboxSize`. */
export type VuRadioSize = "sm" | "md" | "lg";

/** Neutral idle-ring weight; `color` still pins the checked accent. */
export type VuRadioTone = VuSurfaceTone;

/** Intent palette; mirrors `VuCheckboxColor`. */
export type VuRadioColor = "default" | "primary" | "success" | "warning" | "danger";

/** Visual treatment of the ring and label chrome. */
export type VuRadioVariant = "default" | "soft" | "outline";

/** Payload for `vu-change`. */
export type VuRadioChangeDetail = {
  checked: boolean;
  value: string | undefined;
};

/** Payload for `vu-invalid`. */
export type VuRadioValidationErrorDetail = { errors: string[] };

/** Payload for `vu-clear` after `reset()`. */
export type VuRadioValueClearedDetail = { value: string; checked: boolean };
