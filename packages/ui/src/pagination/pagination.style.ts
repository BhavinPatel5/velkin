import { css } from "lit";
import { overlaySurfaceGuard } from "../internals/styles/overlay-surface-guard.css.js";
import {
  menuOverlayCohesionHost,
  menuOverlayCohesionSize,
} from "../internals/styles/menu-overlay-cohesion.css.js";
import {
  menuPanelItemCorners,
  menuPanelRadiusTokens,
} from "../internals/styles/menu-panel-radius.css.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const paginationStyles = css`
  ${overlaySurfaceGuard}
  ${controlSizeMetricsTokens}

  :host {
    display: block;
    max-inline-size: 100%;
    font-family: var(--vu-font-sans);
    --pg-control-size: var(--vu-csm-action-min-block-size);
    --pg-picker-width: var(--vu-csm-chrome-min-block-size);
    --pg-picker-max-height: 15.625rem;
    --pg-radius: var(--vu-control-radius-md);
    ${menuOverlayCohesionHost}
    --pg-menu-pad: var(--menu-overlay-pad);
    --pg-menu-radius: var(--menu-overlay-radius);
    --menu-panel-radius: var(--pg-menu-radius);
    --menu-panel-pad: var(--pg-menu-pad);
    ${menuPanelRadiusTokens}
  }

  ${menuOverlayCohesionSize}

  :host([radius="none"]) {
    --pg-radius: 0;
  }

  :host([radius="sm"]) {
    --pg-radius: var(--vu-control-radius-sm);
  }
  :host([radius="md"]) {
    --pg-radius: var(--vu-control-radius-md);
  }
  :host([radius="lg"]) {
    --pg-radius: var(--vu-control-radius-lg);
  }
  :host([radius="full"]) {
    --pg-radius: var(--vu-radius-full);
  }

  [part="base"] {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--vu-space-2);
  }

  [part="overlay"] {
    display: none;
    position: absolute;
    inset: 0;
    border-radius: var(--vu-radius-md);
    corner-shape: var(--vu-corner-shape, round);
    background: color-mix(in oklab, var(--vu-color-surface) 60%, transparent);
    z-index: 5;
    align-items: center;
    justify-content: center;
  }

  :host([loading]) [part="overlay"] {
    display: flex;
  }

  :host([loading]) [part="block"] {
    pointer-events: none;
    filter: saturate(0.8) opacity(0.8);
  }

  vu-icon {
    display: inline-flex;
    inline-size: 1em;
    block-size: 1em;
    font-size: var(--vu-csm-action-icon-size);
  }

  [part="bar"],
  [part="picker"] {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--vu-space-2);
    inline-size: 100%;
  }

  [part="picker"] {
    position: relative;
    display: inline-flex;
    inline-size: auto;
  }

  [part="pages"] {
    display: flex;
    align-items: center;
    overflow: hidden;
    gap: var(--vu-space-1);
  }

  [part="ellipsis"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--pg-control-size);
    block-size: var(--pg-control-size);
    flex-shrink: 0;
    color: var(--vu-color-muted);
    pointer-events: none;
    user-select: none;
  }

  [part="jump"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--vu-space-1-5);
    flex: 0 0 100%;
    margin-block-start: var(--vu-space-1);
  }

  [part="jump-label"] {
    font-size: var(--vu-csm-action-font-size);
    color: var(--vu-color-muted);
    white-space: nowrap;
  }

  [part="jump-input"] {
    inline-size: calc(var(--pg-control-size) + var(--vu-space-2));
    block-size: var(--pg-control-size);
    border-radius: var(--pg-radius);
    corner-shape: var(--vu-corner-shape, round);
    padding: 0 var(--vu-space-1);
    flex-shrink: 0;
    border: 1px solid var(--vu-color-separator, var(--vu-border-primary));
    background: var(--vu-color-surface);
    color: var(--vu-color-foreground);
    font-size: var(--vu-csm-action-font-size);
    font-family: inherit;
    text-align: center;
    transition:
      border-color var(--vu-duration-fast) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  [part="jump-input"]:focus-visible {
    border-color: var(--vu-color-accent);
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  [part="jump-input"]:disabled {
    opacity: var(--vu-opacity-disabled-control);
    cursor: not-allowed;
  }

  [part="jump-input"]::-webkit-outer-spin-button,
  [part="jump-input"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  [part="jump-go"] {
    block-size: var(--pg-control-size);
    padding-inline: var(--vu-space-2);
    border-radius: var(--pg-radius);
    corner-shape: var(--vu-corner-shape, round);
    border: 1px solid var(--vu-color-separator, var(--vu-border-primary));
    background: var(--vu-color-surface);
    color: var(--vu-color-foreground);
    font-size: var(--vu-csm-action-font-size);
    font-family: inherit;
    cursor: pointer;
    user-select: none;
    transition: background-color var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  @media (hover: hover) {
    [part="jump-go"]:hover:not(:disabled) {
      background: var(--surface-tone-hover, var(--vu-color-surface-hover));
    }
  }

  [part="jump-go"]:active:not(:disabled) {
    transform: translateY(1px);
  }

  [part="jump-go"]:disabled {
    opacity: var(--vu-opacity-disabled-control);
    cursor: not-allowed;
  }

  [part="page"],
  [part="prev"],
  [part="next"] {
    inline-size: var(--pg-control-size);
    block-size: var(--pg-control-size);
    flex-shrink: 0;
    background-color: transparent;
    border-radius: var(--pg-radius);
    corner-shape: var(--vu-corner-shape, round);
    font-size: var(--vu-csm-action-font-size);
    font-family: inherit;
    color: var(--vu-color-foreground);
    cursor: pointer;
    user-select: none;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-fast) var(--vu-ease-out-cubic);
    display: flex;
    border: none;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  :dir(rtl) [part="prev"],
  :dir(rtl) [part="next"] {
    rotate: 180deg;
  }

  @media (hover: hover) {
    [part="page"]:hover:not(:disabled):not([aria-current="page"]),
    [part="prev"]:hover:not(:disabled),
    [part="next"]:hover:not(:disabled) {
      background-color: var(--surface-tone-hover, var(--vu-color-surface-hover));
    }
    [part="page"][aria-current="page"]:hover:not(:disabled) {
      background-color: color-mix(in oklab, var(--vu-color-accent) 88%, black);
      color: var(--vu-color-accent-foreground);
    }
  }

  [part="page"]:active:not(:disabled),
  [part="prev"]:active:not(:disabled),
  [part="next"]:active:not(:disabled) {
    transform: translateY(1px);
  }

  [part="page"]:focus-visible,
  [part="prev"]:focus-visible,
  [part="next"]:focus-visible,
  [part="trigger"]:focus-visible,
  [part="jump-go"]:focus-visible {
    background-color: var(--surface-tone-hover, var(--vu-color-surface-hover));
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  [part="page"][aria-current="page"] {
    background-color: var(--vu-color-accent);
    color: var(--vu-color-accent-foreground);
  }

  [part="page"]:disabled,
  [part="prev"]:disabled,
  [part="next"]:disabled {
    color: var(--vu-color-muted);
    background-color: transparent;
    cursor: not-allowed;
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
  }

  [part="trigger"] {
    border: none;
    color: var(--vu-color-foreground);
    background-color: transparent;
    padding: var(--vu-space-1) var(--vu-space-3);
    border-radius: var(--pg-radius);
    corner-shape: var(--vu-corner-shape, round);
    cursor: pointer;
    user-select: none;
    inline-size: var(--pg-picker-width);
    font-family: inherit;
    font-size: var(--vu-csm-action-font-size);
    transition: background-color var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  @media (hover: hover) {
    [part="trigger"]:hover:not(:disabled) {
      background-color: var(--surface-tone-hover, var(--vu-color-surface-hover));
    }
  }

  [part="trigger"]:active:not(:disabled) {
    transform: translateY(1px);
  }

  [part="menu"] {
    position: fixed;
    inline-size: var(--pg-picker-width, var(--vu-space-12));
    inset-inline-start: var(--pg-picker-left, 0);
    inset-block-start: var(--pg-picker-top, 0);
    margin: 0;
    max-block-size: var(--pg-picker-max-height);
    overflow-x: hidden;
    overflow-y: auto;
    background: var(--menu-overlay-bg);
    color: var(--menu-overlay-fg);
    box-shadow: var(--menu-overlay-shadow, var(--vu-shadow-surface));
    border-radius: var(--pg-menu-radius);
    corner-shape: var(--vu-corner-shape, round);
    border: 0;
    padding: var(--pg-menu-pad);
    backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
    -webkit-backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
    display: flex;
    flex-direction: column;
    gap: var(--vu-space-half);
  }

  [part="menu"] button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid transparent;
    min-block-size: var(--menu-overlay-row-min-block-size);
    padding: var(--menu-overlay-row-pad-block);
    color: var(--menu-overlay-fg);
    cursor: pointer;
    inline-size: 100%;
    text-align: center;
    font-size: var(--menu-overlay-row-font-size);
    font-family: inherit;
    block-size: var(--pg-control-size);
    ${menuPanelItemCorners}
    user-select: none;
    transition: background-color var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  @media (hover: hover) {
    [part="menu"] button:hover:not(:disabled):not([aria-selected="true"]) {
      background: var(--menu-overlay-hover);
    }
    [part="menu"] button[aria-selected="true"]:hover:not(:disabled) {
      background: color-mix(in oklab, var(--vu-color-accent-soft) 82%, var(--vu-color-accent));
      color: var(--vu-color-accent);
    }
  }

  [part="menu"] button[aria-selected="true"] {
    background: var(--vu-color-accent-soft);
    color: var(--vu-color-accent);
  }

  [part="menu"] button:disabled {
    cursor: not-allowed;
    opacity: var(--vu-opacity-disabled-control);
  }

  [part="progress"] {
    inline-size: 100%;
    block-size: var(--vu-space-0-75);
    background-color: var(--surface-tone-hover, var(--vu-color-surface-hover));
    border-radius: var(--vu-radius-sm);
    corner-shape: var(--vu-corner-shape, round);
    overflow: hidden;
    margin-block-start: var(--vu-space-1);
  }

  [part="fill"] {
    block-size: 100%;
    background-color: var(--vu-color-accent);
    transition: inline-size var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  @media (prefers-reduced-motion: reduce) {
    [part="page"],
    [part="prev"],
    [part="next"],
    [part="trigger"],
    [part="jump-go"],
    [part="fill"] {
      transition-duration: var(--vu-duration-instant);
    }

    [part="page"]:active:not(:disabled),
    [part="prev"]:active:not(:disabled),
    [part="next"]:active:not(:disabled),
    [part="trigger"]:active:not(:disabled),
    [part="jump-go"]:active:not(:disabled) {
      transform: none;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    [part="overlay"] {
      background: var(--vu-color-surface);
    }
  }

  @media (prefers-contrast: more) {
    [part="jump-input"],
    [part="jump-go"],
    [part="menu"] {
      border-width: var(--vu-border-width-emphasis, 2px);
    }
  }

  @media (forced-colors: active) {
    [part="page"],
    [part="prev"],
    [part="next"],
    [part="trigger"],
    [part="menu"] button,
    [part="jump-input"],
    [part="jump-go"] {
      forced-color-adjust: none;
      border: 1px solid CanvasText;
    }

    [part="page"]:focus-visible,
    [part="prev"]:focus-visible,
    [part="next"]:focus-visible,
    [part="trigger"]:focus-visible,
    [part="jump-go"]:focus-visible,
    [part="jump-input"]:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }
  }
`;
