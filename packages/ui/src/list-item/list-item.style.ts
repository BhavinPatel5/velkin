import { css } from "lit";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const listItemStyles = css`
  ${controlSizeMetricsTokens}

  :host {
    display: block;
    font-family: var(--vu-font-sans);
    --li-gap: var(--vu-space-3);
    --li-pad-y: var(--vu-space-2-5);
    --li-pad-x: var(--vu-space-3-5);
    --li-fs: var(--vu-font-size-sm);
    --li-hint-fs: var(--vu-font-size-xs);
    --li-line: var(--vu-line-height-sm);
    --li-fg: var(--vu-color-foreground);
    --li-hint-fg: var(--vu-color-muted);
    --li-border: var(--vu-color-border);
    --li-hover-bg: var(--surface-tone-hover, var(--vu-color-surface-hover));
    --li-selected-bg: var(--vu-color-accent-soft);
    --li-selected-edge: var(--vu-color-accent);
    --li-focus-ring: var(--vu-color-focus);
    --li-focus-shadow: 0 0 0 2px var(--vu-color-background), 0 0 0 4px var(--li-focus-ring);
    --li-avatar-size: var(--vu-csm-action-min-block-size);
  }

  :host([size="sm"]),
  :host-context(vu-list[size="sm"]) {
    --li-gap: var(--vu-space-2);
    --li-pad-y: var(--vu-space-1-5);
    --li-pad-x: var(--vu-space-2-5);
    --li-fs: var(--vu-font-size-xs);
    --li-hint-fs: var(--vu-font-size-xs);
    /* host-context can't flip CSM; pin height when size lives on vu-list. */
    --li-avatar-size: var(--vu-control-height-sm);
  }

  :host([size="lg"]),
  :host-context(vu-list[size="lg"]) {
    --li-gap: var(--vu-space-3-5);
    --li-pad-y: var(--vu-space-3);
    --li-pad-x: var(--vu-space-4);
    --li-fs: var(--vu-font-size-md);
    --li-hint-fs: var(--vu-font-size-sm);
    --li-avatar-size: var(--vu-control-height-lg);
  }

  :host([dense]),
  :host-context(vu-list[dense]) {
    --li-pad-y: var(--vu-space-1-5);
    --li-pad-x: var(--vu-space-2-5);
    --li-gap: var(--vu-space-2);
    --li-avatar-size: var(--vu-control-height-sm);
  }

  :host([disabled]) {
    opacity: var(--vu-opacity-disabled-control);
    cursor: not-allowed;
  }

  :host([disabled]) [part="base"] {
    pointer-events: none;
  }

  :host([data-subheader]) {
    cursor: default;
  }

  [part="subheader"] {
    display: block;
    font-size: var(--vu-font-size-xs);
    font-weight: var(--vu-font-weight-semibold);
    line-height: var(--vu-line-height-xs);
    letter-spacing: var(--vu-letter-spacing-wide);
    text-transform: uppercase;
    text-align: start;
    color: var(--vu-color-muted);
    padding: var(--vu-space-2) var(--li-pad-x);
    background: var(--vu-color-surface-secondary);
    border-block-end: var(--vu-border-width) solid var(--li-border);
    position: sticky;
    top: 0;
    z-index: 1;
  }

  [part="base"] {
    display: flex;
    align-items: center;
    gap: var(--li-gap);
    width: 100%;
    box-sizing: border-box;
    padding: var(--li-pad-y) var(--li-pad-x);
    border: 0;
    border-block-end: var(--vu-border-width) solid var(--li-border);
    background: transparent;
    color: var(--li-fg);
    font: inherit;
    font-size: var(--li-fs);
    line-height: var(--li-line);
    text-align: start;
    text-decoration: none;
    cursor: pointer;
    transition:
      background-color var(--vu-duration-fast) var(--vu-ease-out-cubic),
      color var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  :host(:last-child) [part="base"] {
    border-block-end: none;
  }

  @media (hover: hover) {
    :host(:not([selected])) [part="base"]:hover {
      background: var(--li-hover-bg);
    }

    :host([selected]) [part="base"]:hover {
      background: color-mix(in oklab, var(--li-selected-bg) 88%, var(--li-selected-edge));
    }
  }

  [part="base"]:focus-visible {
    outline: none;
    box-shadow: var(--li-focus-shadow);
    z-index: 1;
  }

  :host([selected]) [part="base"] {
    background: var(--li-selected-bg);
    box-shadow: inset var(--vu-space-0-75) 0 0 0 var(--li-selected-edge);
  }

  :host([selected]) [part="base"]:focus-visible {
    box-shadow:
      inset var(--vu-space-0-75) 0 0 0 var(--li-selected-edge),
      var(--li-focus-shadow);
  }

  [part="start"] {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  [part="start"][hidden] {
    display: none;
  }

  :host:not(:has([slot="start"])) [part="start"]:not(.has-fallback) {
    display: none;
  }

  [part="stack"] {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--vu-space-half);
  }

  [part="label"] {
    min-width: 0;
  }

  [part="hint"] {
    display: block;
    font-size: var(--li-hint-fs);
    line-height: var(--vu-line-height-xs);
    color: var(--li-hint-fg);
  }

  [part="hint"][hidden] {
    display: none;
  }

  :host:not(:has([slot="hint"])) [part="hint"]:not(.has-text) {
    display: none;
  }

  [part="actions"] {
    display: flex;
    align-items: center;
    gap: var(--vu-space-2);
    flex-shrink: 0;
    margin-inline-start: auto;
  }

  [part="actions"][hidden] {
    display: none;
  }

  :host:not(:has([slot="actions"])) [part="actions"] {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    [part="base"] {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    [part="base"]:focus-visible {
      --li-focus-shadow: 0 0 0 2px var(--vu-color-background), 0 0 0 5px var(--li-focus-ring);
    }

    :host([selected]) [part="base"] {
      box-shadow: inset var(--vu-space-0-75) 0 0 0 var(--li-selected-edge);
    }

    :host([selected]) [part="base"]:focus-visible {
      box-shadow:
        inset var(--vu-space-0-75) 0 0 0 var(--li-selected-edge),
        var(--li-focus-shadow);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }

    :host([selected]) [part="base"] {
      background: var(--vu-color-surface);
    }
  }

  @media (forced-colors: active) {
    [part="base"] {
      forced-color-adjust: none;
      border-block-end: var(--vu-border-width) solid CanvasText;
      color: CanvasText;
    }

    [part="base"]:hover,
    :host([selected]) [part="base"] {
      background: Highlight;
      color: HighlightText;
    }

    [part="base"]:focus-visible {
      outline: var(--vu-border-width-emphasis) solid Highlight;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }

    [part="subheader"] {
      border-block-end: var(--vu-border-width) solid CanvasText;
      background: Canvas;
      color: CanvasText;
    }

    [part="hint"] {
      color: GrayText;
    }
  }
`;
