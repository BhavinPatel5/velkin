import { css } from "lit";

export const badgeStyles = css`
  :host {
    display: inline-flex;
    position: relative;
    box-sizing: border-box;
    line-height: var(--vu-line-height-none);
    vertical-align: middle;

    --badge-bg: var(--vu-color-danger-soft);
    --badge-fg: var(--vu-color-danger-soft-foreground);
    --badge-ring: var(--vu-color-danger);

    /* Pill/dot scale — fixed block-size + matching min-inline keeps single digits circular. */
    --badge-min-size: var(--vu-space-5);
    --badge-px: var(--vu-space-1-5);
    --badge-font-size: var(--vu-font-size-xs);

    --badge-translate-x: 50%;
    --badge-translate-y: -50%;
  }

  :host([size="sm"]) {
    --badge-min-size: var(--vu-space-4);
    --badge-px: var(--vu-space-1);
    --badge-font-size: var(--vu-font-size-xs);
  }

  :host([size="lg"]) {
    --badge-min-size: var(--vu-space-6);
    --badge-px: var(--vu-space-1-5);
    --badge-font-size: var(--vu-font-size-sm);
  }

  :host([disabled]) {
    opacity: var(--vu-opacity-disabled-control);
  }

  :host([color="default"]) {
    --badge-bg: var(--vu-color-surface-secondary);
    --badge-fg: var(--vu-color-surface-secondary-foreground);
    --badge-ring: var(--vu-color-border);
  }
  :host([color="primary"]) {
    --badge-bg: var(--vu-color-accent);
    --badge-fg: var(--vu-color-accent-foreground);
    --badge-ring: var(--vu-color-accent);
  }
  :host([color="success"]) {
    --badge-bg: var(--vu-color-success);
    --badge-fg: var(--vu-color-success-foreground);
    --badge-ring: var(--vu-color-success);
  }
  :host([color="warning"]) {
    --badge-bg: var(--vu-color-warning);
    --badge-fg: var(--vu-color-warning-foreground);
    --badge-ring: var(--vu-color-warning);
  }
  :host([color="danger"]) {
    --badge-bg: var(--vu-color-danger);
    --badge-fg: var(--vu-color-danger-foreground);
    --badge-ring: var(--vu-color-danger);
  }

  [part="base"] {
    display: inline-flex;
    position: relative;
  }

  [part="badge"] {
    position: absolute;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    block-size: var(--badge-min-size);
    min-inline-size: var(--badge-min-size);
    padding-block: 0;
    padding-inline: var(--badge-px);
    background: var(--badge-bg);
    color: var(--badge-fg);
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    font-family: var(--vu-font-sans);
    font-size: var(--badge-font-size);
    font-weight: var(--vu-font-weight-semibold);
    line-height: 1;
    letter-spacing: var(--vu-letter-spacing-tight);
    white-space: nowrap;
    user-select: none;
    pointer-events: none;
    transform: translate(var(--badge-translate-x), var(--badge-translate-y));
    transition:
      opacity var(--vu-duration-normal) var(--vu-ease-out-cubic),
      transform var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  /* After size rules so padding wins over :host([size]) [part=badge] when both match. */
  [part="badge"].is-dot {
    inline-size: var(--badge-min-size);
    block-size: var(--badge-min-size);
    min-inline-size: var(--badge-min-size);
    padding-inline: 0;
    padding-block: 0;
  }

  ::slotted(*) {
    color: inherit;
    line-height: 1;
  }

  :host([bordered]) [part="badge"] {
    box-shadow: 0 0 0 var(--vu-border-width-emphasis)
      var(--badge-bordered-gap-color, var(--vu-color-background));
  }

  [part="badge"].is-hidden {
    opacity: 0;
    transform: translate(var(--badge-translate-x), var(--badge-translate-y)) scale(0.6);
    pointer-events: none;
  }

  :host([placement="top-right"]) [part="badge"] {
    inset-block-start: 0;
    inset-inline-end: 0;
    --badge-translate-x: 50%;
    --badge-translate-y: -50%;
  }
  :host([placement="top-left"]) [part="badge"] {
    inset-block-start: 0;
    inset-inline-start: 0;
    --badge-translate-x: -50%;
    --badge-translate-y: -50%;
  }
  :host([placement="bottom-right"]) [part="badge"] {
    inset-block-end: 0;
    inset-inline-end: 0;
    --badge-translate-x: 50%;
    --badge-translate-y: 50%;
  }
  :host([placement="bottom-left"]) [part="badge"] {
    inset-block-end: 0;
    inset-inline-start: 0;
    --badge-translate-x: -50%;
    --badge-translate-y: 50%;
  }
  :host([placement="top-center"]) [part="badge"] {
    inset-block-start: 0;
    inset-inline-start: 50%;
    --badge-translate-x: -50%;
    --badge-translate-y: -50%;
  }

  :host([processing]) [part="badge"]::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    corner-shape: round;
    box-shadow: 0 0 0 0 var(--badge-ring);
    animation: vu-badge-pulse 1.6s var(--vu-ease-out-cubic) infinite;
    pointer-events: none;
  }

  @keyframes vu-badge-pulse {
    0% {
      box-shadow: 0 0 0 0 var(--badge-ring);
      opacity: 0.7;
    }
    80% {
      box-shadow: 0 0 0 calc(var(--badge-min-size) * 0.55) var(--badge-ring);
      opacity: 0;
    }
    100% {
      box-shadow: 0 0 0 0 var(--badge-ring);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    [part="badge"] {
      transition-duration: var(--vu-duration-instant);
    }
    [part="badge"].is-hidden {
      transform: translate(var(--badge-translate-x), var(--badge-translate-y));
    }
    :host([processing]) [part="badge"]::after {
      animation: none;
    }
  }

  @media (prefers-contrast: more) {
    [part="badge"] {
      outline: var(--vu-border-width-emphasis) solid transparent;
      outline-offset: calc(-1 * var(--vu-border-width-emphasis));
    }
    :host([bordered]) [part="badge"] {
      box-shadow: 0 0 0 calc(var(--vu-border-width-emphasis) * 2)
        var(--badge-bordered-gap-color, var(--vu-color-background));
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  @media (forced-colors: active) {
    [part="badge"] {
      border: var(--vu-border-width-emphasis) solid CanvasText;
    }
    :host([bordered]) [part="badge"] {
      box-shadow: none;
      outline: var(--vu-border-width-emphasis) solid Canvas;
      outline-offset: var(--vu-border-width-emphasis);
    }
  }
`;
