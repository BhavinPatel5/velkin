import type { VuFormValidation } from "../internals/form/form-control-base.js";
import type { VuFieldVariant } from "../internals/utils/field-variant.js";
import type { VuSurfaceTone } from "../internals/utils/surface-tone.js";

/** Field chrome scale (Role E); mirrors `vu-counter`. */
export type VuInputSize = "sm" | "md" | "lg";

/** Explicit corner preset; `full` is capsule ends, `none` is square. */
export type VuInputRadius = "none" | "sm" | "md" | "lg" | "full";

/** Neutral surface weight for field chrome. */
export type VuInputTone = VuSurfaceTone;

/** Field chrome recipe (Role E). */
export type VuInputVariant = VuFieldVariant;

/** Supported control modes; native `type` when not `textarea` or `file`. */
export type VuInputType = string;

export type VuInputValue = string | number | null;

/** Same signature as FormControlBase validations. */
export type VuInputValidation = VuFormValidation;

/** `vu-change` when the value updates. */
export type VuInputChangeDetail = {
  value: string | number;
  previous: string | number;
};

/** `vu-clear` after the field is cleared. */
export type VuInputClearDetail = { value: string | number };

/** `vu-invalid` when validation messages are recomputed. */
export type VuInputInvalidDetail = { errors: string[] };

/** `vu-file` after the user selects files (`type="file"`). */
export type VuInputFileDetail = {
  files: File[];
  fileName: string;
  totalSize: number;
  fileCount: number;
};
