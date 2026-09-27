import { css } from "lit";

/** Panel hosts set `--menu-panel-radius` and `--menu-panel-pad` before importing these blocks. */
export const menuPanelRadiusTokens = css`
  /* Inner curve of a padded panel — items follow this so corners match the dropdown. */
  --menu-item-edge-radius: max(
    0px,
    calc(var(--menu-panel-radius, var(--vu-radius-md)) - var(--menu-panel-pad, 0px))
  );
  /* Uniform row radius — same on every item; pad + inner clip blends the list. */
  --menu-item-radius: var(--menu-item-edge-radius);
`;

/** Clips padded inset lists so row hovers follow the panel inner curve. */
export const menuPanelInnerClip = css`
  border-radius: var(--menu-item-edge-radius);
  corner-shape: var(--vu-corner-shape, round);
  overflow-x: hidden;
`;

/** Uniform corners for interactive menu rows (no first/last edge special-casing). */
export const menuPanelItemCorners = css`
  border-radius: var(--menu-item-radius);
  corner-shape: var(--vu-corner-shape, round);
`;
