/** Visual variants supported by `<vu-accordion>`. Prefer `split`; `splitted` is a compatibility alias. */
export type VuAccordionVariant = "light" | "solid" | "outline" | "split" | "splitted";

/** Header/body density scale — aligns with list/tree `sm`|`md`|`lg`. */
export type VuAccordionSize = "sm" | "md" | "lg";

export type { VuSurfaceTone as VuAccordionTone } from "../internals/utils/surface-tone.js";
