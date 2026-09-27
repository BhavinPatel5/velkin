/** Public type aliases for `<vu-color-swatch>`. Re-exported from the component file. */

/** Visual size preset; override per-instance with `--color-swatch-size`. */
export type VuColorSwatchSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Chip outline: full circle or square (sharp corners). */
export type VuColorSwatchShape = "circle" | "square";

/** Detail payload for the `vu-select` event fired by selectable swatches when activated. */
export type VuColorSwatchSelectDetail = {
  /** The CSS color string the swatch was rendered with — hex, rgb, hsl, named, etc. */
  color: string;
  /** The optional `value` attribute (defaults to the color). Useful when consumers want to ferry an id through. */
  value: string;
};
