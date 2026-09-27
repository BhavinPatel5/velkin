import { css } from "lit";
import {
  stepsVerticalPanelBorderStyles,
  stepsVerticalPanelStyles,
  stepsVerticalRailStyles,
} from "./steps.vertical.style.js";

export const stepsSharedStyles = css`
  .node {
    position: relative;
    box-sizing: border-box;
    display: inline-grid;
    place-items: center;
    width: var(--steps-node-size, var(--vu-space-6));
    height: var(--steps-node-size, var(--vu-space-6));
    border: var(--steps-node-border, var(--vu-border-width-emphasis)) solid var(--vu-color-muted);
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    font-weight: var(--vu-font-weight-semibold, 600);
    line-height: var(--vu-line-height-none, 1);
    font-size: var(--steps-node-fs, var(--vu-font-size-sm));
    background: var(--vu-color-surface);
    transition:
      border-color var(--steps-anim-ms, var(--vu-duration-normal)) var(--steps-anim-ease, var(--vu-ease-out-cubic)),
      background-color var(--steps-anim-ms, var(--vu-duration-normal)) var(--steps-anim-ease, var(--vu-ease-out-cubic)),
      color var(--steps-anim-ms, var(--vu-duration-normal)) var(--steps-anim-ease, var(--vu-ease-out-cubic));
    flex: 0 0 auto;
  }

  .node.completed {
    border-color: var(--vu-color-accent);
    color: var(--vu-color-on-accent);
    background: var(--vu-color-accent);
  }

  .node.process {
    border-color: var(--vu-color-accent);
    color: var(--vu-color-accent);
  }

  .node.error {
    border-color: var(--vu-color-danger);
    color: var(--vu-color-danger);
    background: color-mix(in oklab, var(--vu-color-danger) 12%, var(--vu-color-surface));
  }

  .node.wait {
    border-color: var(--vu-color-muted);
    color: var(--vu-color-muted);
  }

  .node .error-icon {
    display: none;
  }

  .node.show-error-icon .error-icon {
    display: inline-grid;
  }

  .icon {
    display: inline-grid;
    place-items: center;
    width: var(--steps-icon-size, var(--vu-space-4));
    height: var(--steps-icon-size, var(--vu-space-4));
    line-height: var(--vu-line-height-none);
  }

  vu-icon {
    display: inline-block;
    width: 1em;
    height: 1em;
  }

  .node .number,
  .node .bullet,
  .node .regular-icon,
  .node .checked-icon {
    display: none;
  }

  .node.show-number .number,
  .node.show-bullet .bullet,
  .node.show-regular-icon .regular-icon,
  .node.show-checked-icon .checked-icon {
    display: inline-grid;
  }

  .labels {
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
  }

  .label {
    font-size: var(--steps-label-fs, var(--vu-font-size-sm));
    font-weight: var(--vu-font-weight-semibold, 600);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sub {
    font-size: var(--steps-sub-fs, var(--vu-font-size-xs));
    color: var(--vu-color-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .optional {
    font-size: var(--steps-sub-fs, var(--vu-font-size-xs));
    color: var(--vu-color-muted);
    font-weight: var(--vu-font-weight-normal, 400);
  }

  .labels-below {
    align-items: center;
    text-align: center;
  }

  .step-btn-below {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--vu-space-1-5);
  }

  .step-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--vu-space-2-5);
    padding: var(--vu-space-half) var(--vu-space-1);
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    width: max-content;
    text-align: start;
    font: inherit;
    transition:
      opacity var(--steps-anim-ms, var(--vu-duration-normal)) var(--steps-anim-ease, var(--vu-ease-out-cubic)),
      transform var(--steps-anim-ms, var(--vu-duration-fast, var(--vu-duration-fast))) var(--steps-anim-ease, var(--vu-ease-out-cubic));
  }

  @media (hover: hover) {
    .step-btn:hover:not([aria-disabled="true"]):not([aria-current="step"]) {
      opacity: 0.88;
    }
  }

  .step-btn:active:not([aria-disabled="true"]) {
    transform: translateY(1px);
  }

  .step-btn[aria-disabled="true"] {
    cursor: not-allowed;
    opacity: var(--vu-opacity-disabled-control);
  }

  .step-btn[aria-current="step"] .node {
    border-color: var(--vu-color-accent);
    color: var(--vu-color-accent);
  }

  .step-btn:focus-visible .node {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  @media (forced-colors: active) {
    .step-btn:focus-visible .node {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }
  }

  .connector {
    position: relative;
    background: var(--vu-color-muted);
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    flex: 1 1 var(--vu-space-6);
    height: var(--vu-space-half);
    min-inline-size: var(--vu-space-6);
    margin-block-start: var(--steps-connector-margin-block, 0);
  }

  .connector::after {
    content: "";
    position: absolute;
    inset: 0;
    transform-origin: inline-start;
    transform: scaleX(0);
    background: var(--vu-color-accent);
    border-radius: inherit;
    corner-shape: var(--vu-corner-shape, round);
    transition: transform var(--steps-anim-ms, var(--vu-duration-normal))
      var(--steps-anim-ease, var(--vu-ease-out-cubic));
  }

  .connector.active::after {
    transform: scaleX(1);
  }

  @media (prefers-reduced-motion: reduce) {
    .connector::after,
    .step-btn {
      transition-duration: var(--vu-duration-instant);
    }

    .step-btn:active:not([aria-disabled="true"]) {
      transform: none;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    .step-btn[aria-disabled="true"] {
      opacity: 1;
      filter: grayscale(1);
    }
  }
`;

export const stepsStyles = css`
  :host {
    display: block;
    width: 100%;
    color: var(--vu-color-foreground);
    font-family: var(--vu-font-sans);
    user-select: none;
    --steps-node-size: var(--vu-space-6);
    --steps-node-fs: var(--vu-font-size-sm);
    --steps-icon-size: var(--vu-space-4);
    --steps-node-border: var(--vu-border-width-emphasis);
    --steps-dot-size: var(--vu-space-2);
    --steps-label-fs: var(--vu-font-size-sm);
    --steps-sub-fs: var(--vu-font-size-xs);
    --steps-anim-ms: var(--vu-duration-normal);
    --steps-anim-ease: var(--vu-ease-out-cubic);
    --steps-node-center: calc(var(--vu-space-1) + var(--steps-node-size) / 2);
    --steps-rail-width: var(--vu-space-half);
    --steps-rail-gap: var(--vu-space-1);
    --steps-rail-inset: calc(var(--steps-node-center) - var(--steps-rail-width) / 2);
    --steps-rail-top: calc(var(--vu-space-half) + var(--steps-node-size) + var(--steps-rail-gap));
    --steps-content-inset: var(--steps-rail-inset);
    --steps-connector-margin-block: 0;
  }

  :host([labelplacement="below"]) {
    --steps-connector-margin-block: calc(
      var(--vu-space-half) + var(--steps-node-size) / 2 - var(--vu-space-half) / 2
    );
  }

  ${stepsSharedStyles}

  .h-wrap {
    position: relative;
    overflow-x: auto;
    padding: var(--vu-space-3) 0;
  }

  .h-steps slot[hidden],
  .v-list slot[hidden],
  .steps-nav[hidden],
  .panels-host[hidden] {
    display: none;
  }

  .h-steps {
    display: flex;
    align-items: center;
    gap: var(--vu-space-3);
    min-inline-size: 0;
    width: 100%;
  }

  :host([labelplacement="below"]) .h-steps {
    align-items: flex-start;
  }

  :host([layout="vertical"]) .v-list {
    position: relative;
    overflow: visible;
  }

  :host([layout="vertical"]) .v-item {
    position: relative;
    overflow: visible;
    margin-bottom: var(--vu-space-3);
  }

  :host([layout="vertical"]) .v-header {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: var(--vu-space-3);
  }

  :host([layout="vertical"]) .step-btn {
    align-items: flex-start;
  }

  :host([layout="vertical"]) .v-item:last-child {
    margin-bottom: 0;
  }

  :host([layout="vertical"]) {
    ${stepsVerticalPanelStyles}
    ${stepsVerticalPanelBorderStyles(".v-item")}
    ${stepsVerticalRailStyles(".v-item")}
  }

  :host([layout="horizontal"]) .panels {
    position: relative;
  }

  :host([layout="horizontal"]) .panel {
    display: none;
    position: static;
    opacity: 0;
    width: 100%;
  }

  :host([layout="horizontal"]) .panel.is-active {
    display: block;
    position: static;
    opacity: 1;
    z-index: 1;
  }

  :host([layout="horizontal"]) .panel.is-leaving {
    display: block;
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  @keyframes steps-slide-in-right {
    from {
      transform: translateX(var(--vu-space-3));
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes steps-slide-out-left {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(calc(-1 * var(--vu-space-3)));
      opacity: 0;
    }
  }

  @keyframes steps-slide-in-left {
    from {
      transform: translateX(calc(-1 * var(--vu-space-3)));
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes steps-slide-out-right {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(var(--vu-space-3));
      opacity: 0;
    }
  }

  :host([layout="horizontal"]) .panels--fwd .panel.is-active {
    animation: steps-slide-in-right var(--steps-anim-ms) var(--steps-anim-ease) both;
  }

  :host([layout="horizontal"]) .panels--fwd .panel.is-leaving {
    animation: steps-slide-out-left var(--steps-anim-ms) var(--steps-anim-ease) both;
  }

  :host([layout="horizontal"]) .panels--back .panel.is-active {
    animation: steps-slide-in-left var(--steps-anim-ms) var(--steps-anim-ease) both;
  }

  :host([layout="horizontal"]) .panels--back .panel.is-leaving {
    animation: steps-slide-out-right var(--steps-anim-ms) var(--steps-anim-ease) both;
  }

  @media (prefers-reduced-motion: reduce) {
    :host([layout="vertical"]) .v-panel,
    :host([layout="horizontal"]) .panel {
      transition-duration: var(--vu-duration-instant);
      animation: none !important;
    }

    .dot-btn {
      transition-duration: var(--vu-duration-instant);
    }

    .dot-btn:active:not(:disabled):not([aria-disabled="true"]),
    .dot-btn[aria-current="step"] {
      transform: none;
    }
  }

  @media (forced-colors: active) {
    .dot-btn:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
    }
  }

  @media (prefers-contrast: more) {
    .dot-btn {
      outline: var(--vu-border-width) solid transparent;
    }

    .dot-btn[aria-current="step"] {
      outline-color: var(--vu-color-accent);
    }
  }

  :host([compact]) .h-steps {
    gap: var(--vu-space-2);
  }

  :host([compact]) .connector {
    flex-basis: var(--vu-space-4);
  }

  :host([layout="horizontal"]) .panel-content > :not(style) {
    display: block;
    box-sizing: border-box;
  }

  .panel-content {
    padding: var(--vu-space-3) 0;
  }

  :host([layout="horizontal"]) ::slotted(vu-step-item) {
    flex: 1 1 auto;
    min-inline-size: 0;
  }

  :host([layout="horizontal"]) ::slotted(vu-step-item:last-of-type) {
    flex: 0 0 auto;
  }

  :host([size="sm"]) {
    --steps-node-size: var(--vu-space-5);
    --steps-node-fs: var(--vu-font-size-xs);
    --steps-icon-size: var(--vu-space-3);
    --steps-node-border: var(--vu-border-width);
    --steps-dot-size: var(--vu-space-1-5);
    --steps-label-fs: var(--vu-font-size-xs);
    --steps-sub-fs: var(--vu-font-size-xs);
  }

  :host([size="md"]) {
    --steps-node-size: var(--vu-space-6);
    --steps-node-fs: var(--vu-font-size-sm);
    --steps-icon-size: var(--vu-space-4);
    --steps-node-border: var(--vu-border-width-emphasis);
    --steps-dot-size: var(--vu-space-2);
    --steps-label-fs: var(--vu-font-size-sm);
    --steps-sub-fs: var(--vu-font-size-xs);
  }

  :host([size="lg"]) {
    --steps-node-size: var(--vu-control-height-sm);
    --steps-node-fs: var(--vu-font-size-md);
    --steps-icon-size: var(--vu-space-5);
    --steps-node-border: var(--vu-space-0-75);
    --steps-dot-size: var(--vu-space-2-5);
    --steps-label-fs: var(--vu-font-size-md);
    --steps-sub-fs: var(--vu-font-size-sm);
  }

  :host([readonly]) .step-btn,
  :host([readonly]) .dot-btn {
    cursor: default;
    pointer-events: none;
  }

  .steps-nav {
    border: 0;
    padding: 0;
    margin: 0;
    min-inline-size: 0;
  }

  .dots-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--vu-space-2);
    padding: var(--vu-space-2) 0;
  }

  .dot-btn {
    appearance: none;
    border: 0;
    padding: 0;
    width: var(--steps-dot-size, var(--vu-space-2));
    height: var(--steps-dot-size, var(--vu-space-2));
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--vu-color-muted);
    cursor: pointer;
    transition:
      background-color var(--steps-anim-ms) var(--steps-anim-ease),
      transform var(--steps-anim-ms) var(--vu-duration-fast) var(--steps-anim-ease);
  }

  @media (hover: hover) {
    .dot-btn:hover:not(:disabled):not([aria-disabled="true"]):not([aria-current="step"]) {
      background: color-mix(in oklab, var(--vu-color-muted) 70%, var(--vu-color-accent));
    }
    .dot-btn[aria-current="step"]:hover:not(:disabled):not([aria-disabled="true"]) {
      background: color-mix(in oklab, var(--vu-color-accent) 88%, black);
    }
  }

  .dot-btn:focus-visible {
    outline: var(--vu-space-0-75) solid color-mix(in oklch, var(--vu-color-accent) 35%, transparent);
    outline-offset: var(--vu-space-half);
  }

  .dot-btn:active:not(:disabled):not([aria-disabled="true"]) {
    transform: scale(1.1);
  }

  .dot-btn[aria-current="step"] {
    background: var(--vu-color-accent);
    transform: scale(1.25);
  }

  .dots-caption {
    text-align: center;
    font-size: var(--steps-label-fs, var(--vu-font-size-sm));
    color: var(--vu-color-muted);
    margin-bottom: var(--vu-space-2);
  }

  .progress-nav {
    padding: var(--vu-space-2) 0 var(--vu-space-3);
  }

  .progress-track {
    height: var(--vu-space-1);
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--vu-color-muted);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: inherit;
    corner-shape: var(--vu-corner-shape, round);
    background: var(--vu-color-accent);
    transition: width var(--steps-anim-ms) var(--steps-anim-ease);
  }

  .progress-caption {
    margin-top: var(--vu-space-2);
    font-size: var(--steps-label-fs, var(--vu-font-size-sm));
    color: var(--vu-color-muted);
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .progress-fill {
      transition-duration: var(--vu-duration-instant);
    }
  }
`;
