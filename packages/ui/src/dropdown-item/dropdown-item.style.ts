import { css } from "lit";

export const dropdownItemStyles = css`
  :host {
    display: block;
    width: 100%;
    font-family: var(--vu-font-sans);
    --di-gap: var(--vu-space-2-5);
    --di-pad-y: var(--vu-space-2);
    --di-pad-x: var(--vu-space-2-5);
    --di-fs: var(--vu-font-size-sm);
    --di-line: var(--vu-line-height-sm);

    --di-min-block-size: var(--menu-overlay-row-min-block-size, var(--vu-space-8));
    --di-radius: var(--vu-radius-sm);
    --di-fg: var(--vu-color-overlay-foreground);
    --di-hover-bg: var(--menu-overlay-hover);
    --di-selected-bg: var(--vu-color-accent-soft);
    --di-selected-fg: var(--vu-color-accent-soft-foreground);
    --di-focus-ring: var(--vu-color-focus);
    --di-focus-shadow: 0 0 0 2px var(--vu-color-background), 0 0 0 4px var(--di-focus-ring);
  }

  :host([size="sm"]) {
    --di-gap: var(--vu-space-2);
    --di-pad-y: var(--vu-space-1);
    --di-pad-x: var(--vu-space-2);
    --di-min-block-size: var(--menu-overlay-row-min-block-size, var(--vu-space-7));
    --di-fs: var(--vu-font-size-xs);
    --di-line: var(--vu-line-height-xs);
    --di-radius: var(--vu-radius-xs);
  }

  :host([size="lg"]) {
    --di-gap: var(--vu-space-3);
    --di-pad-y: var(--vu-space-1-5);
    --di-pad-x: var(--vu-space-3);
    --di-min-block-size: var(--menu-overlay-row-min-block-size, var(--vu-space-9));
    --di-fs: var(--vu-font-size-md);
    --di-line: var(--vu-line-height-md);
    --di-radius: var(--vu-radius-md);
  }

  :host([color="primary"]) {
    --di-fg: var(--vu-color-accent-soft-foreground);
    --di-hover-bg: var(--vu-color-accent-soft-hover);
    --di-selected-bg: var(--vu-color-accent-soft);
    --di-selected-fg: var(--vu-color-accent-soft-foreground);
    --di-focus-ring: var(--vu-color-accent);
  }

  :host([color="success"]) {
    --di-fg: var(--vu-color-success-soft-foreground);
    --di-hover-bg: var(--vu-color-success-soft-hover);
    --di-selected-bg: var(--vu-color-success-soft);
    --di-selected-fg: var(--vu-color-success-soft-foreground);
    --di-focus-ring: var(--vu-color-success);
  }

  :host([color="warning"]) {
    --di-fg: var(--vu-color-warning-soft-foreground);
    --di-hover-bg: var(--vu-color-warning-soft-hover);
    --di-selected-bg: var(--vu-color-warning-soft);
    --di-selected-fg: var(--vu-color-warning-soft-foreground);
    --di-focus-ring: var(--vu-color-warning);
  }

  :host([color="danger"]) {
    --di-fg: var(--vu-color-danger-soft-foreground);
    --di-hover-bg: var(--vu-color-danger-soft-hover);
    --di-selected-bg: var(--vu-color-danger-soft);
    --di-selected-fg: var(--vu-color-danger-soft-foreground);
    --di-focus-ring: var(--vu-color-danger);
  }

  [part="base"] {
    display: flex;
    align-items: center;
    gap: var(--di-gap);
    min-block-size: var(--di-min-block-size);
    padding: var(--di-pad-y) var(--di-pad-x);
    width: 100%;
    position: relative;
    font-family: inherit;
    font-size: var(--di-fs);
    line-height: var(--di-line);
    text-align: start;
    text-decoration: none;
    border: 0;
    border-radius: var(--di-radius);
    corner-shape: var(--vu-corner-shape, round);
    background: transparent;
    color: var(--di-fg);
    cursor: pointer;
    box-sizing: border-box;
    transition:
      background-color var(--vu-duration-fast) var(--vu-ease-out-cubic),
      color var(--vu-duration-fast) var(--vu-ease-out-cubic),
      transform var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  @media (hover: hover) {
    [part="base"]:hover {
      background: var(--di-hover-bg);
    }

    :host([selected]) [part="base"]:hover {
      background: color-mix(
        in oklab,
        var(--di-selected-bg) 88%,
        var(--di-selected-fg) 12%
      );
    }
  }

  [part="base"]:active:not([aria-disabled="true"]) {
    transform: scale(0.98);
  }

  [part="base"]:focus-visible {
    outline: none;
    box-shadow: var(--di-focus-shadow);
  }

  :host([selected]) [part="base"] {
    background: var(--di-selected-bg);
    color: var(--di-selected-fg);
  }

  :host([selected]) [part="hint"] {
    color: color-mix(in oklab, var(--di-selected-fg) 82%, transparent);
  }

  :host([selected]) [part="shortcut"] {
    color: color-mix(in oklab, var(--di-selected-fg) 78%, transparent);
    background: color-mix(in oklab, var(--di-selected-fg) 12%, transparent);
  }

  :host([selected]) [part="badge"] {
    background: color-mix(in oklab, var(--di-selected-fg) 16%, transparent);
    color: var(--di-selected-fg);
  }

  :host([selected]) [part="badge"].tone-success,
  :host([selected]) [part="badge"].tone-warning,
  :host([selected]) [part="badge"].tone-danger {
    background: color-mix(in oklab, var(--di-selected-fg) 16%, transparent);
    color: var(--di-selected-fg);
  }

  [part="base"][aria-disabled="true"] {
    cursor: not-allowed;
    opacity: var(--vu-opacity-disabled-control);
  }

  [part="check"] {
    inline-size: var(--vu-space-4-5);
    block-size: var(--vu-space-4-5);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 var(--vu-space-4-5);
    color: inherit;
  }

  [part="start"],
  [part="end"] {
    display: inline-flex;
    inline-size: var(--vu-space-4-5);
    block-size: var(--vu-space-4-5);
    align-items: center;
    justify-content: center;
    flex: 0 0 var(--vu-space-4-5);
    color: inherit;
  }

  [part="start"][hidden],
  [part="end"][hidden] {
    display: none;
  }

  :host:not(:has([slot="start"])) [part="start"]:not(.has-fallback) {
    display: none;
  }

  :host:not(:has([slot="end"])):not(:has([slot="submenu"])) [part="end"]:not(.has-fallback) {
    display: none;
  }

  [part="stack"] {
    flex: 1;
    min-inline-size: 0;
    display: grid;
    grid-auto-rows: min-content;
    row-gap: var(--vu-space-half);
  }

  [part="label"] {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  [part="hint"] {
    display: block;
    color: var(--vu-color-muted);
    font-size: calc(var(--di-fs) - 1px);
    line-height: calc(var(--di-line) - var(--vu-space-half));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  [part="hint"][hidden] {
    display: none;
  }

  :host:not(:has([slot="hint"])) [part="hint"]:not(.has-text) {
    display: none;
  }

  [part="shortcut"] {
    color: var(--vu-color-muted);
    font-variant-numeric: tabular-nums;
    font-size: var(--vu-font-size-xs);
    padding: 0 var(--vu-space-1);
    border-radius: var(--vu-radius-xs);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--vu-color-default);
    border: 0;
  }

  [part="badge"] {
    display: inline-flex;
    align-items: center;
    padding: 0 var(--vu-space-2);
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    font-size: var(--vu-font-size-xs);
    background: var(--vu-color-default);
    color: var(--vu-color-default-foreground);
    border: 0;
  }

  [part="badge"].tone-success {
    background: var(--vu-color-success-soft);
    color: var(--vu-color-success-soft-foreground);
  }

  [part="badge"].tone-warning {
    background: var(--vu-color-warning-soft);
    color: var(--vu-color-warning-soft-foreground);
  }

  [part="badge"].tone-danger {
    background: var(--vu-color-danger-soft);
    color: var(--vu-color-danger-soft-foreground);
  }

  [part="trailing"] {
    margin-inline-start: auto;
    display: inline-flex;
    align-items: center;
    gap: var(--vu-space-2);
    white-space: nowrap;
  }

  .submenu-host {
    position: absolute;
    inline-size: 0;
    block-size: 0;
    overflow: visible;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
  }

  slot:not([name])::slotted(vu-dropdown) {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    [part="base"] {
      transition-duration: var(--vu-duration-instant);
    }
    [part="base"]:active:not([aria-disabled="true"]) {
      transform: none;
    }
  }

  @media (prefers-contrast: more) {
    [part="base"]:focus-visible {
      --di-focus-shadow: 0 0 0 2px var(--vu-color-background), 0 0 0 5px var(--di-focus-ring);
    }

    :host([selected]) [part="base"] {
      box-shadow: inset 0 0 0 var(--vu-border-width) var(--di-selected-fg);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    [part="base"][aria-disabled="true"] {
      opacity: 1;
      filter: grayscale(1);
    }

    :host([selected]) [part="hint"],
    :host([selected]) [part="shortcut"] {
      color: var(--di-selected-fg);
    }
  }

  @media (forced-colors: active) {
    [part="base"]:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }

    :host([selected]) [part="base"] {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }

    [part="base"][aria-disabled="true"] {
      opacity: 1;
      forced-color-adjust: none;
    }
  }

  slot[name="submenu"]::slotted(*) {
    overflow: visible;
  }
`;
