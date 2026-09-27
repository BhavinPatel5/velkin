import { css } from "lit";

export const tabItemStyles = css`
  :host {
    display: inline-flex;
    vertical-align: top;
    font-family: var(--vu-font-sans);
  }

  .btn {
    position: relative;
    z-index: 1;
    appearance: none;
    border: 0;
    background: transparent;
    border-radius: var(--tab-segment-radius, var(--vu-control-radius-sm));
    corner-shape: var(--vu-corner-shape, round);
    font: inherit;
    font-weight: var(--vu-font-weight-medium, 500);
    color: var(--vu-color-foreground, currentColor);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--vu-space-1-5);
    transition: color var(--tab-anim-ms, var(--vu-duration-normal)) var(--tab-anim-ease, var(--vu-ease-out-cubic));
    outline: none;
    padding: var(--item-pad, var(--vu-space-1-5) var(--vu-space-2-5));
    min-width: var(--item-min-w, var(--vu-space-9));
    min-height: var(--item-min-h, 26px);
    box-sizing: border-box;
  }

  @media (hover: hover) {
    .btn:hover:not(:disabled):not([aria-disabled="true"]) {
      color: color-mix(in oklab, var(--vu-color-foreground) 88%, var(--tab-thumb-bg) 12%);
    }
  }

  .btn:active:not(:disabled):not([aria-disabled="true"]) {
    transform: scale(0.98);
  }

  .btn[aria-checked="true"] {
    color: var(--tab-active-fg, currentColor);
  }

  .btn[aria-checked="true"]:hover:not(:disabled):not([aria-disabled="true"]) {
    color: var(--tab-active-fg, currentColor);
  }

  .btn:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  .btn[disabled],
  .btn[aria-disabled="true"] {
    cursor: not-allowed;
    opacity: var(--vu-opacity-disabled-control);
  }

  vu-icon {
    display: inline-block;
    width: 1em;
    height: 1em;
  }

  [part="icon"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  [part="icon"][hidden] {
    display: none;
  }

  :host:not(:has([slot="icon"])) [part="icon"]:not(.has-fallback) {
    display: none;
  }

  .label {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    opacity: 1;
    max-width: none;
  }

  .label[hidden] {
    display: none;
  }

  :host:not(:has(> :not([slot="icon"]))) [part="label"]:not(.has-text) {
    display: none;
  }

  :host([labelcollapsed]) .label {
    opacity: 0;
    max-width: 0;
  }

  :host-context(vu-tab[icononly]:not([stretch])) .btn {
    aspect-ratio: 1;
    padding: 0;
    min-width: var(--item-min-h, 26px);
    width: var(--item-min-h, 26px);
    height: var(--item-min-h, 26px);
  }

  :host-context(vu-tab[icononly]) .label {
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

  :host-context(vu-tab[radius="full"]) .btn {
    corner-shape: round;
  }

  :host-context(vu-tab[orientation="vertical"]) {
    display: block;
    width: 100%;
  }

  :host-context(vu-tab[orientation="vertical"]) .btn {
    width: 100%;
    justify-content: flex-start;
  }

  :host-context(vu-tab[stretch][orientation="horizontal"]) {
    display: block;
    width: 100%;
    min-width: 0;
  }

  :host-context(vu-tab[stretch][orientation="horizontal"]) .btn {
    width: 100%;
  }

  :host-context(vu-tab[orientation="vertical"])[labelcollapsed] .label {
    max-width: none;
    max-height: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .btn {
      transition-duration: var(--vu-duration-instant, 0ms);
    }

    .btn:active:not(:disabled):not([aria-disabled="true"]) {
      transform: none;
    }
  }

  @media (prefers-contrast: more) {
    .btn:focus-visible {
      outline: var(--vu-border-width-emphasis) solid currentColor;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }
  }

  @media (forced-colors: active) {
    .btn:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }
  }
`;
