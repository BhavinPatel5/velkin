import { css } from "lit";
import {
  menuOverlayCohesionHost,
  menuOverlayCohesionSize,
  menuOverlayCohesionTone,
} from "../internals/styles/menu-overlay-cohesion.css.js";
import { fieldToneSoftHost } from "../internals/styles/field-tone-soft.css.js";
import { overlaySurfaceGuard } from "../internals/styles/overlay-surface-guard.css.js";
import {
  menuPanelInnerClip,
  menuPanelRadiusTokens,
} from "../internals/styles/menu-panel-radius.css.js";
import {
  glassSurfaceHost,
  glassReducedTransparency,
} from "../internals/styles/glass-surface.css.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const adaptiveBarStyles = css`
  ${overlaySurfaceGuard}
  ${fieldToneSoftHost}
  ${glassSurfaceHost}
  ${glassReducedTransparency}
  ${controlSizeMetricsTokens}

  :host {
    display: block;
    width: 100%;
    min-height: 0;
    font-family: var(--vu-font-sans);
    box-sizing: border-box;

    --adaptive-bar-bg: var(--vu-color-surface);
    --adaptive-bar-fg: var(--vu-color-surface-foreground);
    --host-surface-bg: var(--adaptive-bar-bg);
    /* Same width as outline so elevated/default don't jump when toggling. */
    --adaptive-bar-border: var(--vu-border-width) solid transparent;
    --adaptive-bar-shadow: none;
    --adaptive-bar-py: var(--vu-space-2);
    --adaptive-bar-px: var(--vu-space-3);
    --adaptive-bar-gap: var(--vu-space-2);
    --adaptive-bar-min-block-size: var(--vu-csm-chrome-min-block-size);

    ${menuOverlayCohesionHost}
    --adaptive-menu-bg: var(--menu-overlay-bg);
    --adaptive-menu-fg: var(--menu-overlay-fg);
    --adaptive-menu-shadow: var(--menu-overlay-shadow);
    --adaptive-menu-radius: var(--menu-overlay-radius);
    --adaptive-menu-pad: var(--menu-overlay-pad);
    --menu-panel-radius: var(--adaptive-menu-radius);
    --menu-panel-pad: var(--adaptive-menu-pad);
    ${menuPanelRadiusTokens}
    /* Match dropdown / navbar menu stack — tight rows so hover reads clearly. */
    --adaptive-menu-gap: var(--vu-space-half);

    --overflow-trigger-bg: var(--fc-soft);
    --overflow-trigger-fg: var(--fc-soft-fg);
    --overflow-trigger-bg-hover: var(--fc-soft-hover);
    --overflow-trigger-fg-hover: var(--fc-soft-fg);
    --overflow-trigger-size: var(--vu-csm-action-min-block-size);
    --overflow-trigger-radius: var(--vu-control-radius-md);
    --overflow-trigger-icon-size: var(--vu-csm-action-icon-size);

    color: var(--adaptive-bar-fg);
  }

  ${menuOverlayCohesionTone}
  ${menuOverlayCohesionSize}

  :host([tone="subtle"]) {
    --adaptive-bar-bg: var(--vu-color-surface-secondary);
    --adaptive-bar-fg: var(--vu-color-surface-secondary-foreground);
    --host-surface-bg: var(--adaptive-bar-bg);
  }

  :host([tone="strong"]) {
    --adaptive-bar-bg: var(--vu-color-surface-tertiary);
    --adaptive-bar-fg: var(--vu-color-surface-tertiary-foreground);
    --host-surface-bg: var(--adaptive-bar-bg);
  }

  :host([variant="outline"]) {
    --adaptive-bar-border: var(--vu-border-width) solid var(--vu-color-border);
  }

  :host([variant="elevated"]) {
    --adaptive-bar-shadow: var(--vu-shadow-surface);
  }

  :host([size="sm"]) {
    --adaptive-bar-py: var(--vu-space-1);
    --adaptive-bar-px: var(--vu-space-2);
    --adaptive-bar-gap: var(--vu-space-1-5);
  }

  :host([size="lg"]) {
    --adaptive-bar-py: var(--vu-space-3);
    --adaptive-bar-px: var(--vu-space-4);
    --adaptive-bar-gap: var(--vu-space-3);
  }

  [part="bar"] {
    box-sizing: border-box;
    inline-size: 100%;
    background: color-mix(
      in oklab,
      var(--adaptive-bar-bg) var(--vu-surface-fill, 100%),
      transparent
    );
    color: inherit;
    border-block-end: var(--adaptive-bar-border);
    box-shadow: var(--adaptive-bar-shadow);
    backdrop-filter: var(--vu-surface-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-surface-backdrop-filter);
    min-block-size: var(--adaptive-bar-min-block-size);
  }

  .main-container {
    display: flex;
    align-items: center;
    gap: var(--adaptive-bar-gap);
    flex: 1;
    min-width: 0;
    padding-block: var(--adaptive-bar-py);
    padding-inline: var(--adaptive-bar-px);
    box-sizing: border-box;
  }

  .main-items {
    display: flex;
    align-items: center;
    gap: var(--adaptive-bar-gap);
    flex: 1;
    min-width: 0;
  }

  :host([justify="center"]) .main-items {
    justify-content: center;
  }

  :host([justify="end"]) .main-items {
    justify-content: flex-end;
  }

  .spacer {
    flex: 1 1 auto;
  }

  :host([justify="center"]) .spacer,
  :host([justify="end"]) .spacer {
    display: none;
  }

  .overflow-btn {
    display: none;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    margin-inline-start: auto;
    box-sizing: border-box;
    min-inline-size: var(--overflow-trigger-size);
    min-block-size: var(--overflow-trigger-size);
    /* Hit target from min-size; zero pad so the icon flex-centers in the square. */
    padding: 0;
    border: 0 solid transparent;
    border-radius: var(--overflow-trigger-radius);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--overflow-trigger-bg);
    color: var(--overflow-trigger-fg);
    font: inherit;
    line-height: 0;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  .overflow-btn:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  @media (hover: hover) {
    .overflow-btn:hover {
      background: var(--overflow-trigger-bg-hover);
      color: var(--overflow-trigger-fg-hover);
    }
  }

  .overflow-btn:active {
    transform: translateY(1px);
  }

  .overflow-btn vu-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    inline-size: var(--overflow-trigger-icon-size);
    block-size: var(--overflow-trigger-icon-size);
    font-size: var(--overflow-trigger-icon-size);
    line-height: 0;
  }

  .overflow-menu {
    position: fixed;
    top: var(--vu-dd-top);
    left: var(--vu-dd-left);
    width: var(--vu-dd-width);
    margin: 0;
    box-shadow: var(--adaptive-menu-shadow);
    border-radius: var(--adaptive-menu-radius);
    corner-shape: var(--vu-corner-shape, round);
    background-color: var(--adaptive-menu-bg);
    color: var(--adaptive-menu-fg);
    border: var(--vu-border-width) solid transparent;
    box-sizing: border-box;
    overflow: hidden;
    backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
    -webkit-backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
  }

  .overflow-inner {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    gap: var(--adaptive-menu-gap);
    padding: var(--adaptive-menu-pad);
    box-sizing: border-box;
    ${menuPanelInnerClip}
  }

  @media (prefers-reduced-motion: reduce) {
    .overflow-btn {
      transition-duration: var(--vu-duration-instant);
    }
    .overflow-btn:active {
      transform: none;
    }
  }

  @media (prefers-contrast: more) {
    :host([variant="outline"]) [part="bar"] {
      border-block-end-width: var(--vu-border-width-emphasis);
    }
    .overflow-menu {
      border-color: var(--vu-color-border);
      border-width: var(--vu-border-width-emphasis);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    [part="bar"] {
      background: var(--adaptive-bar-bg);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    .overflow-menu {
      background: var(--vu-color-overlay);
      color: var(--vu-color-overlay-foreground);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
  }

  @media (forced-colors: active) {
    .overflow-btn:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }
    .overflow-menu {
      border: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }
    :host([variant="elevated"]) [part="bar"] {
      box-shadow: none;
      border-block-end: var(--vu-border-width-emphasis) solid CanvasText;
    }
  }
`;
