import { css } from "lit";
import { overlaySurfaceGuard } from "../internals/styles/overlay-surface-guard.css.js";
import {
  menuOverlayCohesionHost,
  menuOverlayCohesionSize,
  menuOverlayCohesionTone,
} from "../internals/styles/menu-overlay-cohesion.css.js";
import {
  menuPanelInnerClip,
  menuPanelRadiusTokens,
} from "../internals/styles/menu-panel-radius.css.js";
import { menuStackDividerHost } from "../internals/styles/menu-stack-dividers.css.js";

export const dropdownStyles = css`
  ${overlaySurfaceGuard}

  :host {
    display: inline-block;
    position: relative;
    font-family: var(--vu-font-sans);

    ${menuOverlayCohesionHost}
    --dropdown-panel-bg: var(--menu-overlay-bg);
    --dropdown-panel-fg: var(--menu-overlay-fg);
    --dropdown-shadow: var(--menu-overlay-shadow);
    --dropdown-radius: var(--menu-overlay-radius);
    --dropdown-pad: var(--menu-overlay-pad);
    --menu-panel-radius: var(--dropdown-radius);
    --menu-panel-pad: var(--dropdown-pad);
    ${menuPanelRadiusTokens}
    --dropdown-max-height: 320px;
    --dropdown-left: 0px;
    --dropdown-top: 0px;
    --dropdown-viewport-max: calc(100vw - 16px);
  }

  ${menuOverlayCohesionTone}
  ${menuOverlayCohesionSize}

  :host([radius="sm"]) {
    --dropdown-radius: var(--vu-radius-lg);
  }

  :host([radius="md"]) {
    --dropdown-radius: var(--vu-radius-overlay);
  }

  :host([radius="lg"]) {
    --dropdown-radius: min(32px, var(--vu-radius-3xl));
  }

  :host([variant="elevated"]) {
    --dropdown-shadow: var(--vu-shadow-overlay);
  }

  :host([variant="soft"]) {
    --dropdown-shadow: none;
    --dropdown-panel-bg: color-mix(
      in oklab,
      var(--vu-color-surface-secondary) var(--vu-overlay-fill, 100%),
      transparent
    );
    --dropdown-panel-fg: var(--vu-color-surface-secondary-foreground);
  }

  :host([trigger="submenu"]) {
    position: absolute;
    inline-size: 0;
    block-size: 0;
    overflow: visible;
    border: 0;
    padding: 0;
    margin: 0;
  }

  :host([trigger="submenu"]) [part="body"] {
    opacity: 1;
    pointer-events: auto;
  }

  [part="trigger"] {
    cursor: pointer;
    outline: none;
  }

  :host([disabled]) [part="trigger"] {
    cursor: not-allowed;
    opacity: var(--vu-opacity-disabled-control);
    pointer-events: none;
  }

  [part="body"] {
    position: fixed;
    left: var(--dropdown-left, 0px);
    top: var(--dropdown-top, 0px);
    inline-size: var(--dropdown-width, max-content);
    max-inline-size: var(--dropdown-viewport-max);
    box-sizing: border-box;
    margin: 0;
    padding: var(--dropdown-pad);

    border: var(--vu-border-width) solid transparent;
    border-radius: var(--dropdown-radius);
    corner-shape: var(--menu-overlay-corner-shape, var(--vu-corner-shape, round));
    background: var(--dropdown-panel-bg);
    color: var(--dropdown-panel-fg);
    box-shadow: var(--dropdown-shadow);
    backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
    -webkit-backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
    outline: none;
    overflow: hidden;
    text-align: start;
  }

  :host([variant="outline"]) [part="body"] {

    border-color: var(--vu-color-border);
    box-shadow: none;
  }

  [part="body-scroll"] {
    display: flex;
    flex-direction: column;
    --menu-stack-gap: var(--vu-space-half);
    gap: var(--menu-stack-gap);
    overflow-y: auto;
    max-block-size: var(--dropdown-max-height);
    ${menuPanelInnerClip}
  }

  [part="body-scroll"] ::slotted(vu-divider) {
    ${menuStackDividerHost}
  }

  [part="body-scroll"] ::slotted(vu-dropdown-item) {
    --di-radius: var(--menu-item-radius);
  }

  @media (prefers-reduced-motion: reduce) {
    [part="trigger"],
    [part="body"] {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    :host([variant="outline"]) [part="body"] {
      border-width: var(--vu-border-width-emphasis);
    }

    [part="body"]:focus-visible {
      outline: none;
      box-shadow: var(--vu-focus-ring);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) [part="trigger"] {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  @media (forced-colors: active) {
    [part="body"] {
      border: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }

    :host([disabled]) [part="trigger"] {
      opacity: 1;
      forced-color-adjust: none;
    }
  }
`;
