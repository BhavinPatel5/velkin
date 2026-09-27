import { css } from "lit";

export const chipStyles = css`
  :host {
    display: inline-block;
    box-sizing: border-box;
    font-family: var(--vu-font-sans);
    line-height: var(--vu-line-height-snug);
    vertical-align: middle;

    --chip-strong: var(--vu-color-surface);
    --chip-strong-fg: var(--vu-color-surface-foreground);
    --chip-soft: var(--vu-color-surface-secondary);
    --chip-soft-fg: var(--vu-color-surface-secondary-foreground);
    --chip-edge: var(--vu-color-border);
    --chip-strong-hover: var(--vu-color-surface-hover);
    --chip-soft-hover: color-mix(
      in oklab,
      var(--vu-color-surface-secondary) 88%,
      var(--vu-color-surface-secondary-foreground) 12%
    );

    --chip-bg: var(--chip-soft);
    --chip-fg: var(--chip-soft-fg);

    --chip-border: var(--vu-border-width-emphasis) solid transparent;
    --chip-shadow: none;
    --chip-dot-fill: var(--chip-edge);

    --chip-gap: var(--vu-space-half);
    --chip-py: var(--vu-space-1);
    --chip-px: var(--vu-space-2);
    --chip-font-size: var(--vu-font-size-sm);
    --chip-icon-size: 1em;
    --chip-radius: var(--vu-radius-full);

    --chip-interactive-min-block-size: var(--vu-space-6);

    --chip-close-size: var(--vu-space-7);
    --chip-close-icon: var(--vu-space-3-5);
  }

  :host([size="xs"]) {
    --chip-gap: var(--vu-space-half);
    --chip-py: var(--vu-space-half);
    --chip-px: var(--vu-space-1);
    --chip-font-size: var(--vu-font-size-xs);

    --chip-interactive-min-block-size: var(--vu-space-6);
    --chip-close-size: var(--vu-space-6);
    --chip-close-icon: var(--vu-space-3);
  }
  :host([size="sm"]) {
    --chip-gap: var(--vu-space-half);
    --chip-py: var(--vu-space-0-75);
    --chip-px: var(--vu-space-1-5);
    --chip-font-size: var(--vu-font-size-xs);
    --chip-interactive-min-block-size: var(--vu-space-6);
    --chip-close-size: var(--vu-space-6);
    --chip-close-icon: var(--vu-space-3);
  }
  :host([size="md"]) {
    --chip-gap: var(--vu-space-half);
    --chip-py: var(--vu-space-1);
    --chip-px: var(--vu-space-2);
    --chip-font-size: var(--vu-font-size-sm);
    --chip-interactive-min-block-size: var(--vu-space-6);
    --chip-close-size: var(--vu-space-7);
    --chip-close-icon: var(--vu-space-3-5);
  }
  :host([size="lg"]) {
    --chip-gap: var(--vu-space-1);
    --chip-py: var(--vu-space-1-25);
    --chip-px: var(--vu-space-2-5);
    --chip-font-size: var(--vu-font-size-sm);
    --chip-interactive-min-block-size: var(--vu-space-8);
    --chip-close-size: var(--vu-space-8);
    --chip-close-icon: var(--vu-space-4);
  }
  :host([size="xl"]) {
    --chip-gap: var(--vu-space-1);
    --chip-py: var(--vu-space-1-5);
    --chip-px: var(--vu-space-3);
    --chip-font-size: var(--vu-font-size-md);
    --chip-interactive-min-block-size: var(--vu-space-9);
    --chip-close-size: var(--vu-space-8);
    --chip-close-icon: var(--vu-space-4);
  }

  :host([radius="none"]) {
    --chip-radius: 0;
  }

  :host([radius="sm"]) {
    --chip-radius: var(--vu-control-radius-sm);
  }
  :host([radius="md"]) {
    --chip-radius: var(--vu-control-radius-md);
  }
  :host([radius="lg"]) {
    --chip-radius: var(--vu-control-radius-lg);
  }
  :host([radius="full"]) {
    --chip-radius: var(--vu-radius-full);
  }

  :host([color="primary"]) {
    --chip-strong: var(--vu-color-accent);
    --chip-strong-fg: var(--vu-color-accent-foreground);
    --chip-soft: var(--vu-color-accent-soft);
    --chip-soft-fg: var(--vu-color-accent-soft-foreground);
    --chip-edge: var(--vu-color-accent);
    --chip-strong-hover: color-mix(in oklab, var(--vu-color-accent) 92%, var(--vu-color-foreground) 8%);
    --chip-soft-hover: var(--vu-color-accent-soft-hover);
  }
  :host([color="success"]) {
    --chip-strong: var(--vu-color-success);
    --chip-strong-fg: var(--vu-color-success-foreground);
    --chip-soft: var(--vu-color-success-soft);
    --chip-soft-fg: var(--vu-color-success-soft-foreground);
    --chip-edge: var(--vu-color-success);
    --chip-strong-hover: color-mix(in oklab, var(--vu-color-success) 92%, var(--vu-color-foreground) 8%);
    --chip-soft-hover: var(--vu-color-success-soft-hover);
  }
  :host([color="warning"]) {
    --chip-strong: var(--vu-color-warning);
    --chip-strong-fg: var(--vu-color-warning-foreground);
    --chip-soft: var(--vu-color-warning-soft);
    --chip-soft-fg: var(--vu-color-warning-soft-foreground);
    --chip-edge: var(--vu-color-warning);
    --chip-strong-hover: color-mix(in oklab, var(--vu-color-warning) 92%, var(--vu-color-foreground) 8%);
    --chip-soft-hover: var(--vu-color-warning-soft-hover);
  }
  :host([color="danger"]) {
    --chip-strong: var(--vu-color-danger);
    --chip-strong-fg: var(--vu-color-danger-foreground);
    --chip-soft: var(--vu-color-danger-soft);
    --chip-soft-fg: var(--vu-color-danger-soft-foreground);
    --chip-edge: var(--vu-color-danger);
    --chip-strong-hover: color-mix(in oklab, var(--vu-color-danger) 92%, var(--vu-color-foreground) 8%);
    --chip-soft-hover: var(--vu-color-danger-soft-hover);
  }

  :host([variant="solid"]) {
    --chip-bg: var(--chip-strong);
    --chip-fg: var(--chip-strong-fg);
    --chip-border: var(--vu-border-width-emphasis) solid transparent;
    --chip-shadow: none;
  }
  :host([variant="soft"]) {
    --chip-bg: var(--chip-soft);
    --chip-fg: var(--chip-soft-fg);
    --chip-border: var(--vu-border-width-emphasis) solid transparent;
    --chip-shadow: none;
  }
  :host([variant="outline"]) {
    --chip-bg: color-mix(in oklab, var(--chip-edge) 8%, transparent);
    --chip-fg: var(--chip-soft-fg);
    --chip-border: var(--vu-border-width-emphasis) solid var(--chip-edge);
    --chip-shadow: none;
  }
  :host([variant="ghost"]) {
    --chip-bg: transparent;
    --chip-fg: var(--chip-soft-fg);
    --chip-border: var(--vu-border-width-emphasis) solid transparent;
    --chip-shadow: none;
  }
  :host([variant="dot"]) {
    --chip-bg: transparent;
    --chip-fg: var(--vu-color-foreground);
    --chip-border: var(--vu-border-width-emphasis) solid var(--vu-color-border);
    --chip-shadow: none;
    --chip-dot-fill: var(--chip-strong);
  }

  :host([variant="outline"]:not([color]):not([color="primary"]):not([color="success"]):not([color="warning"]):not([color="danger"])),
  :host([variant="outline"][color="default"]),
  :host([variant="ghost"]:not([color]):not([color="primary"]):not([color="success"]):not([color="warning"]):not([color="danger"])),
  :host([variant="ghost"][color="default"]) {
    --chip-strong: var(--vu-color-foreground);
    --chip-fg: var(--vu-color-foreground);
    --chip-soft-fg: var(--vu-color-foreground);
    --chip-edge: var(--vu-color-border);
  }
  :host([variant="outline"]:not([color]):not([color="primary"]):not([color="success"]):not([color="warning"]):not([color="danger"])),
  :host([variant="outline"][color="default"]) {
    --chip-bg: color-mix(in oklab, var(--vu-color-field) 70%, transparent);
  }

  :host([disabled]) {
    cursor: not-allowed;
    opacity: var(--vu-opacity-disabled-control);
  }

  :host([disabled]) .chip {
    pointer-events: none;
  }

  .chip.is-closing {
    pointer-events: none;
  }

  :host([disabled]) [part="close"] {
    pointer-events: none;
  }

  .chip {
    position: relative;
    display: inline-flex;
    width: max-content;
    max-inline-size: 100%;
    box-sizing: border-box;
    align-items: center;
    gap: var(--chip-gap);
    padding-block: var(--chip-py);
    padding-inline: var(--chip-px);
    border: var(--chip-border);
    border-radius: var(--chip-radius);
    corner-shape: round;
    background: var(--chip-bg);
    color: var(--chip-fg);
    box-shadow: var(--chip-shadow);
    font-size: var(--chip-font-size);
    font-weight: var(--vu-font-weight-medium);
    letter-spacing: var(--vu-letter-spacing-normal);
    cursor: default;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic),
      transform var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  :host([radius="sm"]) .chip,
  :host([radius="md"]) .chip,
  :host([radius="lg"]) .chip {
    corner-shape: var(--vu-corner-shape, round);
  }

  :host([interactive]) .chip,
  :host([href]) .chip {
    min-block-size: var(--chip-interactive-min-block-size);
  }

  :host([icononly]) .chip {
    aspect-ratio: 1;
    justify-content: center;
    padding-inline: var(--chip-py);
    min-inline-size: var(--chip-interactive-min-block-size);
    min-block-size: var(--chip-interactive-min-block-size);
  }

  :host([selected]) .chip {
    box-shadow: inset 0 var(--vu-border-width) var(--vu-space-half) rgb(0 0 0 / 14%);
  }

  :host([selected][variant="soft"]) .chip,
  :host([selected][variant="ghost"]) .chip {
    background: var(--chip-soft-hover);
    color: var(--chip-soft-fg);
  }
  :host([selected][variant="outline"]) .chip {
    background: color-mix(in oklab, var(--chip-edge) 24%, transparent);
    color: var(--chip-soft-fg);
  }
  :host([selected][variant="outline"]:not([color]):not([color="primary"]):not([color="success"]):not([color="warning"]):not([color="danger"])) .chip,
  :host([selected][variant="outline"][color="default"]) .chip {
    background: color-mix(in oklab, var(--vu-color-field) 95%, var(--vu-color-foreground) 10%);
    color: var(--vu-color-foreground);
  }

  :host([selected][variant="solid"]) .chip {
    background: var(--chip-strong-hover);
  }

  [part="control"] {
    display: inline-flex;
    min-inline-size: 0;
    flex: 1 1 auto;
    align-items: center;
    gap: var(--chip-gap);
    border: 0;
    padding: 0;
    margin: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-decoration: none;
    line-height: inherit;
    cursor: inherit;
  }

  .chip.interactive [part="control"] {
    cursor: var(--vu-cursor-interactive);
    transition: transform var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  .chip.interactive:active [part="control"] {
    transform: scale(0.97);
  }

  button[part="control"] {
    cursor: var(--vu-cursor-interactive);
    -webkit-tap-highlight-color: transparent;
  }

  button[part="control"]:focus-visible,
  a[part="control"]:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
    border-radius: calc(var(--chip-radius) - var(--vu-space-half));
    corner-shape: round;
  }

  :host([loading]) [part="control"],
  :host([loading]) [part="start"],
  :host([loading]) [part="end"],
  :host([loading]) [part="icon"],
  .chip.loading [part="control"],
  .chip.loading [part="start"],
  .chip.loading [part="end"],
  .chip.loading [part="icon"] {
    visibility: hidden;
  }

  [part="start"],
  [part="end"] {
    display: contents;
    line-height: 1;
  }

  @media (hover: hover) {
    :host([variant="solid"]:not([disabled]):not([loading]):not([selected])) .chip:hover {
      background: var(--chip-strong-hover);
    }
    :host([variant="soft"]:not([disabled]):not([loading]):not([selected])) .chip:hover {
      background: var(--chip-soft-hover);
    }
    :host([variant="outline"]:not([disabled]):not([loading]):not([selected])) .chip:hover {
      background: color-mix(in oklab, var(--chip-edge) 16%, transparent);
      color: var(--chip-soft-fg);
    }
    :host([variant="outline"]:not([color]):not([color="primary"]):not([color="success"]):not([color="warning"]):not([color="danger"]):not([disabled]):not([loading]):not([selected])) .chip:hover,
    :host([variant="outline"][color="default"]:not([disabled]):not([loading]):not([selected])) .chip:hover {
      background: color-mix(in oklab, var(--vu-color-field) 85%, var(--vu-color-foreground) 6%);
      color: var(--vu-color-foreground);
    }
    :host([variant="ghost"]:not([disabled]):not([loading]):not([selected])) .chip:hover {
      background: var(--chip-soft);
      color: var(--chip-soft-fg);
    }
    :host([variant="dot"]:not([disabled]):not([loading]):not([selected])) .chip:hover {
      background: var(--vu-color-surface-secondary);
    }
    :host([selected][variant="solid"]:not([disabled]):not([loading])) .chip:hover {
      background: color-mix(in oklab, var(--chip-strong-hover) 88%, black);
    }
    :host([selected][variant="soft"]:not([disabled]):not([loading])) .chip:hover,
    :host([selected][variant="ghost"]:not([disabled]):not([loading])) .chip:hover {
      background: color-mix(in oklab, var(--chip-soft-hover) 88%, var(--chip-soft-fg));
      color: var(--chip-soft-fg);
    }
    :host([selected][variant="outline"]:not([disabled]):not([loading])) .chip:hover {
      background: color-mix(in oklab, var(--chip-edge) 28%, transparent);
      color: var(--chip-soft-fg);
    }
    :host([selected][variant="outline"]:not([color]):not([color="primary"]):not([color="success"]):not([color="warning"]):not([color="danger"]):not([disabled]):not([loading])) .chip:hover,
    :host([selected][variant="outline"][color="default"]:not([disabled]):not([loading])) .chip:hover {
      background: color-mix(in oklab, var(--vu-color-field) 90%, var(--vu-color-foreground) 15%);
      color: var(--vu-color-foreground);
    }
    :host(:not([selected])) .chip.interactive:hover [part="control"] {
      text-decoration: none;
    }
  }

  .chip.dot {
    padding-inline-start: calc(var(--chip-px) + var(--vu-space-4));
  }

  .chip.dot::before {
    content: "";
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: var(--vu-space-1-5);
    transform: translateY(-50%);
    inline-size: var(--vu-space-2);
    block-size: var(--vu-space-2);
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    background-color: var(--chip-dot-fill);
  }

  .chip:has([part="close"]) {
    padding-inline-end: calc(var(--chip-px) - var(--vu-space-half));
  }

  [part="close"] {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    inline-size: var(--chip-close-size);
    block-size: var(--chip-close-size);
    margin: 0;
    margin-inline-start: calc(var(--chip-gap) * -0.35);
    padding: 0;
    background: transparent;
    border: 0;
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    color: inherit;
    font-size: var(--chip-close-icon);
    line-height: var(--vu-line-height-none);
    cursor: var(--vu-cursor-interactive);
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  [part="close"]::before {
    content: "";
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    inline-size: max(24px, 160%);
    block-size: max(24px, 160%);
    transform: translate(-50%, -50%);
    border-radius: inherit;
    corner-shape: round;
  }

  [part="close"] vu-icon {
    position: relative;
    z-index: 1;
    font-size: 1em;
  }

  :host([disabled]) [part="close"] {
    cursor: not-allowed;
  }

  @media (hover: hover) {
    [part="close"]:hover:not(:disabled) {
      background: color-mix(in oklab, currentColor 12%, transparent);
    }
  }
  [part="close"]:active:not(:disabled) {
    background: color-mix(in oklab, currentColor 18%, transparent);
    transform: scale(0.92);
  }
  [part="close"]:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  .icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    color: inherit;
    font-size: var(--chip-icon-size);
    line-height: 1;
  }

  slot[hidden] {
    display: none;
  }

  vu-icon {
    display: inline-block;
    width: 1em;
    height: 1em;
  }

  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--vu-color-backdrop);
    border-radius: inherit;
    corner-shape: round;
    pointer-events: none;
  }

  .loading-spinner {
    inline-size: var(--vu-space-3-5);
    block-size: var(--vu-space-3-5);
    border: var(--vu-border-width-emphasis) solid color-mix(in oklab, var(--chip-fg) 35%, transparent);
    border-block-start-color: var(--chip-fg);
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    animation: vu-chip-spin var(--vu-duration-spin, 750ms) linear infinite;
  }

  @keyframes vu-chip-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .chip,
    [part="close"] {
      transition-duration: var(--vu-duration-instant);
    }
    .chip.interactive:active [part="control"],
    [part="close"]:active:not(:disabled) {
      transform: none;
    }
    .loading-spinner {
      animation-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    :host([variant="outline"]) .chip,
    :host([variant="dot"]) .chip {
      border-width: var(--vu-border-width-emphasis);
    }
    :host([variant="ghost"]) .chip {
      border: var(--vu-border-width-emphasis) solid var(--chip-edge);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  @media (forced-colors: active) {
    .chip {
      border: var(--vu-border-width) solid CanvasText;
      forced-color-adjust: none;
    }
    .chip.dot::before {
      background: CanvasText;
    }
    [part="close"]:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }
    :host([selected]) .chip {
      background: Highlight;
      color: HighlightText;
    }
  }
`;
