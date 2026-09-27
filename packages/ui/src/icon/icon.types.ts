/** Icon box width — CSS length or unitless px. */
export type VuIconSizeValue = string | number;

/** Rotation — quarter turns (number), `deg` string, or numeric string. */
export type VuIconRotateValue = string | number;

/** Flip descriptor matching Iconify vocabulary. */
export type VuIconFlip = "" | "horizontal" | "vertical" | "horizontal,vertical";

/** Iconify collection defaults (viewBox offsets and default box). */
export interface IconifyCollection {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

/** Iconify set payload for `registerLocalSet`. */
export interface IconifySetData extends IconifyCollection {
  icons?: Record<string, IconifyIcon>;
}

/** Single Iconify glyph body and optional overrides. */
export interface IconifyIcon {
  body?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  viewBox?: string;
}
