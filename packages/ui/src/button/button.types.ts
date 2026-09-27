/** Public type aliases for `<vu-button>`. Re-exported from the component file too. */

/** Visual treatment — five archetypes covering the common button vocabulary. */
export type VuButtonVariant = "solid" | "soft" | "outline" | "ghost" | "link";

/** Token-driven intent palette. Custom CSS colors are not supported; consumers wrap a `<vu-button>` in their own surface to recolor. */
export type VuButtonColor = "default" | "primary" | "success" | "warning" | "danger";

/** Discrete size scale matching `vu-alert` / `vu-avatar` / `vu-breadcrumb`. */
export type VuButtonSize = "sm" | "md" | "lg";

/** Explicit corner preset; `full` is capsule ends, `none` is square. */
export type VuButtonRadius = "none" | "sm" | "md" | "lg" | "full";

/** Native `<button>` type values. */
export type VuButtonType = "button" | "submit" | "reset";
