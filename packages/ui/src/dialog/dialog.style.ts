import { css } from "lit";
import { overlaySurfaceGuard } from "../internals/styles/overlay-surface-guard.css.js";
import {
  glassOverlayHost,
  glassReducedTransparency,
} from "../internals/styles/glass-surface.css.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const dialogStyles = css`
  ${overlaySurfaceGuard}
  ${glassOverlayHost}
  ${glassReducedTransparency}
  ${controlSizeMetricsTokens}

  :host {
    display: contents;
    font-family: var(--vu-font-sans);

    --dialog-panel-bg: var(--vu-color-overlay);
    --dialog-panel-fg: var(--vu-color-overlay-foreground);
    --dialog-panel-hover: var(--vu-color-overlay-hover);
    --dialog-soft-bg: var(--vu-color-surface-secondary);
    --dialog-soft-fg: var(--vu-color-surface-secondary-foreground);
    --dialog-strong-bg: var(--vu-color-surface-tertiary);
    --dialog-strong-fg: var(--vu-color-surface-tertiary-foreground);

    --dialog-edge: var(--vu-color-border);
    --dialog-shadow: var(--vu-shadow-overlay);

    --dialog-pad-sm: var(--vu-space-2);
    --dialog-pad-md: var(--vu-space-3-5);
    --dialog-pad-lg: var(--vu-space-5);

    --dialog-header-pad: var(--dialog-pad-md);
    --dialog-body-pad: var(--dialog-pad-md);
    --dialog-footer-pad: var(--dialog-pad-md);
    --dialog-radius: var(--vu-radius-overlay);
    --dialog-max-width: auto;
    --dialog-max-height: auto;
    --dialog-backdrop-color: var(--vu-color-backdrop);
    --dialog-close-size: var(--vu-csm-dismiss-size);
    --dialog-close-icon-size: var(--vu-csm-dismiss-icon-size);
  }

  :host([tone="subtle"]) {
    --dialog-panel-bg: var(--vu-color-surface-secondary);
    --dialog-panel-fg: var(--vu-color-surface-secondary-foreground);
    --dialog-panel-hover: var(--vu-color-overlay-hover);
    --dialog-soft-bg: var(--vu-color-surface-secondary);
    --dialog-soft-fg: var(--vu-color-surface-secondary-foreground);
    --dialog-strong-bg: var(--vu-color-surface-secondary);
    --dialog-strong-fg: var(--vu-color-surface-secondary-foreground);
  }

  :host([tone="strong"]) {
    --dialog-panel-bg: var(--vu-color-surface-tertiary);
    --dialog-panel-fg: var(--vu-color-surface-tertiary-foreground);
    --dialog-panel-hover: color-mix(
      in oklab,
      var(--dialog-panel-bg) 92%,
      var(--dialog-panel-fg) 8%
    );
    --dialog-soft-bg: var(--vu-color-surface-tertiary);
    --dialog-soft-fg: var(--vu-color-surface-tertiary-foreground);
    --dialog-strong-bg: var(--vu-color-foreground);
    --dialog-strong-fg: var(--vu-color-background);
  }

  :host([size="sm"]) {
    --dialog-header-pad: var(--dialog-pad-sm);
    --dialog-body-pad: var(--dialog-pad-sm);
    --dialog-footer-pad: var(--dialog-pad-sm);
  }

  :host([size="md"]) {
    --dialog-header-pad: var(--dialog-pad-md);
    --dialog-body-pad: var(--dialog-pad-md);
    --dialog-footer-pad: var(--dialog-pad-md);
  }

  :host([size="lg"]) {
    --dialog-header-pad: var(--dialog-pad-lg);
    --dialog-body-pad: var(--dialog-pad-lg);
    --dialog-footer-pad: var(--dialog-pad-lg);
  }

  :host([radius="sm"]) {
    --dialog-radius: var(--vu-radius-lg);
  }

  :host([radius="md"]) {
    --dialog-radius: var(--vu-radius-overlay);
  }

  :host([radius="lg"]) {
    --dialog-radius: min(32px, var(--vu-radius-3xl));
  }

  dialog[open] {
    display: flex;
    flex-direction: column;
    position: fixed;
    margin: auto;
    padding: 0;

    border: var(--vu-border-width) solid transparent;
    border-radius: var(--dialog-radius);
    corner-shape: var(--vu-corner-shape, round);
    box-sizing: border-box;
    width: 100%;
    max-inline-size: var(--dialog-max-width);
    /* max-content so body-only dialogs keep intrinsic height; max-height still caps. */
    height: max-content;
    max-height: var(--dialog-max-height);
    overflow: hidden;
    color: var(--dialog-panel-fg);
    background: color-mix(
      in oklab,
      var(--dialog-panel-bg) var(--vu-overlay-fill, 100%),
      transparent
    );

    box-shadow: none;
    backdrop-filter: var(--vu-overlay-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-overlay-backdrop-filter);
    text-align: start;
    z-index: 1000;

    opacity: 1;
    transform: none;
    transform-origin: center center;
    transition: none;
  }

  dialog::backdrop {
    background-color: var(--dialog-backdrop-color);
    transition: background-color var(--vu-duration-slow) var(--vu-ease-out-cubic);
  }

  :host([variant="elevated"]) dialog {
    box-shadow: var(--dialog-shadow);
  }

  :host([variant="outline"]) dialog {
    border-color: var(--dialog-edge);
  }

  :host([variant="soft"]) dialog {
    background: color-mix(
      in oklab,
      var(--dialog-soft-bg) var(--vu-overlay-fill, 100%),
      transparent
    );
    color: var(--dialog-soft-fg);
  }

  :host([variant="filled"]) dialog {
    background: color-mix(
      in oklab,
      var(--dialog-strong-bg) var(--vu-overlay-fill, 100%),
      transparent
    );
    color: var(--dialog-strong-fg);
    box-shadow: var(--dialog-shadow);
  }

  :host([variant="ghost"]) dialog {
    background: transparent;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  dialog:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  .header,
  .footer {
    flex-shrink: 0;
  }

  .header {
    display: block;
    padding: var(--dialog-header-pad);
  }

  .header[hidden] {
    display: none;
  }

  :host:not(:has([slot="header"])) .header {
    display: none;
  }

  .body {
    display: block;
    flex: 1 1 auto;
    min-block-size: 0;
    padding: var(--dialog-body-pad);
    font-size: var(--vu-font-size-sm);
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
    padding: var(--dialog-footer-pad);
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
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--dialog-close-size);
    block-size: var(--dialog-close-size);
    padding: 0;
    box-sizing: border-box;
    border: 0;
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    background: transparent;
    color: var(--vu-color-foreground);
    font-size: var(--dialog-close-icon-size);
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
      background: var(--dialog-panel-hover);
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
    dialog {
      transition: none;
    }

    dialog::backdrop {
      transition: none;
    }
    .close-button:active {
      transform: none;
    }
  }

  @media (prefers-contrast: more) {
    :host([variant="outline"]) dialog {
      border-color: var(--dialog-edge);
    }

    dialog:focus-visible,
    .close-button:focus-visible {
      box-shadow: none;
      outline: calc(var(--vu-border-width-emphasis) * 2) solid currentColor;
      outline-offset: var(--vu-space-half);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    dialog::backdrop {
      background-color: color-mix(
        in oklab,
        var(--dialog-backdrop-color) 95%,
        CanvasText 5%
      );
    }
  }

  @media (forced-colors: active) {
    dialog[open] {
      border: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }

    dialog::backdrop {
      forced-color-adjust: none;
      background: Canvas;
      opacity: 0.85;
    }

    dialog:focus-visible,
    .close-button:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }
  }
`;
