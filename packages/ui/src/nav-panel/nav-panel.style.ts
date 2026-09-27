import { css } from "lit";
import {
  menuOverlayCohesionHost,
  menuOverlayCohesionSize,
} from "../internals/styles/menu-overlay-cohesion.css.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const navPanelStyles = css`
  ${controlSizeMetricsTokens}

  :host {
    display: flex;
    flex-direction: column;
    font-family: var(--vu-font-sans);
    -webkit-tap-highlight-color: transparent;
    inline-size: 100%;
    min-block-size: 0;
    --np-pad-y: var(--vu-space-2);
    --np-pad-x: var(--vu-space-3);
    --np-row-gap: var(--vu-space-3);
    --np-font: var(--vu-csm-chrome-font-size);
    --np-desc-font: var(--vu-font-size-xs);
    --np-active-bg: var(--surface-tone-hover, var(--surface-tone-hover, var(--vu-color-surface-hover)));
    --np-active-fg: var(--vu-color-foreground);
    --np-panel-bg: transparent;
    --np-panel-fg: var(--vu-color-foreground);
    --np-body-pad-y: 0;
    --np-body-pad-x: 0;
    ${menuOverlayCohesionHost}
  }

  ${menuOverlayCohesionSize}

  :host([collapsed]) {
    inline-size: var(--nav-panel-width-collapsed, 3.25rem);
  }

  :host([size="sm"]) {
    --np-pad-y: var(--vu-space-1-5);
    --np-pad-x: var(--vu-space-2);
    --np-row-gap: var(--vu-space-2);
    --np-desc-font: var(--vu-font-size-xs);
  }

  :host([size="lg"]) {
    --np-pad-y: var(--vu-space-3);
    --np-pad-x: var(--vu-space-4);
    --np-row-gap: var(--vu-space-3-5);
    --np-desc-font: var(--vu-font-size-sm);
  }

  :host([color="primary"]) {
    --np-active-bg: var(--vu-color-accent-soft);
    --np-active-fg: var(--vu-color-accent-soft-foreground);
  }

  :host([color="success"]) {
    --np-active-bg: var(--vu-color-success-soft, color-mix(in oklab, var(--vu-color-success) 14%, transparent));
    --np-active-fg: var(--vu-color-success-soft-foreground);
  }

  :host([color="warning"]) {
    --np-active-bg: var(--vu-color-warning-soft, color-mix(in oklab, var(--vu-color-warning) 14%, transparent));
    --np-active-fg: var(--vu-color-warning-soft-foreground);
  }

  :host([color="danger"]) {
    --np-active-bg: var(--vu-color-danger-soft, color-mix(in oklab, var(--vu-color-danger) 14%, transparent));
    --np-active-fg: var(--vu-color-danger-soft-foreground);
  }

  [part="panel"] {
    display: flex;
    flex-direction: column;
    gap: var(--vu-space-1);
    flex: 1 1 auto;
    min-block-size: 0;
    min-inline-size: 0;
    color: var(--np-panel-fg);
    background: var(--np-panel-bg);
  }

  [part="body"] {
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--np-body-pad-y) var(--np-body-pad-x);
    outline: none;
    flex: 1 1 auto;
    min-block-size: 0;
  }

  :host([collapsed]) [part="body"] {
    padding-inline: var(--vu-space-2);
  }

  [part="prepend"],
  [part="append"] {
    display: block;
  }

  [part="prepend"][hidden],
  [part="append"][hidden] {
    display: none;
  }

  :host:not(:has([slot="prepend"])) [part="prepend"],
  :host([collapsed]) [part="prepend"] {
    display: none;
  }

  :host:not(:has([slot="append"])) [part="append"],
  :host([collapsed]) [part="append"] {
    display: none;
  }

  [part="groups"][hidden],
  [part="flat"][hidden] {
    display: none;
  }

  vu-icon {
    display: inline-flex;
    inline-size: 1em;
    block-size: 1em;
    flex-shrink: 0;
  }

  [part="row"] {
    display: flex;
    align-items: center;
    gap: var(--np-row-gap);
    padding: var(--np-pad-y) var(--np-pad-x);
    margin: var(--vu-space-1) 0;
    border-radius: var(--vu-radius-md);
    corner-shape: var(--vu-corner-shape, round);
    font-weight: var(--vu-font-weight-normal);
    color: var(--vu-color-foreground);
    font-size: var(--np-font);
    font-family: inherit;
    text-decoration: none;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-fast) var(--vu-ease-out-cubic);
    cursor: pointer;
    border: none;
    background: transparent;
    inline-size: 100%;
    text-align: start;
    box-sizing: border-box;
  }

  :host([collapsed]) [part="row"] {
    justify-content: center;
    padding: var(--np-pad-y);
    gap: 0;
  }

  :host([collapsed]) vu-tooltip {
    display: block;
    inline-size: 100%;
  }

  :host([collapsed]) vu-tooltip::part(trigger) {
    display: block;
    inline-size: 100%;
  }

  @media (hover: hover) {
    [part="row"]:hover:not([data-active]):not([data-disabled]) {
      background: var(--surface-tone-hover, var(--vu-color-surface-hover));
    }
  }

  [part="row"]:focus-visible {
    background: var(--surface-tone-hover, var(--vu-color-surface-hover));
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  [part="row"][data-active] {
    background: var(--np-active-bg);
    color: var(--np-active-fg);
  }

  [part="row"][data-disabled] {
    opacity: var(--vu-opacity-disabled-control);
    cursor: not-allowed;
    pointer-events: none;
  }

  [part="stack"] {
    display: flex;
    flex-direction: column;
    gap: var(--vu-space-half);
    flex: 1 1 auto;
    min-inline-size: 0;
  }

  [part="label"] {
    font-weight: var(--vu-font-weight-medium);
    line-height: var(--vu-line-height-snug, 1.35);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  [part="description"] {
    font-size: var(--np-desc-font);
    color: var(--vu-color-muted);
    line-height: var(--vu-line-height-normal, 1.4);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  [part="badge"] {
    flex-shrink: 0;
    font-size: var(--np-desc-font);
    color: var(--vu-color-muted);
    font-variant-numeric: tabular-nums;
  }

  [part="fallback"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 1.25em;
    block-size: 1.25em;
    border-radius: var(--vu-radius-sm);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--surface-tone-hover, var(--vu-color-surface-hover));
    font-size: var(--np-desc-font);
    font-weight: var(--vu-font-weight-semibold);
    text-transform: uppercase;
  }

  [part="group-content"] [part="row"] {
    padding-inline-start: var(--vu-space-6);
  }

  :host([collapsed]) [part="group-content"] [part="row"] {
    padding-inline-start: var(--np-pad-y);
  }

  [part="list"],
  [part="group-content"] ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  [part="heading"] {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--vu-space-2);
    font-weight: var(--vu-font-weight-medium);
    padding: var(--np-pad-y) var(--np-pad-x);
    font-size: var(--np-font);
    font-family: inherit;
    color: var(--vu-color-foreground);
    cursor: pointer;
    user-select: none;
    border-radius: var(--vu-radius-md);
    corner-shape: var(--vu-corner-shape, round);
    border: none;
    background: transparent;
    inline-size: 100%;
    text-align: start;
    box-sizing: border-box;
  }

  [part="heading"]:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
    background: var(--surface-tone-hover, var(--vu-color-surface-hover));
  }

  [part="icon"] {
    font-size: var(--vu-csm-action-icon-size);
  }

  [part="icon"][data-position="end"] {
    margin-inline-start: auto;
  }

  :host([collapsed]) [part="icon"][data-position="end"] {
    margin-inline-start: 0;
  }

  [part="chevron"] {
    transition: none;
  }

  [part="heading"][aria-expanded="false"] [part="chevron"] {
    transform: rotate(180deg);
  }

  [part="group-content"] {
    overflow: hidden;
    transition: none;
    opacity: 1;
    transform: translateY(0);
    will-change: max-height, opacity, transform;
  }

  [part="group-content"][data-collapsed] {
    max-height: 0 !important;
    opacity: 0;
    transform: translateY(calc(-1 * var(--vu-space-1)));
    pointer-events: none;
  }

  :host([data-ready]) [part="group-content"] {
    transition:
      max-height var(--vu-duration-normal) var(--vu-ease-out-cubic),
      opacity var(--vu-duration-fast) var(--vu-ease-out-cubic),
      transform var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host([data-ready]) [part="chevron"] {
    transition: transform var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  @media (prefers-reduced-motion: reduce) {
    :host,
    [part="row"],
    [part="group-content"],
    [part="chevron"] {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    [part="heading"]:focus-visible,
    [part="row"]:focus-visible {
      --vu-focus-ring: 0 0 0 2px var(--vu-color-background), 0 0 0 5px var(--vu-color-focus);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    [part="row"][data-active] {
      background: var(--vu-color-surface);
    }
  }

  @media (forced-colors: active) {
    [part="row"],
    [part="heading"] {
      forced-color-adjust: none;
      border: 1px solid CanvasText;
    }

    [part="row"][data-active] {
      background: Highlight;
      color: HighlightText;
    }

    [part="heading"]:focus-visible,
    [part="row"]:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }
  }
`;
