import { css } from "lit";

/** Canonical Role C′ overlay panel + row tokens; alias per host (`--dropdown-pad`, `--navbar-menu-pad`, …). */
export const menuOverlayCohesionHost = css`
  --menu-overlay-bg: color-mix(
    in oklab,
    var(--vu-color-overlay) var(--vu-overlay-fill, 85%),
    transparent
  );
  --menu-overlay-fg: var(--vu-color-overlay-foreground);
  --menu-overlay-hover: var(--vu-color-overlay-hover);
  --menu-overlay-shadow: var(--vu-shadow-overlay);
  --menu-overlay-blur: var(--vu-overlay-blur, var(--vu-blur-md));
  --menu-overlay-backdrop-filter: blur(var(--menu-overlay-blur))
    saturate(var(--vu-glass-saturate, 1));
  --menu-overlay-pad: var(--vu-space-1-5);
  --menu-overlay-radius: var(--vu-radius-overlay);
  --menu-overlay-corner-shape: var(--vu-corner-shape, round);
  --menu-overlay-row-pad-block: var(--vu-space-1-5);
  --menu-overlay-row-pad-inline: var(--vu-space-2-5);
  --menu-overlay-row-font-size: var(--vu-font-size-sm);
  /* Denser than field/button control-height — rows size from pad + type with a soft floor. */
  --menu-overlay-row-min-block-size: var(--vu-space-8);
`;

/** Host `tone` overrides overlay background; does not mirror chrome `variant` / `indicator`. */
export const menuOverlayCohesionTone = css`
  :host([tone="subtle"]) {
    --menu-overlay-bg: var(--vu-color-surface-secondary);
    --menu-overlay-fg: var(--vu-color-surface-secondary-foreground);
    --menu-overlay-hover: color-mix(
      in oklab,
      var(--vu-color-surface-secondary) 92%,
      var(--vu-color-surface-secondary-foreground) 8%
    );
  }

  :host([tone="strong"]) {
    --menu-overlay-bg: var(--vu-color-surface-tertiary);
    --menu-overlay-fg: var(--vu-color-surface-tertiary-foreground);
    --menu-overlay-hover: color-mix(
      in oklab,
      var(--vu-color-surface-tertiary) 92%,
      var(--vu-color-surface-tertiary-foreground) 8%
    );
  }
`;

/** Host `size` scales overlay pad, radius, and row typography — not chrome-only props. */
export const menuOverlayCohesionSize = css`
  :host([size="sm"]) {
    --menu-overlay-pad: var(--vu-space-1);
    --menu-overlay-row-pad-block: var(--vu-space-1);
    --menu-overlay-row-pad-inline: var(--vu-space-2);
    --menu-overlay-row-font-size: var(--vu-font-size-xs);
    --menu-overlay-row-min-block-size: var(--vu-space-7);
  }

  :host([size="lg"]) {
    --menu-overlay-pad: var(--vu-space-2);
    --menu-overlay-row-pad-block: var(--vu-space-2);
    --menu-overlay-row-pad-inline: var(--vu-space-3);
    --menu-overlay-row-font-size: var(--vu-font-size-md);
    --menu-overlay-row-min-block-size: var(--vu-space-9);
  }
`;
