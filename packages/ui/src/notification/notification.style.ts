import { css } from "lit";
import { overlaySurfaceGuard } from "../internals/styles/overlay-surface-guard.css.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const notificationStyles = css`
  ${overlaySurfaceGuard}
  ${controlSizeMetricsTokens}

  :host {
    display: block;
    position: fixed;
    z-index: 9999;
    font-family: var(--vu-font-sans);
    pointer-events: none;
    --nt-item-width: 20rem;
    --nt-stack-hover-gap: 8px;
    --nt-stack-fan-limit: 3;
    --nt-stack-peek: 12px;
    --nt-stack-scale-step: 0.05;
    --nt-stack-transition-ms: var(--vu-duration-slow, 300ms);
    --nt-motion-ms: var(--vu-duration-slow, 300ms);
    --nt-stack-inset: 18px;
    --nt-viewport-offset: var(--vu-space-2-5);
    --nt-list-gap: var(--vu-space-2);
    --nt-close-size: var(--vu-csm-dismiss-size);
  }

  [part="base"] {
    pointer-events: none;
  }

  [part="anchor"] {
    display: block;
    pointer-events: none;
  }

  [part="panel"] {
    box-sizing: border-box;
    inline-size: max-content;
    position: fixed;
    background: transparent;
    border: none;
    inset-block-start: var(--vu-pop-top);
    inset-inline-start: var(--vu-pop-left);
    overflow: visible;
    margin: 0;
    pointer-events: auto;
  }

  [part="list"] {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--nt-list-gap);
  }

  :host([layout="list"]) [part="list"] {
    transition: gap var(--nt-motion-ms) var(--vu-ease-out-fluid);
  }

  :host([layout="list"]) [part="item"] {
    transition:
      transform var(--nt-motion-ms) var(--vu-ease-out-fluid),
      opacity var(--nt-motion-ms) var(--vu-ease-out-fluid),
      box-shadow var(--nt-motion-ms) var(--vu-ease-out-fluid);
  }

  :host([layout="stack"]) [part="list"] {
    position: relative;
    box-sizing: border-box;
    padding: var(--nt-stack-inset);
    inline-size: calc(var(--nt-item-width) + var(--nt-stack-inset) * 2);
    overflow: visible;
    gap: 0;
    transition:
      block-size var(--nt-stack-transition-ms) var(--vu-ease-out-fluid),
      height var(--nt-stack-transition-ms) var(--vu-ease-out-fluid),
      inline-size var(--nt-stack-transition-ms) var(--vu-ease-out-fluid);
  }

  :host([layout="stack"]) [part="list"]::after {
    content: "";
    position: absolute;
    inset-inline: var(--nt-stack-inset);
    block-size: var(--nt-stack-hit, 0px);
    pointer-events: auto;
  }

  :host([layout="stack"][position^="top"]) [part="list"]::after {
    inset-block-start: var(--nt-stack-inset);
  }

  :host([layout="stack"][position^="bottom"]) [part="list"]::after {
    inset-block-end: var(--nt-stack-inset);
  }

  [part="item"] {
    --nt-strong: var(--vu-color-surface);
    --nt-strong-fg: var(--vu-color-foreground);
    --nt-soft: var(--vu-color-surface-secondary);
    --nt-soft-fg: var(--vu-color-surface-secondary-foreground);
    --nt-edge: var(--vu-color-border);
    --nt-accent: var(--vu-color-foreground);
    --nt-muted: var(--vu-color-muted);
    --nt-item-bg: var(--nt-strong);
    --nt-item-fg: var(--nt-strong-fg);
    --nt-item-edge: var(--nt-edge);
    --nt-item-accent: var(--nt-accent);
    --nt-item-muted: var(--nt-muted);
    --nt-item-border: 1px solid var(--nt-item-edge);
    --nt-item-accent-bar: 0 solid transparent;

    background: color-mix(in oklab, var(--nt-item-bg) var(--vu-surface-fill, 100%), transparent);
    border: var(--nt-item-border);
    border-radius: var(--vu-radius-lg);
    corner-shape: var(--vu-corner-shape, round);
    box-sizing: border-box;
    padding: var(--vu-space-2-5) var(--vu-space-3);
    box-shadow: var(--vu-shadow-surface);
    backdrop-filter: var(--vu-surface-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-surface-backdrop-filter);
    display: flex;
    flex-direction: column;
    gap: var(--vu-space-2);
    color: var(--nt-item-fg);
    position: relative;
    inline-size: var(--nt-item-width);
    font-size: var(--vu-font-size-sm);
    backface-visibility: hidden;
    isolation: isolate;
    overflow: hidden;
  }

  [part="progress"] {
    position: absolute;
    inset-inline: 0;
    block-size: 2px;
    background: var(--nt-item-accent);
    opacity: 0.55;
    transform-origin: 0% 50%;
    pointer-events: none;
    animation: nt-progress var(--nt-item-duration-ms, 4000ms) linear forwards;
  }

  :host([dir="rtl"]) [part="progress"] {
    transform-origin: 100% 50%;
  }

  :host([position^="bottom"]) [part="progress"] {
    inset-block-end: 0;
  }

  :host([position^="top"]) [part="progress"] {
    inset-block-start: 0;
  }

  :host([paused]) [part="progress"] {
    animation-play-state: paused;
  }

  @keyframes nt-progress {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }

  [part="overflow"] {
    align-self: flex-end;
    font-size: var(--vu-font-size-xs);
    font-weight: var(--vu-font-weight-medium);
    color: var(--vu-color-muted);
    padding-block-end: var(--vu-space-1);
    pointer-events: none;
  }

  :host([layout="stack"]) [part="overflow"] {
    position: absolute;
    inset-block-end: 0;
    inset-inline-end: var(--nt-stack-inset);
    z-index: 4;
    padding: 0;
  }

  [part="item"][color="primary"] {
    --nt-strong: var(--vu-color-accent);
    --nt-strong-fg: var(--vu-color-accent-foreground);
    --nt-soft: var(--vu-color-accent-soft);
    --nt-soft-fg: var(--vu-color-accent-soft-foreground);
    --nt-edge: var(--vu-color-accent);
    --nt-accent: var(--vu-color-accent);
  }

  [part="item"][color="success"] {
    --nt-strong: var(--vu-color-success);
    --nt-strong-fg: var(--vu-color-success-foreground);
    --nt-soft: var(--vu-color-success-soft);
    --nt-soft-fg: var(--vu-color-success-soft-foreground);
    --nt-edge: var(--vu-color-success);
    --nt-accent: var(--vu-color-success);
  }

  [part="item"][color="warning"] {
    --nt-strong: var(--vu-color-warning);
    --nt-strong-fg: var(--vu-color-warning-foreground);
    --nt-soft: var(--vu-color-warning-soft);
    --nt-soft-fg: var(--vu-color-warning-soft-foreground);
    --nt-edge: var(--vu-color-warning);
    --nt-accent: var(--vu-color-warning);
  }

  [part="item"][color="danger"] {
    --nt-strong: var(--vu-color-danger);
    --nt-strong-fg: var(--vu-color-danger-foreground);
    --nt-soft: var(--vu-color-danger-soft);
    --nt-soft-fg: var(--vu-color-danger-soft-foreground);
    --nt-edge: var(--vu-color-danger);
    --nt-accent: var(--vu-color-danger);
  }

  [part="item"][variant="flat"] {
    --nt-item-bg: var(--vu-color-surface);
    --nt-item-fg: var(--vu-color-foreground);
    --nt-item-edge: var(--vu-color-border);
    --nt-item-muted: var(--vu-color-muted);
    --nt-item-border: 1px solid var(--nt-item-edge);
  }

  [part="item"][variant="soft"] {
    --nt-item-bg: var(--nt-soft);
    --nt-item-fg: var(--nt-soft-fg);
    --nt-item-muted: color-mix(in srgb, var(--nt-soft-fg) 72%, transparent);
    --nt-item-border: 1px solid color-mix(in srgb, var(--nt-edge) 24%, transparent);
  }

  :host([layout="stack"]) [part="item"][variant="soft"] {
    --nt-item-bg: color-mix(in oklab, var(--nt-soft) 78%, transparent);
    --nt-item-border: 1px solid color-mix(in oklab, var(--nt-edge) 18%, transparent);
    backdrop-filter: var(--vu-overlay-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-overlay-backdrop-filter);
  }

  [part="item"][variant="solid"] {
    --nt-item-bg: var(--nt-strong);
    --nt-item-fg: var(--nt-strong-fg);
    --nt-item-muted: color-mix(in srgb, var(--nt-strong-fg) 82%, transparent);
    --nt-item-border: 1px solid transparent;
  }

  [part="item"][variant="bordered"] {
    --nt-item-bg: var(--vu-color-surface);
    --nt-item-fg: var(--vu-color-foreground);
    --nt-item-edge: var(--vu-color-border);
    --nt-item-muted: var(--vu-color-muted);
    --nt-item-border: 1px solid var(--nt-item-edge);
    --nt-item-accent-bar: 3px solid var(--nt-item-accent);
    border-inline-start: var(--nt-item-accent-bar);
  }

  :host([layout="stack"]) [part="item"] {
    position: absolute;
    inset-inline: var(--nt-stack-inset);
    inline-size: auto;
    margin: 0;
    pointer-events: none;
    will-change: transform, opacity;
    transition:
      inset-block-start var(--nt-stack-transition-ms) var(--vu-ease-out-fluid),
      inset-block-end var(--nt-stack-transition-ms) var(--vu-ease-out-fluid),
      transform var(--nt-stack-transition-ms) var(--vu-ease-out-fluid),
      opacity var(--nt-stack-transition-ms) var(--vu-ease-out-fluid);
  }

  :host([layout="stack"][position^="bottom"]) [part="item"] {
    transform-origin: center bottom;
  }

  :host([layout="stack"][position^="top"]) [part="item"] {
    transform-origin: center top;
  }

  :host([layout="stack"][position^="bottom"]) [part="item"] {
    inset-block-end: var(--nt-stack-inset);
  }

  :host([layout="stack"][position^="top"]) [part="item"] {
    inset-block-start: var(--nt-stack-inset);
  }

  :host([layout="stack"]) [part="item"]:not(.is-front):not(.is-expanded) {
    box-shadow: none;
  }

  :host([layout="stack"]) [part="item"].is-hidden,
  :host([layout="stack"]) [part="item"].is-overflow-fading {
    pointer-events: none;
  }

  :host([layout="stack"]) [part="item"].is-front {
    z-index: 3;
  }

  :host([layout="stack"]) [part="item"].is-expanded {
    box-shadow: var(--vu-shadow-overlay);
  }

  :host([layout="stack"]) [part="item"]:not(.is-removing) {
    animation: none;
  }

  @media (hover: hover) {
    :host([layout="list"]) [part="item"]:not(.is-removing):hover {
      box-shadow: var(--vu-shadow-overlay);
    }
  }

  [part="media"] {
    max-inline-size: 100%;
    border-radius: var(--vu-radius-md);
    corner-shape: var(--vu-corner-shape, round);
  }

  [part="row"] {
    display: flex;
    align-items: flex-start;
    gap: var(--vu-space-2-5);
  }

  [part="icon"] {
    flex-shrink: 0;
    font-size: var(--vu-font-size-xl);
    line-height: 1;
    margin-block-start: 1px;
    color: var(--nt-item-accent);
  }

  [part="item"][variant="soft"] [part="icon"],
  [part="item"][variant="solid"] [part="icon"] {
    color: inherit;
  }

  [part="spinner"] {
    flex-shrink: 0;
    margin-block-start: 1px;
  }

  [part="copy"] {
    flex: 1;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    gap: var(--vu-space-half);
    padding-inline-end: var(--vu-space-5);
  }

  [part="title"] {
    font-weight: var(--vu-font-weight-semibold);
    font-size: var(--vu-font-size-sm);
    line-height: var(--vu-line-height-snug);
    display: flex;
    align-items: center;
    gap: var(--vu-space-1-5);
    color: var(--nt-item-fg);
  }

  [part="message"] {
    font-size: var(--vu-font-size-sm);
    font-weight: var(--vu-font-weight-normal);
    line-height: var(--vu-line-height-normal);
    color: var(--nt-item-muted);
  }

  [part="action"] {
    align-self: flex-start;
    margin-block-start: var(--vu-space-1);
  }

  [part="body"] {
    flex: 1;
    min-inline-size: 0;
    padding-inline-end: var(--vu-space-5);
  }

  [part="item"].is-custom {
    gap: var(--vu-space-1);
  }

  [part="count"] {
    background: var(--vu-color-surface);
    border: 1px solid var(--nt-item-edge);
    color: var(--nt-item-accent);
    font-size: var(--vu-font-size-xs);
    font-weight: var(--vu-font-weight-semibold);
    padding: var(--vu-space-half) var(--vu-space-1);
    border-radius: var(--vu-radius-md);
    corner-shape: var(--vu-corner-shape, round);
  }

  [part="close"] {
    position: absolute;
    inset-block-start: var(--vu-space-2);
    inset-inline-end: var(--vu-space-2);
    border-radius: var(--vu-radius-md);
    corner-shape: var(--vu-corner-shape, round);
    display: inline-flex;
    inline-size: var(--nt-close-size);
    block-size: var(--nt-close-size);
    padding: 0;
    align-items: center;
    justify-content: center;
    color: var(--vu-color-muted);
    cursor: pointer;
    background: transparent;
    border: 0;
    transition:
      color var(--vu-duration-fast) var(--vu-ease-out-cubic),
      transform var(--vu-duration-fast) var(--vu-ease-out-cubic);
    z-index: 2;
  }

  @media (hover: hover) {
    [part="close"]:hover {
      color: var(--vu-color-foreground);
    }
  }

  [part="close"]:active {
    transform: scale(0.94);
  }

  [part="close"]:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  :host([layout="list"]) [part="item"].is-removing,
  :host([layout="stack"]) [part="item"].is-removing {
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    [part="item"] {
      transition-duration: var(--vu-duration-instant);
    }

    [part="close"] {
      transition-duration: var(--vu-duration-instant);
    }

    [part="close"]:active {
      transform: none;
    }

    :host([layout="list"]) [part="item"]:not(.is-removing):hover {
      box-shadow: var(--vu-shadow-surface);
    }
  }

  @media (prefers-contrast: more) {
    [part="item"] {
      --nt-item-border: var(--vu-border-width-emphasis) solid var(--nt-item-edge);
    }

    [part="close"] {
      outline: 1px solid transparent;
    }

    [part="close"]:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    [part="panel"] {
      background: var(--vu-color-surface);
    }

    [part="item"] {
      background: var(--nt-item-bg);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }

    :host([layout="stack"]) [part="item"][variant="soft"] {
      --nt-item-bg: color-mix(in oklab, var(--nt-soft) 100%, var(--vu-color-surface));
      --nt-item-border: 1px solid color-mix(in oklab, var(--nt-edge) 24%, var(--vu-color-surface));
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
  }

  @media (forced-colors: active) {
    [part="item"],
    [part="close"] {
      forced-color-adjust: none;
      border: 1px solid CanvasText;
    }

    :host([layout="stack"]) [part="item"][variant="soft"] {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
  }
`;
