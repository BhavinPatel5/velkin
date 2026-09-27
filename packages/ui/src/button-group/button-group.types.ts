import type { VuButtonColor, VuButtonSize, VuButtonVariant } from "../button/button.types.js";

/** Visual treatment forwarded to children. `link` is excluded — links don't form a segmented control. */
export type VuButtonGroupVariant = Exclude<VuButtonVariant, "link">;

/** Token intent forwarded to children. Mirrors `VuButtonColor`. */
export type VuButtonGroupColor = VuButtonColor;

/** Discrete size forwarded to children. Mirrors `VuButtonSize`. */
export type VuButtonGroupSize = VuButtonSize;

/** Explicit corner preset; `full` is capsule ends, `none` is square. */
export type VuButtonGroupRadius = "none" | "sm" | "md" | "lg" | "full";

/** Layout axis; `horizontal` (default) lays children inline, `vertical` stacks them. */
export type VuButtonGroupOrientation = "horizontal" | "vertical";

/** Position of a child inside an attached cluster — set by the group on each `<vu-button>` for corner flattening. */
export type VuButtonAttached = "first" | "middle" | "last" | "only";

/** Selection model for a `<vu-button-group>`. */
export type VuButtonGroupSelectionMode = "none" | "single" | "multiple";

/** Detail payload for the `vu-change` event fired when the cluster's selection changes. */
export type VuButtonGroupChangeDetail = {
  /** Selected value when `selectionMode === "single"`; `""` when nothing is selected. Always `""` in `multiple` / `none` modes. */
  value: string;
  /** Selected values when `selectionMode === "multiple"`. Single-element array in `single` mode (or empty). Always `[]` in `none` mode. */
  values: string[];
  /** The button the user activated to cause this change; `null` for programmatic value updates. */
  source: HTMLElement | null;
};
