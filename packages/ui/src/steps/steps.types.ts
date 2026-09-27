/** Layout direction for the step navigator. */
export type VuStepsLayout = "horizontal" | "vertical";

/** Visual state for a step indicator. */
export type VuStepStatus = "wait" | "process" | "finish" | "error";

/** Label position relative to the step node. */
export type VuStepsLabelPlacement = "inline" | "below";

/** Size preset for nodes, labels, and spacing. */
export type VuStepsSize = "sm" | "md" | "lg";

/** Navigator chrome variant. */
export type VuStepsVariant = "default" | "dots" | "progress";

/** One step when using the `steps` prop instead of slotted `<vu-step-item>`. */
export type VuStepStateItem = {
  label: string;
  subtitle?: string;
  disabled?: boolean;
  optional?: boolean;
  icon?: string;
  checkedIcon?: string;
  status?: VuStepStatus;
};

/** Normalized step used internally by the coordinator. */
export type VuStepNormalizedItem = {
  label: string;
  subtitle?: string;
  disabled: boolean;
  optional: boolean;
  icon?: string;
  checkedIcon?: string;
  status?: VuStepStatus;
};

/** User-driven step change payload; call `cancel()` to block navigation. */
export type VuStepsChangeDetail = {
  step: number;
  previous: number;
  cancel: () => void;
};
