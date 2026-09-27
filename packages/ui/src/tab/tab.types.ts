/** Discrete size preset; `sm`|`md`|`lg` align with list/tree, `xs`/`xl` are density extras. */
export type VuTabSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Explicit corner preset; `full` is capsule ends, `none` is square. */
export type VuTabRadius = "none" | "sm" | "md" | "lg" | "full";

/** Layout axis for segment list — horizontal row (default) or vertical stack. */
export type VuTabOrientation = "horizontal" | "vertical";

/** Intent token for the active thumb; per-item `color` overrides this (token keys only, same as vu-button). */
export type VuTabColor = "default" | "primary" | "success" | "warning" | "danger";

/** One segment entry — shorthand string or full object. */
export type VuTabStateObject = {
  value: string;
  label?: string;
  icon?: string;
  disabled?: boolean;
  color?: VuTabColor;
};

export type VuTabStateItem = string | VuTabStateObject;

/** Normalized segment used internally after coercing shorthand strings. */
export type VuTabNormalizedItem = {
  value: string;
  label?: string;
  icon?: string;
  disabled?: boolean;
  color?: VuTabColor;
};

/** Detail payload for the `vu-change` event. */
export type VuTabChangeDetail = {
  value: string;
  previous: string;
  index: number;
  item: VuTabNormalizedItem;
  /** Segment button the user activated; `null` for programmatic updates that do not emit. */
  source: HTMLElement | null;
};
