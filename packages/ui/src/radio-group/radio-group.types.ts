/** Layout axis for stacked `<vu-radio>` children. */
export type VuRadioGroupOrientation = "horizontal" | "vertical";

/** Emitted when a member is selected; `value` mirrors host `value` when controlled. */
export type VuRadioGroupChangeDetail = {
  value: string;
  source: HTMLElement | null;
};

/** Payload for `vu-invalid` after a validation run. */
export type VuRadioGroupValidationErrorDetail = {
  errors: string[];
};
