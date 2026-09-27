import { css } from "lit";
import { overlaySurfaceGuard } from "../internals/styles/overlay-surface-guard.css.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const speeddialStyles = css`
  ${overlaySurfaceGuard}
  ${controlSizeMetricsTokens}

  :host {
    position: relative;
    display: inline-block;
    font-family: var(--vu-font-sans);
    -webkit-tap-highlight-color: transparent;

    --speeddial-fab-size: var(--vu-csm-action-min-block-size);
    --speeddial-action-size: var(--vu-csm-action-min-block-size);
    --speeddial-icon-size: var(--vu-csm-action-icon-size);
    --speeddial-gap: var(--vu-space-2-5);
    --speeddial-offset: var(--vu-space-2-5);
    --speeddial-fab-bg: var(--vu-color-accent);
    --speeddial-fab-fg: var(--vu-color-accent-foreground);
    --speeddial-fab-hover: color-mix(
      in oklab,
      var(--vu-color-accent) 92%,
      var(--vu-color-foreground) 8%
    );
    --speeddial-action-bg: var(--vu-color-surface);
    --speeddial-action-fg: var(--vu-color-foreground);
    --speeddial-action-hover-fg: var(--vu-color-accent);
  }

  :host([size="sm"]) {
    --speeddial-gap: var(--vu-space-2);
    --speeddial-offset: var(--vu-space-2);
  }

  :host([size="lg"]) {
    --speeddial-gap: var(--vu-space-3);
    --speeddial-offset: var(--vu-space-3);
  }

  :host([color="default"]) {
    --speeddial-fab-bg: var(--vu-color-default);
    --speeddial-fab-fg: var(--vu-color-default-foreground);
    --speeddial-fab-hover: var(--vu-color-default-hover);
  }

  :host([color="primary"]) {
    --speeddial-fab-bg: var(--vu-color-accent);
    --speeddial-fab-fg: var(--vu-color-accent-foreground);
    --speeddial-fab-hover: color-mix(
      in oklab,
      var(--vu-color-accent) 92%,
      var(--vu-color-foreground) 8%
    );
  }

  :host([color="success"]) {
    --speeddial-fab-bg: var(--vu-color-success);
    --speeddial-fab-fg: var(--vu-color-success-foreground);
    --speeddial-fab-hover: color-mix(
      in oklab,
      var(--vu-color-success) 92%,
      var(--vu-color-foreground) 8%
    );
  }

  :host([color="warning"]) {
    --speeddial-fab-bg: var(--vu-color-warning);
    --speeddial-fab-fg: var(--vu-color-warning-foreground);
    --speeddial-fab-hover: color-mix(
      in oklab,
      var(--vu-color-warning) 92%,
      var(--vu-color-foreground) 8%
    );
  }

  :host([color="danger"]) {
    --speeddial-fab-bg: var(--vu-color-danger);
    --speeddial-fab-fg: var(--vu-color-danger-foreground);
    --speeddial-fab-hover: color-mix(
      in oklab,
      var(--vu-color-danger) 92%,
      var(--vu-color-foreground) 8%
    );
  }

  [part="root"] {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  [part="fab"] {
    box-sizing: border-box;
    inline-size: var(--speeddial-fab-size);
    block-size: var(--speeddial-fab-size);
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background: var(--speeddial-fab-bg);
    color: var(--speeddial-fab-fg);
    border: var(--vu-border-width) solid transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--vu-shadow-surface);
    transition: transform var(--vu-duration-normal) var(--vu-ease-out-cubic);
    font: inherit;
    padding: 0;
  }

  @media (hover: hover) {
    [part="fab"]:hover {
      background: var(--speeddial-fab-hover);
    }
  }

  [part="fab"]:active {
    transform: scale(0.92);
  }

  [part="fab"]:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  vu-icon {
    display: inline-flex;
    font-size: var(--speeddial-icon-size);
    inline-size: 1em;
    block-size: 1em;
  }

  [part="actions"] {
    position: fixed;
    /* Override UA [popover] centering (inset:0 + margin:auto) so left/top stick. */
    inset: auto;
    left: var(--speeddial-menu-left, 0px);
    top: var(--speeddial-menu-top, 0px);
    display: flex;
    gap: var(--speeddial-gap);
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
    outline: none;
    inline-size: max-content;
    block-size: max-content;
    z-index: var(--vu-z-popover, 50);
  }

  :host([data-expand="top"]) [part="actions"] {
    flex-direction: column;
  }

  :host([data-expand="bottom"]) [part="actions"] {
    flex-direction: column;
  }

  :host([data-expand="left"]) [part="actions"],
  :host([data-expand="right"]) [part="actions"] {
    flex-direction: row;
  }

  ::slotted(button) {
    box-sizing: border-box;
    inline-size: var(--speeddial-action-size);
    block-size: var(--speeddial-action-size);
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background: var(--speeddial-action-bg);
    color: var(--speeddial-action-fg);
    font-size: var(--speeddial-icon-size);
    font-weight: var(--vu-font-weight-semibold, 600);
    border: var(--vu-border-width) solid var(--vu-color-border);
    outline: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--vu-shadow-overlay);
    transition:
      transform var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  @media (hover: hover) {
    ::slotted(button:hover) {
      color: var(--speeddial-action-hover-fg);
    }
  }

  ::slotted(button:active) {
    transform: scale(0.92);
  }

  ::slotted(vu-button) {
    display: inline-flex;
    vertical-align: middle;
  }

  ::slotted(button:focus-visible) {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  @media (prefers-reduced-motion: reduce) {
    [part="fab"],
    ::slotted(button) {
      transition-duration: var(--vu-duration-instant);
    }

    [part="fab"]:active,
    ::slotted(button:active) {
      transform: none;
    }
  }

  @media (prefers-contrast: more) {
    [part="fab"],
    ::slotted(button) {
      border-width: var(--vu-border-width-emphasis);
    }
  }

  @media (forced-colors: active) {
    [part="fab"],
    ::slotted(button) {
      forced-color-adjust: none;
      border-color: CanvasText;
      background: ButtonFace;
      color: ButtonText;
      box-shadow: none;
    }
  }
`;
