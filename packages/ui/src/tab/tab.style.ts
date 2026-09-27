import { css } from "lit";
import { segmentTrackRadiusTokens } from "../internals/styles/segment-track-radius.css.js";

export const tabStyles = css`
  :host {
    display: inline-block;
    font-family: var(--vu-font-sans);
    --tab-gap: 0;
    --tab-anim-ms: var(--vu-duration-normal, 200ms);
    --tab-anim-ease: var(--vu-ease-out-cubic, cubic-bezier(0.215, 0.61, 0.355, 1));
    --tab-thumb-bg: var(--vu-color-accent);
    --tab-active-fg: var(--vu-color-accent);
    --tab-radius: var(--vu-radius-full);
    --tab-bg: var(--vu-color-surface-secondary);
    --tab-pad: var(--vu-space-half);
    --tab-shadow: var(--vu-shadow-field);
    --segment-radius: var(--tab-radius);
    --segment-track-pad: var(--tab-pad);
    ${segmentTrackRadiusTokens}
    --tab-track-radius: var(--segment-track-radius);
    --tab-segment-radius: var(--segment-item-radius);
    --font-size: var(--vu-font-size-xs);
    --item-pad: var(--vu-space-1-5) var(--vu-space-2-5);
    --item-min-w: var(--vu-control-height-sm);
    --item-min-h: calc(var(--vu-control-height-sm) - var(--vu-space-1-5));
  }

  :host([size="xs"]) {
    --font-size: var(--vu-font-size-xs);
    --item-pad: var(--vu-space-1) var(--vu-space-2);
    --item-min-w: var(--vu-space-7);

    --item-min-h: var(--vu-space-6);
  }

  :host([radius="none"]) {
    --tab-radius: 0;
    --tab-track-radius: 0;
    --tab-segment-radius: 0;
  }

  :host([radius="sm"]) {
    --tab-radius: var(--vu-control-radius-sm);
  }
  :host([radius="md"]) {
    --tab-radius: var(--vu-control-radius-md);
  }
  :host([radius="lg"]) {
    --tab-radius: var(--vu-control-radius-lg);
  }
  :host([radius="full"]) {
    --tab-radius: var(--vu-radius-full);
    --tab-track-radius: var(--vu-radius-full);
    --tab-segment-radius: var(--vu-radius-full);
  }

  /* Vertical stacks are tall/narrow — full outer pill caps look oversized vs inner thumb. */
  :host([radius="full"][orientation="vertical"]) {
    --tab-track-radius: var(--vu-control-radius-lg);
    --tab-segment-radius: var(--vu-radius-full);
  }

  :host([size="sm"]) {
    --font-size: var(--vu-font-size-xs);
    --item-pad: var(--vu-space-1-5) var(--vu-space-2-5);
    --item-min-w: var(--vu-control-height-sm);
    --item-min-h: calc(var(--vu-control-height-sm) - var(--vu-space-1-5));
  }

  :host([size="md"]) {
    --font-size: var(--vu-font-size-sm);
    --item-pad: var(--vu-space-2) var(--vu-space-3-5);
    --item-min-w: var(--vu-control-height-md);
    --item-min-h: var(--vu-control-height-sm);
  }

  :host([size="lg"]) {
    --font-size: var(--vu-font-size-sm);
    --item-pad: var(--vu-space-2-5) var(--vu-space-4);
    --item-min-w: var(--vu-control-height-lg);
    --item-min-h: var(--vu-control-height-lg);
  }

  :host([size="xl"]) {
    --font-size: var(--vu-font-size-base);
    --item-pad: var(--vu-space-3) var(--vu-space-5);
    --item-min-w: var(--vu-chrome-height-sm);
    --item-min-h: var(--vu-control-height-md);
  }

  .wrap {
    position: relative;
    display: inline-flex;
    align-items: stretch;
    box-sizing: border-box;
    gap: var(--tab-gap);
    padding: var(--tab-pad);
    border-radius: var(--tab-track-radius);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--tab-bg);
    box-shadow: var(--tab-shadow);
    --tab-indicator-x: 0;
    --tab-indicator-y: 0;
    --tab-indicator-w: var(--vu-space-0);
    --tab-indicator-h: var(--vu-space-0);
    --tab-indicator-opacity: 0;
  }

  :host([radius="full"]) .wrap,
  :host([radius="full"]) .indicator {
    corner-shape: round;
  }

  :host([orientation="vertical"]) .wrap {
    flex-direction: column;
    width: max-content;
    min-width: var(--item-min-w);
  }

  :host([orientation="vertical"]) .btn {
    width: 100%;
    justify-content: flex-start;
  }

  :host([orientation="vertical"]) ::slotted(vu-tab-item) {
    width: 100%;
  }

  :host([stretch]) {
    display: block;
    width: 100%;
  }

  :host([stretch]) .wrap {
    display: flex;
    width: 100%;
  }

  :host([stretch][orientation="vertical"]) .wrap {
    min-width: 0;
  }

  :host([stretch][orientation="horizontal"]) .btn {
    flex: 1 1 0;
    min-width: 0;
    width: 100%;
  }

  :host([stretch][orientation="horizontal"]) ::slotted(vu-tab-item) {
    flex: 1 1 0;
    min-width: 0;
    width: 100%;
  }

  ::slotted(vu-tab-item) {
    flex: 0 0 auto;
    box-sizing: border-box;
  }

  slot[hidden] {
    display: none;
  }

  .indicator {
    position: absolute;
    border-radius: var(--tab-segment-radius);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--tab-thumb-bg);
    pointer-events: none;
    z-index: 0;
    width: var(--tab-indicator-w);
    height: var(--tab-indicator-h);
    transform: translate(var(--tab-indicator-x), var(--tab-indicator-y));
    opacity: var(--tab-indicator-opacity);
    transition: none;
  }

  .btn {
    position: relative;
    z-index: 1;
    appearance: none;
    border: 0;
    background: transparent;
    border-radius: var(--tab-segment-radius);
    corner-shape: var(--vu-corner-shape, round);
    box-sizing: border-box;
    font: inherit;
    font-weight: var(--vu-font-weight-medium, 500);
    color: var(--vu-color-foreground, currentColor);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--vu-space-1-5);
    transition: color var(--tab-anim-ms) var(--tab-anim-ease);
    outline: none;
    padding: var(--item-pad);
    min-width: var(--item-min-w);
    min-height: var(--item-min-h);
  }

  :host([icononly]:not([stretch])) .btn {
    aspect-ratio: 1;
    padding: 0;
    min-width: var(--item-min-h);
    width: var(--item-min-h);
    height: var(--item-min-h);
  }

  :host([icononly]) .label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (hover: hover) {
    .btn:hover:not(:disabled):not([aria-disabled="true"]) {
      color: color-mix(in oklab, var(--vu-color-foreground) 88%, var(--tab-thumb-bg) 12%);
    }

    .btn[aria-checked="true"]:hover:not(:disabled):not([aria-disabled="true"]) {
      color: var(--tab-active-fg, currentColor);
    }
  }

  .btn:active:not(:disabled):not([aria-disabled="true"]) {
    transform: scale(0.98);
  }

  .btn[aria-checked="true"] {
    color: var(--tab-active-fg, currentColor);
  }

  .btn:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  .btn[disabled] {
    cursor: not-allowed;
    opacity: var(--vu-opacity-disabled-control);
  }

  :host([disabled]) .btn {
    cursor: not-allowed;
    opacity: var(--vu-opacity-disabled-control);
  }

  :host([disabled]) .wrap {
    opacity: 0.8;
  }

  vu-icon {
    display: inline-block;
    width: 1em;
    height: 1em;
  }

  .label {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    opacity: 1;
    max-width: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .btn {
      transition-duration: var(--vu-duration-instant);
    }

    .btn:active:not(:disabled):not([aria-disabled="true"]) {
      transform: none;
    }
  }

  .label[data-hidden="true"] {
    opacity: 0;
    max-width: 0;
  }

  :host([orientation="vertical"]) .label[data-hidden="true"] {
    max-width: none;
    max-height: 0;
  }

  @media (prefers-contrast: more) {
    .wrap {
      box-shadow: none;
      border: var(--vu-border-width-emphasis) solid var(--vu-color-border);
    }

    .btn:focus-visible {
      outline: var(--vu-border-width-emphasis) solid currentColor;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    .wrap {
      background: var(--vu-color-surface-secondary);
      box-shadow: none;
    }

    .btn[disabled],
    :host([disabled]) .btn {
      opacity: 1;
      filter: grayscale(1);
    }

    :host([disabled]) .wrap {
      opacity: 1;
    }
  }

  @media (forced-colors: active) {
    .wrap {
      background: Canvas;
      box-shadow: none;
      border: var(--vu-border-width-emphasis) solid CanvasText;
    }

    .btn:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }
  }
`;
