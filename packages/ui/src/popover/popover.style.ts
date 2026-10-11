import { css } from "lit";
import { overlaySurfaceGuard } from "../internals/styles/overlay-surface-guard.css.js";
import {
  glassOverlayHost,
  glassReducedTransparency,
} from "../internals/styles/glass-surface.css.js";
import { menuOverlayCohesionHost } from "../internals/styles/menu-overlay-cohesion.css.js";

export const popoverStyles = css`
  ${overlaySurfaceGuard}
  ${glassOverlayHost}
  ${glassReducedTransparency}

  :host {
    ${menuOverlayCohesionHost}
    position: fixed;
    left: var(--popover-left, 0);
    top: var(--popover-top, 0);
    inline-size: var(--popover-width, max-content);
    margin: 0;
    z-index: var(--vu-z-popover, 1000);
    box-sizing: border-box;
    padding: 0;
    overflow: visible;
    text-align: start;
    /* Visible stroke like Role E fields — white overlay on white page needs an edge. */
    border: var(--menu-overlay-border);
    border-radius: var(--menu-overlay-radius);
    background: var(--menu-overlay-bg);
    color: var(--menu-overlay-fg);
    box-shadow: var(--menu-overlay-shadow);
    /* Blur must live on the top-layer host — nested backdrop-filter cannot sample the page behind. */
    backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
    -webkit-backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
    /* Host may be the focus fallback — keep rings on slotted controls, not the sheet. */
    outline: none;
  }

  @media (prefers-reduced-transparency: reduce) {
    :host {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
  }

  @media (forced-colors: active) {
    :host {
      border: var(--vu-border-width-emphasis) solid CanvasText;
      background: Canvas;
      color: CanvasText;
      box-shadow: none;
    }
  }
`;
