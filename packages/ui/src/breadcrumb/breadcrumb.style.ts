import { css } from "lit";
import { overlaySurfaceGuard } from "../internals/styles/overlay-surface-guard.css.js";
import {
  menuOverlayCohesionHost,
  menuOverlayCohesionSize,
} from "../internals/styles/menu-overlay-cohesion.css.js";
import {
  menuPanelItemCorners,
  menuPanelRadiusTokens,
} from "../internals/styles/menu-panel-radius.css.js";

export const breadcrumbStyles = css`
  ${overlaySurfaceGuard}

  :host {
    display: block;
    min-inline-size: 0;
    color: var(--vu-color-foreground);
    ${menuOverlayCohesionHost}
    --bc-overflow-pad: var(--menu-overlay-pad);
    --bc-overflow-radius: var(--menu-overlay-radius);
    --menu-panel-radius: var(--bc-overflow-radius);
    --menu-panel-pad: var(--bc-overflow-pad);
    /* Ellipsis hit target — tracks size so it aligns with crumb link height. */
    --bc-ellipsis-size: calc(var(--vu-spacing) * 6);
    ${menuPanelRadiusTokens}
  }

  ${menuOverlayCohesionSize}

  :host([disabled]) {
    pointer-events: none;
    opacity: var(--vu-opacity-disabled-control);
  }
  /* Avoid stacking with link/ellipsis opacity under the host dim. */
  :host([disabled]) [part="ellipsis-button"] {
    opacity: 1;
  }

  [part="base"] {
    display: block;
    min-inline-size: 0;
  }

  /* The flex container — flex-wrap lets long trails wrap onto subsequent lines
     instead of overflowing horizontally. 'order' on slotted items powers the
     ellipsis-in-the-middle layout. */
  [part="list"] {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--breadcrumb-item-gap, calc(var(--vu-spacing) * 1.5));
    list-style: none;
    margin: 0;
    padding: 0;
    min-inline-size: 0;
  }

  :host([size="sm"]) {
    --breadcrumb-item-gap: var(--vu-spacing);
    --bc-ellipsis-size: calc(var(--vu-spacing) * 5);
    --breadcrumb-size-icon: 1em;
    font-size: var(--vu-font-size-xs);
  }

  :host([size="md"]) {
    font-size: var(--vu-font-size-sm);
  }

  :host([size="lg"]) {
    --breadcrumb-item-gap: calc(var(--vu-spacing) * 2);
    --bc-ellipsis-size: calc(var(--vu-spacing) * 7);
    font-size: var(--vu-font-size-md);
  }

  ::slotted(vu-breadcrumb-item) {
    /* The 'order' value is set inline by the parent when collapsing. */
    min-inline-size: 0;
  }

  /* Hidden collapsed items — UA stylesheet handles 'display: none' via [hidden],
     but we add a defensive override since '::slotted([hidden])' is a frequent
     specificity trap (see "?hidden and the specificity trap" rule). */
  ::slotted(vu-breadcrumb-item[hidden]) {
    display: none !important;
  }

  /* The ellipsis trigger — only rendered when items are actively collapsed.
     Sized to match a breadcrumb item visually so it sits on the same baseline. */
  [part="ellipsis"] {
    display: inline-flex;
    align-items: center;
    gap: var(--breadcrumb-item-gap, calc(var(--vu-spacing) * 1.5));
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
    color: inherit;
    font: inherit;
    cursor: pointer;
    list-style: none;
  }
  /* Defeats the [hidden] vs. [part] specificity tie if 'hidden' is ever reintroduced on this node. */
  [part="ellipsis"][hidden] {
    display: none !important;
  }

  [part="ellipsis-separator"] {
    display: inline-flex;
    align-items: center;
    color: var(--vu-color-foreground);
    opacity: 0.45;
    user-select: none;
  }
  [part="ellipsis-separator"]::before {
    content: var(--breadcrumb-separator, "/");
  }

  [part="ellipsis-button"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--bc-ellipsis-size);
    block-size: var(--bc-ellipsis-size);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--vu-color-foreground);
    border-radius: var(--vu-radius-sm);
    corner-shape: var(--vu-corner-shape, round);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    opacity: 0.65;
    transition:
      background var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      opacity var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }
  @media (hover: hover) {
    [part="ellipsis-button"]:hover {
      background: var(--surface-tone-hover, var(--vu-color-surface-hover));
      opacity: 1;
    }
  }
  [part="ellipsis-button"]:active {
    background: var(--surface-tone-active, var(--vu-color-surface-active));
    opacity: 1;
  }
  [part="ellipsis-button"]:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
    opacity: 1;
  }
  [part="ellipsis-button"][hidden] {
    display: none;
  }

  /* Size-preset forwarding — children read forwarded font-size from the host. */
  /* (sm/md/lg font-size + gap + ellipsis size set above with the size selectors.) */

  @media (prefers-reduced-motion: reduce) {
    [part="ellipsis-button"],
    [part="overflow-item"],
    [part="overflow-expand"] {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    [part="ellipsis-separator"],
    ::slotted(vu-breadcrumb-item) {
      opacity: 1;
    }
    [part="ellipsis-button"]:focus-visible,
    [part="overflow-item"]:focus-visible,
    [part="overflow-expand"]:focus-visible {
      box-shadow: none;
      outline: var(--vu-border-width-emphasis) solid currentColor;
      outline-offset: var(--vu-space-half);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
    [part="overflow-menu"] {
      background: var(--vu-color-surface);
    }
  }

  /* Overflow dropdown — borderless overlay with elevation shadow. */
  [part="overflow-menu"] {
    position: fixed;
    left: var(--vu-bc-left, var(--vu-spacing));
    top: var(--vu-bc-top, var(--vu-spacing));
    width: var(--vu-bc-width, max-content);
    min-inline-size: min(100vw, calc(var(--vu-spacing) * 44));
    max-block-size: calc(var(--vu-spacing) * 35);
    overflow-x: hidden;
    overflow-y: auto;
    margin: 0;
    padding: var(--bc-overflow-pad);
    background: var(--menu-overlay-bg);
    color: var(--menu-overlay-fg);
    border: 0;
    border-radius: var(--bc-overflow-radius);
    corner-shape: var(--vu-corner-shape, round);
    box-shadow: var(--menu-overlay-shadow);
    backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
    -webkit-backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
    font-family: var(--vu-font-sans);
    font-size: var(--menu-overlay-row-font-size);
  }

  [part="overflow-item"] {
    display: block;
    inline-size: 100%;
    box-sizing: border-box;
    text-align: start;
    min-block-size: var(--menu-overlay-row-min-block-size);
    padding-block: var(--menu-overlay-row-pad-block);
    padding-inline: var(--menu-overlay-row-pad-inline);
    margin: 0;
    border: none;
    ${menuPanelItemCorners}
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: var(--vu-font-weight-medium);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition:
      background var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  @media (hover: hover) {
    [part="overflow-item"]:hover:not(:disabled) {
      background: var(--menu-overlay-hover);
    }
  }
  [part="overflow-item"]:active:not(:disabled) {
    background: var(--menu-overlay-hover);
  }
  [part="overflow-item"]:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }
  [part="overflow-item"]:disabled {
    cursor: not-allowed;
    opacity: var(--vu-opacity-disabled-control);
  }

  [part="overflow-divider"] {
    --divider-margin: calc(var(--vu-spacing) * 0.75) 0;
    --divider-inset: 3%;
  }

  [part="overflow-expand"] {
    display: block;
    inline-size: 100%;
    box-sizing: border-box;
    text-align: start;
    padding-block: calc(var(--vu-spacing) * 1);
    padding-inline: calc(var(--vu-spacing) * 1.5);
    margin: 0;
    margin-block-start: calc(var(--vu-spacing) * 0.25);
    border: none;
    ${menuPanelItemCorners}
    background: transparent;
    color: var(--vu-color-accent);
    font: inherit;
    font-size: var(--vu-font-size-xs);
    font-weight: var(--vu-font-weight-semibold);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: background var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }
  @media (hover: hover) {
    [part="overflow-expand"]:hover {
      background: var(--menu-overlay-hover);
    }
  }
  [part="overflow-expand"]:active {
    background: var(--menu-overlay-hover);
  }
  [part="overflow-expand"]:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  @media (forced-colors: active) {
    [part="ellipsis-button"]:focus-visible,
    [part="overflow-item"]:focus-visible,
    [part="overflow-expand"]:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }
  }
`;
