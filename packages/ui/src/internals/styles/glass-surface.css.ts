import { css } from "lit";

/**
 * Soft corner geometry — system `--vu-corner-shape` (squircle under `@supports`).
 * Apply on rectangular rounded surfaces (cards, fields, panels).
 */
export const softCorners = css`
  corner-shape: var(--vu-corner-shape, round);
`;

/**
 * True circles and symmetric pill caps — never inherit system squircle.
 * Use with `border-radius: var(--vu-radius-full)` on controls (radio, switch, sliders).
 */
export const roundCorners = css`
  corner-shape: round;
`;

/** @deprecated Prefer `softCorners` — same rule, kept for existing glass imports. */
export const glassSoftCorners = softCorners;

/** Surface-stack glass aliases — Role C / D hosts paint with `--vu-surface-fill` / `--vu-surface-blur`. */
export const glassSurfaceHost = css`
  :host {
    --glass-fill: var(--vu-surface-fill, 100%);
    --glass-blur: var(--vu-surface-blur, var(--vu-blur-none));
    corner-shape: var(--vu-corner-shape, round);
  }
`;

/** Overlay-stack glass aliases — Role C′ hosts paint with `--vu-overlay-fill` / `--vu-overlay-blur`. */
export const glassOverlayHost = css`
  :host {
    --glass-fill: var(--vu-overlay-fill, 100%);
    --glass-blur: var(--vu-overlay-blur, var(--vu-blur-none));
    corner-shape: var(--vu-corner-shape, round);
  }
`;

/** Force opaque when the user opts out of transparency (also handled globally in `VU_GLASS_CSS`). */
export const glassReducedTransparency = css`
  @media (prefers-reduced-transparency: reduce) {
    :host {
      --glass-fill: 100%;
      --glass-blur: var(--vu-blur-none);
      --vu-surface-fill: 100%;
      --vu-overlay-fill: 100%;
      --vu-surface-blur: var(--vu-blur-none);
      --vu-overlay-blur: var(--vu-blur-none);
      --vu-glass-saturate: 1;
    }
  }
`;
