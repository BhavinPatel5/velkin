/** Layout axis for stacked `<vu-checkbox>` children. */
export type VuCheckboxGroupOrientation = "horizontal" | "vertical";

/** Emitted when a member toggles; `values` is the new selection (DOM order); mirrors host `values` when controlled. */
export type VuCheckboxGroupChangeDetail = {
  values: string[];
  source: HTMLElement | null;
};

/** Explicit corner preset; `full` is capsule ends, `none` is square. */
export type VuCheckboxGroupRadius = "none" | "sm" | "md" | "lg" | "full";

/** Payload for `vu-invalid` after a validation run. */
export type VuCheckboxGroupValidationErrorDetail = {
  errors: string[];
};
