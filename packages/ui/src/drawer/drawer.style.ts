import { css } from "lit";
import { overlaySurfaceGuard } from "../internals/styles/overlay-surface-guard.css.js";
import {
  glassOverlayHost,
  glassReducedTransparency,
} from "../internals/styles/glass-surface.css.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const drawerStyles = css`
  ${overlaySurfaceGuard}
  ${glassOverlayHost}
  ${glassReducedTransparency}
  ${controlSizeMetricsTokens}

  :host {
    display: block;
    pointer-events: none;
    font-family: var(--vu-font-sans);
    position: fixed;
    inset: 0;
    z-index: 1000;

    --drawer-panel-bg: var(--vu-color-overlay);
    --drawer-panel-fg: var(--vu-color-overlay-foreground);
    --drawer-panel-hover: var(--vu-color-overlay-hover);
    --drawer-soft-bg: var(--vu-color-surface-secondary);
    --drawer-soft-fg: var(--vu-color-surface-secondary-foreground);
    --drawer-strong-bg: var(--vu-color-surface-tertiary);
    --drawer-strong-fg: var(--vu-color-surface-tertiary-foreground);

    --drawer-edge: var(--vu-color-border);
    --drawer-shadow: var(--vu-shadow-overlay);

    --drawer-pad-sm: var(--vu-space-2);
    --drawer-pad-md: var(--vu-space-3-5);
    --drawer-pad-lg: var(--vu-space-5);

    --drawer-header-pad: var(--drawer-pad-md);
    --drawer-body-pad: var(--drawer-pad-md);
    --drawer-footer-pad: var(--drawer-pad-md);
    --drawer-radius: var(--vu-radius-md);
    --drawer-width: 20rem;
    --drawer-height: 100%;
    --drawer-backdrop-color: var(--vu-color-backdrop);
    --drawer-close-size: var(--vu-csm-dismiss-size);
    --drawer-close-icon-size: var(--vu-csm-dismiss-icon-size);
    --drawer-panel-left: 0px;
    --drawer-panel-top: 0px;
  }

  .edge-anchor {
    position: fixed;
    top: 0;
    block-size: 100vh;
    inline-size: 0;
    pointer-events: none;
    visibility: hidden;
  }

  :host([side="left"]) .edge-anchor {
    inset-inline-start: 0;
  }

  :host([side="right"]) .edge-anchor {
    inset-inline-end: 0;
  }

  :host([tone="subtle"]) {
    --drawer-panel-bg: var(--vu-color-surface-secondary);
    --drawer-panel-fg: var(--vu-color-surface-secondary-foreground);
    --drawer-soft-bg: var(--vu-color-surface-secondary);
    --drawer-soft-fg: var(--vu-color-surface-secondary-foreground);
    --drawer-strong-bg: var(--vu-color-surface-secondary);
    --drawer-strong-fg: var(--vu-color-surface-secondary-foreground);
  }

  :host([tone="strong"]) {
    --drawer-panel-bg: var(--vu-color-surface-tertiary);
    --drawer-panel-fg: var(--vu-color-surface-tertiary-foreground);
    --drawer-panel-hover: color-mix(
      in oklab,
      var(--drawer-panel-bg) 92%,
      var(--drawer-panel-fg) 8%
    );
    --drawer-soft-bg: var(--vu-color-surface-tertiary);
    --drawer-soft-fg: var(--vu-color-surface-tertiary-foreground);
    --drawer-strong-bg: var(--vu-color-foreground);
    --drawer-strong-fg: var(--vu-color-background);
  }

  :host([size="sm"]) {
    --drawer-header-pad: var(--drawer-pad-sm);
    --drawer-body-pad: var(--drawer-pad-sm);
    --drawer-footer-pad: var(--drawer-pad-sm);
  }

  :host([size="md"]) {
    --drawer-header-pad: var(--drawer-pad-md);
    --drawer-body-pad: var(--drawer-pad-md);
    --drawer-footer-pad: var(--drawer-pad-md);
  }

  :host([size="lg"]) {
    --drawer-header-pad: var(--drawer-pad-lg);
    --drawer-body-pad: var(--drawer-pad-lg);
    --drawer-footer-pad: var(--drawer-pad-lg);
  }

  :host([radius="sm"]) {
    --drawer-radius: var(--vu-radius-sm);
  }

  :host([radius="md"]) {
    --drawer-radius: var(--vu-radius-md);
  }

  :host([radius="lg"]) {
    --drawer-radius: var(--vu-radius-lg);
  }

  .overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: var(--drawer-backdrop-color);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host([open]) .overlay {
    opacity: 1;
    pointer-events: auto;
  }

  .panel {
    position: fixed;
    inset-block-start: var(--drawer-panel-top, 0);
    inset-inline-start: var(--drawer-panel-left, 0);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    inline-size: var(--drawer-width);
    block-size: 100vh;
    max-block-size: 100vh;
    margin: 0;
    border-radius: var(--drawer-radius);
    corner-shape: var(--vu-corner-shape, round);
    color: var(--drawer-panel-fg);
    background: color-mix(
      in oklab,
      var(--drawer-panel-bg) var(--vu-overlay-fill, 100%),
      transparent
    );

    box-shadow: none;
    backdrop-filter: var(--vu-overlay-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-overlay-backdrop-filter);

    border: var(--vu-border-width) solid transparent;
    z-index: 2;
    overflow: hidden;
    pointer-events: none;
  }

  :host([open]) .panel {
    pointer-events: auto;
  }

  ::slotted(*) {
    pointer-events: auto;
  }

  .panel vu-icon {
    pointer-events: none;
  }

  :host([side="left"]) .panel {
    inset-block-start: 0;
    inset-inline-start: 0;
  }

  :host([side="right"]) .panel {
    inset-block-start: 0;
    inset-inline-end: 0;
    inset-inline-start: auto;
  }

  :host([variant="elevated"]) .panel {
    box-shadow: var(--drawer-shadow);
  }

  :host([variant="outline"]) .panel {
    border-color: var(--drawer-edge);
  }

  :host([variant="soft"]) .panel {
    background: color-mix(
      in oklab,
      var(--drawer-soft-bg) var(--vu-overlay-fill, 100%),
      transparent
    );
    color: var(--drawer-soft-fg);
  }

  :host([variant="filled"]) .panel {
    background: color-mix(
      in oklab,
      var(--drawer-strong-bg) var(--vu-overlay-fill, 100%),
      transparent
    );
    color: var(--drawer-strong-fg);
    box-shadow: var(--drawer-shadow);
  }

  :host([variant="ghost"]) .panel {
    background: transparent;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .header,
  .footer {
    flex-shrink: 0;
  }

  .header {
    display: block;
    padding: var(--drawer-header-pad);
    position: relative;
    z-index: 0;
    pointer-events: none;
  }

  .header[hidden] {
    display: none;
  }

  :host([closable]) .header {
    padding-inline-end: calc(var(--drawer-close-size) + var(--vu-space-4));
  }

  :host:not(:has([slot="header"])) .header {
    display: none;
  }

  .body {
    display: block;
    flex: 1 1 auto;
    min-block-size: 0;
    padding: var(--drawer-body-pad);
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  .body[hidden] {
    display: none;
  }

  :host:not(:has([slot="body"])) .body {
    display: none;
  }

  .footer {
    display: block;
    padding: var(--drawer-footer-pad);
  }

  .footer[hidden] {
    display: none;
  }

  :host:not(:has([slot="footer"])) .footer {
    display: none;
  }

  [part="header-divider"][hidden],
  [part="footer-divider"][hidden] {
    display: none !important;
  }

  .close-button {
    position: absolute;
    top: var(--vu-space-2);
    inset-inline-end: var(--vu-space-2);
    z-index: 10;
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--drawer-close-size);
    block-size: var(--drawer-close-size);
    padding: 0;
    border: 0;
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    background: transparent;
    color: var(--vu-color-foreground);
    font-size: var(--drawer-close-icon-size);
    cursor: var(--vu-cursor-interactive);
    -webkit-tap-highlight-color: transparent;
    transition:
      color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      transform var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  .close-button:active {
    transform: scale(0.92);
  }

  @media (hover: hover) {
    .close-button:hover {
      color: var(--vu-color-danger);
      background: var(--drawer-panel-hover);
    }
  }

  .close-button:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  ::slotted([slot="header"]) {
    font-size: var(--vu-font-size-md);
    font-weight: var(--vu-font-weight-semibold);
    color: inherit;
    box-sizing: border-box;
  }

  vu-icon {
    display: inline-block;
    width: 1em;
    height: 1em;
  }

  @media (prefers-reduced-motion: reduce) {
    .overlay,
    .close-button {
      transition-duration: var(--vu-duration-instant);
    }
    .close-button:active {
      transform: none;
    }
  }

  @media (prefers-contrast: more) {
    :host([variant="outline"]) .panel {
      border-color: var(--drawer-edge);
    }

    .panel:focus-visible,
    .close-button:focus-visible {
      box-shadow: none;
      outline: calc(var(--vu-border-width-emphasis) * 2) solid currentColor;
      outline-offset: var(--vu-space-half);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    .overlay {
      background-color: color-mix(
        in oklab,
        var(--drawer-backdrop-color) 95%,
        CanvasText 5%
      );
    }
  }

  @media (forced-colors: active) {
    .panel {
      border: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }

    .overlay {
      forced-color-adjust: none;
      background: Canvas;
      opacity: 0.85;
    }

    .panel:focus-visible,
    .close-button:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }
  }
`;
