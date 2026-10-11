import { css } from "lit";

/** Surface-stack glass aliases — Role C / D hosts paint with `--vu-surface-fill` / `--vu-surface-blur`. */
export const glassSurfaceHost = css`
  :host {
    --glass-fill: var(--vu-surface-fill, 100%);
    --glass-blur: var(--vu-surface-blur, var(--vu-blur-none));
  }
`;

/** Overlay-stack glass aliases — Role C′ hosts paint with `--vu-overlay-fill` / `--vu-overlay-blur`. */
export const glassOverlayHost = css`
  :host {
    --glass-fill: var(--vu-overlay-fill, 100%);
    --glass-blur: var(--vu-overlay-blur, var(--vu-blur-none));
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
