import { css } from "lit";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const progressStyles = css`
  ${controlSizeMetricsTokens}

  :host {
    display: inline-block;
    box-sizing: border-box;
    inline-size: 100%;
    font-family: var(--vu-font-sans);
    -webkit-tap-highlight-color: transparent;

    --progress-track-size: var(--vu-space-3);
    --progress-radius: var(--vu-radius-full);
    --progress-track-bg: var(--vu-color-surface-tertiary);
    --progress-buffer-bg: color-mix(
      in oklab,
      var(--vu-color-foreground) 10%,
      var(--progress-track-bg)
    );
    --progress-fill-bg: var(--vu-color-accent);
    --progress-indeterminate-width: 40%;
    --progress-indeterminate-speed: 1s;
    --progress-ring-size: var(--vu-csm-action-min-block-size);
    --progress-ring-stroke: var(--vu-space-1-5);
  }

  :host([variant="ring"]) {
    inline-size: auto;
  }

  :host([variant="ring"][block]) {
    display: flex;
    justify-content: center;
    inline-size: 100%;
  }

  :host([variant="ring"][size="sm"]) {
    --progress-ring-stroke: var(--vu-space-1);
  }

  :host([variant="ring"][size="lg"]) {
    --progress-ring-stroke: var(--vu-space-2);
  }

  :host([block]) {
    display: block;
    inline-size: 100%;
  }

  :host([size="sm"]) {
    --progress-track-size: var(--vu-space-2);
  }

  :host([size="lg"]) {
    --progress-track-size: var(--vu-space-3-5);
  }

  :host([tone="subtle"]) {
    --progress-track-bg: var(--vu-color-surface-secondary);
  }

  :host([tone="strong"]) {
    --progress-track-bg: var(--vu-color-surface-tertiary);
  }

  :host([color="default"]) {
    --progress-fill-bg: var(--vu-color-accent);
  }

  :host([color="primary"]) {
    --progress-fill-bg: var(--vu-color-accent);
  }

  :host([color="success"]) {
    --progress-fill-bg: var(--vu-color-success);
  }

  :host([color="warning"]) {
    --progress-fill-bg: var(--vu-color-warning);
  }

  :host([color="danger"]) {
    --progress-fill-bg: var(--vu-color-danger);
  }

  [part="container"] {
    position: relative;
    inline-size: 100%;
    block-size: var(--progress-track-size);
    border-radius: var(--progress-radius);
    corner-shape: round;
    background: var(--progress-track-bg);
    overflow: hidden;
    box-sizing: border-box;
    /* Reserve outline stroke so default matches outline track metrics. */
    border: var(--vu-border-width) solid transparent;
  }

  :host([variant="outline"]) [part="container"] {
    background: var(--vu-color-surface-secondary);
    border-color: var(--vu-color-border);
    box-shadow: var(--vu-shadow-field, none);
  }

  :host([variant="underline"]) {
    --progress-track-size: var(--vu-border-width-emphasis);
    --progress-radius: 0;
  }

  :host([variant="underline"]) [part="container"] {
    background: var(--vu-color-border);
    border: 0;
    border-radius: 0;
  }

  :host([variant="underline"]) [part="bar"],
  :host([variant="underline"]) [part="buffer"],
  :host([variant="underline"]) [part="indeterminate"] {
    border-radius: 0;
  }

  :host([variant="ring"]) [part="container"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: auto;
    block-size: auto;
    overflow: visible;
    background: transparent;
    border: 0;
    border-radius: 0;
  }

  :host([variant="ring"]) [part="ring"] {
    position: relative;
    display: block;
    inline-size: var(--progress-ring-size);
    block-size: var(--progress-ring-size);
  }

  :host([variant="ring"]) [part="track"],
  :host([variant="ring"]) [part="bar"],
  :host([variant="ring"]) [part="buffer"],
  :host([variant="ring"]) [part="indeterminate"] {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    -webkit-mask: radial-gradient(
      farthest-side,
      transparent calc(100% - var(--progress-ring-stroke)),
      #000 calc(100% - var(--progress-ring-stroke))
    );
    mask: radial-gradient(
      farthest-side,
      transparent calc(100% - var(--progress-ring-stroke)),
      #000 calc(100% - var(--progress-ring-stroke))
    );
  }

  :host([variant="ring"]) [part="track"] {
    background: var(--progress-track-bg);
  }

  :host([variant="ring"]) [part="bar"] {
    z-index: 2;
    background: conic-gradient(
      var(--progress-fill-bg) var(--progress-ring-pct),
      transparent 0
    );
    transform: rotate(-90deg);
    transition: background var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host([variant="ring"]) [part="buffer"] {
    z-index: 1;
    background: conic-gradient(
      var(--progress-buffer-bg) var(--progress-ring-pct),
      transparent 0
    );
    transform: rotate(-90deg);
    transition: background var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host([variant="ring"]) [part="indeterminate"] {
    z-index: 1;
    background: conic-gradient(
      var(--progress-fill-bg) var(--progress-indeterminate-width),
      transparent 0
    );
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    animation: progress-ring-spin var(--progress-indeterminate-speed) linear infinite;
  }

  :host(:not([variant="ring"])) [part="bar"] {
    position: relative;
    z-index: 2;
    block-size: 100%;
    inline-size: 0%;
    border-radius: var(--progress-radius);
    corner-shape: round;
    background: var(--progress-fill-bg);
    transition: inline-size var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host(:not([variant="ring"])) [part="buffer"] {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    z-index: 1;
    block-size: 100%;
    inline-size: 0%;
    border-radius: var(--progress-radius);
    corner-shape: round;
    background: var(--progress-buffer-bg);
    transition: inline-size var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host(:not([variant="ring"])) [part="indeterminate"] {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    z-index: 1;
    inline-size: var(--progress-indeterminate-width);
    block-size: 100%;
    border-radius: var(--progress-radius);
    corner-shape: round;
    background: var(--progress-fill-bg);
    animation-duration: var(--progress-indeterminate-speed);
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    will-change: transform;
  }

  @keyframes progress-indeterminate-ltr {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(350%);
    }
  }

  @keyframes progress-indeterminate-rtl {
    from {
      transform: translateX(350%);
    }
    to {
      transform: translateX(-100%);
    }
  }

  @keyframes progress-ring-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :host(:not([variant="ring"])) [part="bar"],
    :host(:not([variant="ring"])) [part="buffer"] {
      transition-duration: var(--vu-duration-instant);
    }

    :host(:not([variant="ring"])) [part="indeterminate"] {
      animation: none;
      transform: translateX(25%);
      inline-size: 50%;
      opacity: 0.85;
    }

    :host([variant="ring"]) [part="indeterminate"] {
      animation: none;
      opacity: 0.85;
    }
  }

  @media (prefers-contrast: more) {
    :host(:not([variant="ring"])) [part="container"] {
      box-shadow: inset 0 0 0 var(--vu-border-width-emphasis) var(--vu-color-border);
    }

    :host(:not([variant="ring"])) [part="buffer"] {
      box-shadow: inset 0 0 0 1px var(--vu-color-border);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host(:not([variant="ring"])) [part="indeterminate"],
    :host([variant="ring"]) [part="indeterminate"] {
      opacity: 1;
    }
  }

  @media (forced-colors: active) {
    :host(:not([variant="ring"])) [part="container"] {
      forced-color-adjust: none;
      background: Canvas;
      box-shadow: inset 0 0 0 1px CanvasText;
    }

    :host(:not([variant="ring"])) [part="bar"],
    :host(:not([variant="ring"])) [part="indeterminate"] {
      forced-color-adjust: none;
      background: Highlight;
    }

    :host(:not([variant="ring"])) [part="buffer"] {
      forced-color-adjust: none;
      background: Canvas;
      box-shadow: inset 0 0 0 1px CanvasText;
    }

    :host([variant="ring"]) [part="track"] {
      background: Canvas;
    }

    :host([variant="ring"]) [part="bar"],
    :host([variant="ring"]) [part="indeterminate"] {
      background: conic-gradient(Highlight var(--progress-ring-pct, var(--progress-indeterminate-width)), transparent 0);
    }

    :host([variant="ring"]) [part="buffer"] {
      background: conic-gradient(Canvas var(--progress-ring-pct), transparent 0);
    }
  }
`;
