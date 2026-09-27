/** Public type aliases for `<vu-spinner>`. Re-exported from `spinner.ts`. */

/** Ring and motion visual recipes. */
export type VuSpinnerVariant =
  | "solid"
  | "track"
  | "dashed"
  | "segment"
  | "gradient"
  | "dual"
  | "material"
  | "pulse"
  | "dots"
  | "bars";

/** Size preset; arbitrary CSS lengths are also accepted on the `size` prop. */
export type VuSpinnerSizePreset = "xs" | "sm" | "md" | "lg" | "xl";

/** Foreground intent token (drives `currentColor`). */
export type VuSpinnerColor = "default" | "primary" | "success" | "warning" | "danger";
