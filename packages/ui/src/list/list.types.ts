import type { VuListitem } from "../list-item/list-item.js";

/** How `<vu-list>` treats item selection. */
export type VuListSelectionMode = "none" | "single" | "multiple";

/** Payload for `vu-change` on `<vu-list>`. */
export type VuListChangeDetail = {
  selectedItems: VuListitem[];
  /** Values from each selected item's `value` (empty string when unset). */
  selectedValues: string[];
};

/** Density preset forwarded to items when they omit their own `size`. */
export type VuListSize = "sm" | "md" | "lg";

export type { VuSurfaceTone as VuListTone } from "../internals/utils/surface-tone.js";
