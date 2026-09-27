import { css } from "lit";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const alertStyles = css`
  ${controlSizeMetricsTokens}

  :host {
    display: block;
    width: 100%;
    font-family: var(--vu-font-sans);
    box-sizing: border-box;

    /* Intent-driven channels; overridden by [color="*"] selectors below.
       Default intent uses 'surface' tokens (not the neutral '--vu-color-default')
       so the alert reads as a visible card on the page bg instead of blending in.
       bg/fg are PAIRED tokens — keep them on the same family (see "Paired tokens" rule). */
    --alert-strong: var(--vu-color-surface);
    --alert-strong-fg: var(--vu-color-surface-foreground);
    --alert-soft: var(--vu-color-surface-secondary);
    --alert-soft-fg: var(--vu-color-surface-secondary-foreground);
    --alert-edge: var(--vu-color-border);

    /* Size-driven metrics; pad/type local, dismiss from CSM. */
    --alert-py: var(--vu-space-2-5);
    --alert-px: var(--vu-space-3-5);
    --alert-gap: var(--vu-space-3);
    --alert-icon-size: var(--vu-font-size-lg);
    --alert-heading-size: var(--vu-font-size-md);
    --alert-message-size: var(--vu-font-size-sm);
    --alert-close-size: var(--vu-csm-dismiss-size);
    --alert-close-icon-size: var(--vu-csm-dismiss-icon-size);

    /* Defaults for [variant="soft"] (the default variant). */
    --alert-bg: var(--alert-soft);
    --alert-fg: var(--alert-soft-fg);
    /* Same width as outline so solid/soft/ghost don't jump in size. */
    --alert-border: var(--vu-border-width) solid transparent;
  }

  /* Intent palettes — set the four channel vars from the global theme. */
  :host([color="primary"]) {
    --alert-strong: var(--vu-color-accent);
    --alert-strong-fg: var(--vu-color-accent-foreground);
    --alert-soft: var(--vu-color-accent-soft);
    --alert-soft-fg: var(--vu-color-accent-soft-foreground);
    --alert-edge: var(--vu-color-accent);
  }
  :host([color="success"]) {
    --alert-strong: var(--vu-color-success);
    --alert-strong-fg: var(--vu-color-success-foreground);
    --alert-soft: var(--vu-color-success-soft);
    --alert-soft-fg: var(--vu-color-success-soft-foreground);
    --alert-edge: var(--vu-color-success);
  }
  :host([color="warning"]) {
    --alert-strong: var(--vu-color-warning);
    --alert-strong-fg: var(--vu-color-warning-foreground);
    --alert-soft: var(--vu-color-warning-soft);
    --alert-soft-fg: var(--vu-color-warning-soft-foreground);
    --alert-edge: var(--vu-color-warning);
  }
  :host([color="danger"]) {
    --alert-strong: var(--vu-color-danger);
    --alert-strong-fg: var(--vu-color-danger-foreground);
    --alert-soft: var(--vu-color-danger-soft);
    --alert-soft-fg: var(--vu-color-danger-soft-foreground);
    --alert-edge: var(--vu-color-danger);
  }

  /* Variant treatments — pick which channels become bg/fg/border. */
  :host([variant="solid"]) {
    --alert-bg: var(--alert-strong);
    --alert-fg: var(--alert-strong-fg);
    --alert-border: var(--vu-border-width) solid transparent;
  }
  :host([variant="soft"]) {
    --alert-bg: var(--alert-soft);
    --alert-fg: var(--alert-soft-fg);
    --alert-border: var(--vu-border-width) solid transparent;
  }
  :host([variant="outline"]) {
    --alert-bg: color-mix(in oklab, var(--alert-strong) 8%, transparent);
    --alert-fg: var(--alert-soft-fg);
    --alert-border: var(--vu-border-width) solid var(--alert-edge);
  }
  :host([variant="ghost"]) {
    --alert-bg: transparent;
    --alert-fg: var(--alert-soft-fg);
    --alert-border: var(--vu-border-width) solid transparent;
  }

  /* Default intent uses surface tokens as 'strong'; outline/ghost variants must
     re-pin foreground to the page text color so it stays readable on transparent bg. */
  :host([variant="outline"]:not([color]):not([color="primary"]):not([color="success"]):not([color="warning"]):not([color="danger"])),
  :host([variant="outline"][color="default"]) {
    --alert-bg: color-mix(in oklab, var(--vu-color-field) 70%, transparent);
    --alert-fg: var(--vu-color-foreground);
    --alert-edge: var(--vu-color-border);
  }
  :host([variant="ghost"]:not([color]):not([color="primary"]):not([color="success"]):not([color="warning"]):not([color="danger"])),
  :host([variant="ghost"][color="default"]) {
    --alert-fg: var(--vu-color-foreground);
    --alert-edge: var(--vu-color-border);
  }

  /* Sizes — pad/type only; dismiss comes from controlSizeMetricsTokens. */
  :host([size="sm"]) {
    --alert-py: var(--vu-space-2);
    --alert-px: var(--vu-space-3);
    --alert-gap: var(--vu-space-2);
    --alert-icon-size: var(--vu-font-size-md);
    --alert-heading-size: var(--vu-font-size-sm);
    --alert-message-size: var(--vu-font-size-xs);
  }
  :host([size="lg"]) {
    --alert-py: var(--vu-space-4);
    --alert-px: var(--vu-space-5);
    --alert-gap: var(--vu-space-3);
    --alert-icon-size: var(--vu-font-size-xl);
    --alert-heading-size: var(--vu-font-size-lg);
    --alert-message-size: var(--vu-font-size-md);
  }

  /* Surface — never wraps; content shrinks via 'min-inline-size: 0' on [part='content']. */
  [part="alert"] {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-start;
    gap: var(--alert-gap);
    box-sizing: border-box;
    padding-block: var(--alert-py);
    padding-inline: var(--alert-px);
    border: var(--alert-border);
    border-radius: var(--vu-radius-md);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--alert-bg);
    color: var(--alert-fg);
    opacity: 1;
    transform: scale(1);
    transform-origin: center top;
    /* First-line box — optically center icon + dismiss (message-only default). */
    --alert-first-line-size: var(--alert-message-size);
    --alert-first-line-lh: var(--vu-line-height-normal);
    --alert-first-line-box: calc(var(--alert-first-line-size) * var(--alert-first-line-lh));
    --alert-icon-offset: calc((var(--alert-first-line-box) - var(--alert-icon-size)) / 2);
    --alert-close-offset: calc((var(--alert-first-line-box) - var(--alert-close-size)) / 2);
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  /* Heading present — align lead controls to the heading line box instead. */
  [part="alert"].has-heading {
    --alert-first-line-size: var(--alert-heading-size);
    --alert-first-line-lh: var(--vu-line-height-snug);
  }

  /* Exit motion runs via WAAPI (AnimationController); block interaction while closing. */
  [part="alert"].is-closing {
    pointer-events: none;
  }

  /* Leading icon — toggled via [hidden] from the host. */
  [part="icon"] {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    inline-size: var(--alert-icon-size);
    block-size: var(--alert-icon-size);
    font-size: var(--alert-icon-size);
    color: inherit;
    margin-block-start: var(--alert-icon-offset);
  }
  [part="icon"][hidden] {
    display: none;
  }

  /* Body — heading + message stack */
  [part="stack"] {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: var(--vu-space-half);
    min-inline-size: 0;
  }

  [part="heading"] {
    display: block;
    font-family: var(--vu-font-sans);
    font-size: var(--alert-heading-size);
    font-weight: var(--vu-font-weight-semibold);
    line-height: var(--vu-line-height-snug);
    letter-spacing: var(--vu-letter-spacing-normal);
    color: inherit;
  }
  [part="heading"][hidden] {
    display: none;
  }
  :host:not(:has([slot="heading"])) [part="heading"]:not(.has-text) {
    display: none;
  }

  /* Body region — always present so 'aria-describedby' has a stable target.
     Kept as 'block' (not 'contents') so the id stays on a real box for a11y. */
  [part="body"] {
    font-size: var(--alert-message-size);
    line-height: var(--vu-line-height-normal);
    color: inherit;
  }
  [part="body"][hidden] {
    display: none;
  }

  [part="icon"] vu-icon[hidden] {
    display: none;
  }
  :host:not(:has([slot="icon"])) [part="icon"]:not(:has(vu-icon:not([hidden]))) {
    display: none;
  }
  :host:not(:has(> :not([slot]))) [part="body"]:not(.has-text) {
    display: none;
  }

  [part="message"] {
    display: block;
    margin: 0;
    font-family: var(--vu-font-sans);
    font-size: var(--alert-message-size);
    font-weight: var(--vu-font-weight-normal);
    line-height: var(--vu-line-height-normal);
    letter-spacing: var(--vu-letter-spacing-normal);
    color: inherit;
  }

  /* Default slot (always rendered; hidden when [part='message'] wins so 'slotchange' keeps firing). */
  [part="stack"] > [part="body"] > slot[hidden] {
    display: none;
  }

  /* Default slot body — set base type, then tame browser defaults for the common
     body elements consumers actually slot in (paragraphs, lists, links, code).
     '::slotted()' only accepts a single compound selector — no combinators —
     so nested-list / sibling spacing is left to the user. */
  ::slotted(*) {
    font-size: var(--alert-message-size);
    line-height: var(--vu-line-height-normal);
  }
  ::slotted(p) {
    margin: 0;
  }
  ::slotted(ul),
  ::slotted(ol) {
    margin: 0;
    padding-inline-start: var(--vu-space-5);
  }
  ::slotted(a) {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
  @media (hover: hover) {
    ::slotted(a:hover) {
      text-decoration-thickness: var(--vu-border-width-emphasis);
    }
  }
  ::slotted(code) {
    font-family: var(--vu-font-mono, ui-monospace, SFMono-Regular, monospace);
    font-size: 0.95em;
    padding-inline: 0.25em;
    border-radius: var(--vu-radius-xs);
    corner-shape: var(--vu-corner-shape, round);
    background: color-mix(in oklab, currentColor 10%, transparent);
  }

  /* Trailing actions cluster — toggled via [hidden]. */
  [part="actions"] {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--vu-space-2);
    margin-inline-start: auto;
  }
  [part="actions"][hidden] {
    display: none;
  }
  :host:not(:has([slot="actions"])) [part="actions"] {
    display: none;
  }
  :host([removable]) [part="actions"] {
    display: inline-flex;
  }

  /* Dismiss button */
  [part="close"] {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    inline-size: var(--alert-close-size);
    block-size: var(--alert-close-size);
    padding: 0;
    margin-block-start: var(--alert-close-offset);
    background: transparent;
    border: 0;
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    color: inherit;
    font-size: var(--alert-close-icon-size);
    line-height: 0;
    cursor: var(--vu-cursor-interactive);
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }
  @media (hover: hover) {
    [part="close"]:hover {
      background: color-mix(in oklab, currentColor 12%, transparent);
    }
  }
  [part="close"]:active {
    background: color-mix(in oklab, currentColor 18%, transparent);
  }
  [part="close"]:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  [part="close"] vu-icon {
    display: inline-flex;
    font-size: 1em;
    width: 1em;
    height: 1em;
  }

  /* User preferences */
  @media (prefers-reduced-motion: reduce) {
    [part="alert"],
    [part="close"] {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    :host([variant="outline"]) [part="alert"] {
      border-width: var(--vu-border-width-emphasis);
    }
    [part="close"]:focus-visible {
      box-shadow: none;
      outline: var(--vu-border-width-emphasis) solid currentColor;
      outline-offset: var(--vu-space-half);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    @media (hover: hover) {
      [part="close"]:hover {
        background: var(--vu-color-surface-hover);
      }
    }
    [part="close"]:active {
      background: var(--vu-color-surface-active);
    }
    ::slotted(code) {
      background: var(--vu-color-surface-secondary);
    }
  }

  @media (forced-colors: active) {
    [part="alert"] {
      border: var(--vu-border-width-emphasis) solid CanvasText;
    }
    [part="close"]:focus-visible {
      box-shadow: none;
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
    }
  }
`;
