import { css } from "lit";
import { overlaySurfaceGuard } from "../internals/styles/overlay-surface-guard.css.js";
import {
  glassOverlayHost,
  glassReducedTransparency,
} from "../internals/styles/glass-surface.css.js";

export const popoverStyles = css`
  ${overlaySurfaceGuard}
  ${glassOverlayHost}
  ${glassReducedTransparency}

  :host {
    position: fixed;
    left: var(--popover-left, 0);
    top: var(--popover-top, 0);
    inline-size: var(--popover-width, max-content);
    margin: 0;
    z-index: var(--vu-z-popover, 1000);
    border: none;
    background: transparent;
    box-sizing: border-box;
    padding: 0;
    overflow: visible;
    text-align: start;
    /* Blur must live on the top-layer host — nested backdrop-filter cannot sample the page behind. */
    backdrop-filter: var(--vu-overlay-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-overlay-backdrop-filter);
  }

  @media (prefers-reduced-transparency: reduce) {
    :host {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
  }
`;
