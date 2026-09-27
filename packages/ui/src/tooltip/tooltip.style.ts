import { css } from "lit";
import { overlaySurfaceGuard } from "../internals/styles/overlay-surface-guard.css.js";
import {
  glassOverlayHost,
  glassReducedTransparency,
} from "../internals/styles/glass-surface.css.js";

export const tooltipStyles = css`
  ${overlaySurfaceGuard}
  ${glassOverlayHost}
  ${glassReducedTransparency}

  :host {
    display: inline-block;
    position: relative;
    font-family: var(--vu-font-sans);
    -webkit-tap-highlight-color: transparent;

    --tooltip-panel-bg: var(--vu-color-overlay);
    --tooltip-panel-fg: var(--vu-color-overlay-foreground);
    --tooltip-border-color: transparent;
    --tooltip-shadow: var(--vu-shadow-overlay);
    --tooltip-drop-shadow: 0 var(--vu-space-1) var(--vu-space-3)
      color-mix(in oklab, var(--vu-color-overlay-foreground) 16%, transparent);
    --tooltip-radius: min(24px, var(--vu-radius-2xl));
    --tooltip-pad-block: var(--vu-space-1);
    --tooltip-pad-inline: var(--vu-space-2);
    --tooltip-font-size: var(--vu-font-size-xs);
    --tooltip-max-width: 300px;
    --tooltip-arrow-box: var(--vu-space-2);
    --tooltip-arrow-inset: var(--vu-border-width);
    --tooltip-arrow-edge-pad: var(--vu-space-4);
    --tooltip-left: 0px;
    --tooltip-top: 0px;
    --tooltip-width: max-content;
  }

  :host([block]) {
    display: block;
    inline-size: 100%;
  }

  :host([tone="subtle"]) {
    --tooltip-panel-bg: var(--vu-color-surface-secondary);
    --tooltip-panel-fg: var(--vu-color-surface-secondary-foreground);
  }

  :host([tone="normal"]) {
    --tooltip-panel-bg: var(--vu-color-overlay);
    --tooltip-panel-fg: var(--vu-color-overlay-foreground);
  }

  :host([tone="strong"]) {
    --tooltip-panel-bg: var(--vu-color-surface-tertiary);
    --tooltip-panel-fg: var(--vu-color-surface-tertiary-foreground);
  }

  :host([size="sm"]) {
    --tooltip-pad-block: var(--vu-space-half);
    --tooltip-pad-inline: var(--vu-space-1-5);
    --tooltip-font-size: var(--vu-font-size-2xs, var(--vu-font-size-xs));
    --tooltip-arrow-box: var(--vu-space-1-5);
  }

  :host([size="lg"]) {
    --tooltip-pad-block: var(--vu-space-1-5);
    --tooltip-pad-inline: var(--vu-space-2-5);
    --tooltip-font-size: var(--vu-font-size-sm);
    --tooltip-arrow-box: var(--vu-space-2-5);
  }

  :host([radius="sm"]) {
    --tooltip-radius: var(--vu-radius-lg);
  }

  :host([radius="md"]) {
    --tooltip-radius: min(24px, var(--vu-radius-2xl));
  }

  :host([radius="lg"]) {
    --tooltip-radius: min(28px, var(--vu-radius-2xl));
  }

  :host([variant="elevated"]) {
    --tooltip-shadow: var(--vu-shadow-overlay);
  }

  :host([variant="soft"]) {
    --tooltip-panel-bg: var(--vu-color-surface-secondary);
    --tooltip-panel-fg: var(--vu-color-surface-secondary-foreground);
    --tooltip-shadow: none;
    --tooltip-drop-shadow: none;
  }

  :host([variant="outline"]) {
    --tooltip-shadow: none;
    --tooltip-drop-shadow: none;
    /* Outline uses border (not separator) so the stroke reads on the panel. */
    --tooltip-border-color: var(--vu-color-border);
  }

  [part="trigger"] {
    display: inline-flex;
    max-inline-size: 100%;
  }

  :host([block]) [part="trigger"] {
    display: block;
    inline-size: 100%;
  }

  [part="surface"] {
    position: fixed;
    z-index: var(--vu-z-tooltip);
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    overflow: visible;
    pointer-events: none;
    left: var(--tooltip-left);
    top: var(--tooltip-top);
    width: var(--tooltip-width);
    transition: none;
  }

  :host([interactive]) [part="surface"]:popover-open {
    pointer-events: auto;
  }

  [part="content"] {
    position: relative;
    box-sizing: border-box;
    background: color-mix(
      in oklab,
      var(--tooltip-panel-bg) var(--vu-overlay-fill, 100%),
      transparent
    );
    color: var(--tooltip-panel-fg);
    border: var(--vu-border-width) solid var(--tooltip-border-color);
    box-shadow: var(--tooltip-shadow);
    backdrop-filter: var(--vu-overlay-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-overlay-backdrop-filter);
    padding: var(--tooltip-pad-block) var(--tooltip-pad-inline);
    border-radius: var(--tooltip-radius);
    corner-shape: var(--vu-corner-shape, round);
    font-size: var(--tooltip-font-size);
    line-height: var(--vu-line-height-snug, 1.35);
    inline-size: max-content;
    max-inline-size: var(--tooltip-max-width);
    word-wrap: break-word;
    overflow: visible;
  }

  /* drop-shadow follows the bubble + rotated arrow as one silhouette */
  :host([arrow][variant="elevated"]) [part="content"] {
    box-shadow: none;
    filter: drop-shadow(var(--tooltip-drop-shadow));
  }

  [part="content"]::before {
    content: "";
    position: absolute;
    box-sizing: border-box;
    inline-size: var(--tooltip-arrow-box);
    block-size: var(--tooltip-arrow-box);
    background: color-mix(
      in oklab,
      var(--tooltip-panel-bg) var(--vu-overlay-fill, 100%),
      transparent
    );
    border: var(--vu-border-width) solid var(--tooltip-border-color);
    pointer-events: none;
    z-index: -1;
  }

  :host(:not([arrow])) [part="content"]::before {
    display: none;
  }

  [part="surface"][data-side="top"] [part="content"]::before {
    bottom: calc((var(--tooltip-arrow-box) / -2) + var(--tooltip-arrow-inset));
    left: calc(var(--tooltip-arrow-offset) - (var(--tooltip-arrow-box) / 2));
    transform: rotate(45deg);
    border-top: none;
    border-left: none;
  }

  [part="surface"][data-side="bottom"] [part="content"]::before {
    top: calc((var(--tooltip-arrow-box) / -2) + var(--tooltip-arrow-inset));
    left: calc(var(--tooltip-arrow-offset) - (var(--tooltip-arrow-box) / 2));
    transform: rotate(45deg);
    border-bottom: none;
    border-right: none;
  }

  [part="surface"][data-side="left"] [part="content"]::before {
    right: calc((var(--tooltip-arrow-box) / -2) + var(--tooltip-arrow-inset));
    top: calc(var(--tooltip-arrow-offset) - (var(--tooltip-arrow-box) / 2));
    transform: rotate(45deg);
    border-top: none;
    border-right: none;
  }

  [part="surface"][data-side="right"] [part="content"]::before {
    left: calc((var(--tooltip-arrow-box) / -2) + var(--tooltip-arrow-inset));
    top: calc(var(--tooltip-arrow-offset) - (var(--tooltip-arrow-box) / 2));
    transform: rotate(45deg);
    border-bottom: none;
    border-left: none;
  }

  @media (prefers-contrast: more) {
    [part="content"] {
      border-width: var(--vu-border-width-emphasis);
      border-color: var(--vu-color-border);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    [part="content"],
    [part="content"]::before {
      background: var(--tooltip-panel-bg);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      filter: none;
    }
  }

  @media (forced-colors: active) {
    [part="content"] {
      forced-color-adjust: none;
      border-color: CanvasText;
      background: Canvas;
      color: CanvasText;
      filter: none;
      box-shadow: none;
    }

    [part="content"]::before {
      display: none;
    }
  }
`;
