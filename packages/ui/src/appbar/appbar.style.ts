import { css } from "lit";
import { surfaceToneInteractionHost } from "../internals/styles/surface-tone-interaction.css.js";
import {
  glassSurfaceHost,
  glassReducedTransparency,
} from "../internals/styles/glass-surface.css.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const appbarStyles = css`
  ${surfaceToneInteractionHost}
  ${glassSurfaceHost}
  ${glassReducedTransparency}
  ${controlSizeMetricsTokens}

  :host {
    display: block;
    width: 100%;
    box-sizing: border-box;
    font-family: var(--vu-font-sans);

    --appbar-bg: var(--vu-color-surface);
    --appbar-fg: var(--vu-color-surface-foreground);
    --host-surface-bg: var(--appbar-bg);

    --appbar-border: var(--vu-border-width) solid transparent;
    --appbar-shadow: none;

    --appbar-py: var(--vu-space-2);
    --appbar-px: var(--vu-space-4);
    --appbar-gap: var(--vu-space-3);
    --appbar-min-block-size: var(--vu-csm-chrome-min-block-size);
    /* Recommended hit target for slotted icon actions — consumers / demos opt in. */
    --appbar-control-size: var(--vu-csm-action-min-block-size);
    --appbar-control-icon-size: var(--vu-csm-action-icon-size);

    color: var(--appbar-fg);
  }

  :host([sticky]:not([placement="bottom"])) {
    position: sticky;
    inset-block-start: var(--appbar-offset-top, 0);
    z-index: var(--vu-z-sticky);
  }
  :host([sticky][placement="bottom"]) {
    position: sticky;
    inset-block-end: var(--appbar-offset-bottom, 0);
    z-index: var(--vu-z-sticky);
  }

  :host([tone="subtle"]) {
    --appbar-bg: var(--vu-color-surface-secondary);
    --appbar-fg: var(--vu-color-surface-secondary-foreground);
    --host-surface-bg: var(--appbar-bg);
  }

  :host([tone="strong"]) {
    --appbar-bg: var(--vu-color-surface-tertiary);
    --appbar-fg: var(--vu-color-surface-tertiary-foreground);
    --host-surface-bg: var(--appbar-bg);
  }

  :host([variant="outline"]) {
    --appbar-border: var(--vu-border-width) solid var(--vu-color-border);
  }
  :host([variant="elevated"]) {
    --appbar-shadow: var(--vu-shadow-surface);
  }

  :host([size="sm"]) {
    --appbar-py: var(--vu-space-1);
    --appbar-px: var(--vu-space-3);
    --appbar-gap: var(--vu-space-2);
  }
  :host([size="lg"]) {
    --appbar-py: var(--vu-space-3);
    --appbar-px: var(--vu-space-5);
    --appbar-gap: var(--vu-space-4);
  }

  [part="bar"] {
    box-sizing: border-box;
    inline-size: 100%;
    background: color-mix(
      in oklab,
      var(--appbar-bg) var(--vu-surface-fill, 100%),
      transparent
    );
    color: inherit;
    border-block-end: var(--appbar-border);
    box-shadow: var(--appbar-shadow);
    backdrop-filter: var(--vu-surface-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-surface-backdrop-filter);
    opacity: 1;
    transform: none;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic),
      transform var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host([placement="bottom"]) [part="bar"] {
    border-block-end: 0 solid transparent;
    border-block-start: var(--appbar-border);
  }

  [part="container"] {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: var(--appbar-gap);
    box-sizing: border-box;
    inline-size: 100%;
    max-inline-size: var(--appbar-content-max-inline-size, none);
    margin-inline: auto;
    min-block-size: var(--appbar-min-block-size);
    padding-block: var(--appbar-py);
    padding-inline:
      max(var(--appbar-px), env(safe-area-inset-left, 0px))
      max(var(--appbar-px), env(safe-area-inset-right, 0px));
  }

  :host([sticky]:not([placement="bottom"])) [part="container"] {
    padding-block-start: max(var(--appbar-py), env(safe-area-inset-top, 0px));
  }
  :host([sticky][placement="bottom"]) [part="container"] {
    padding-block-end: max(var(--appbar-py), env(safe-area-inset-bottom, 0px));
  }

  [part="start"],
  [part="end"] {
    display: inline-flex;
    align-items: center;
    gap: var(--appbar-gap);
    flex-shrink: 0;
    min-inline-size: 0;
  }
  [part="start"][hidden],
  [part="end"][hidden] {
    display: none;
  }
  [part="body"] {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    gap: var(--appbar-gap);
    min-inline-size: 0;
  }
  [part="body"][hidden] {
    display: none;
  }

  :host:not(:has([slot="start"])) [part="start"] {
    display: none;
  }
  :host:not(:has(> :not([slot]))) [part="body"] {
    display: none;
  }
  :host:not(:has([slot="end"])) [part="end"] {
    display: none;
  }

  :host([condense][sticky]) [part="bar"].is-stuck {
    --appbar-shadow: var(--vu-shadow-surface);
    --appbar-border: var(--vu-border-width) solid transparent;
  }

  :host([autohide]:not([placement="bottom"])) [part="bar"].is-hidden {
    transform: translateY(-100%);
  }
  :host([autohide][placement="bottom"]) [part="bar"].is-hidden {
    transform: translateY(100%);
  }

  /* Direct slotted controls only — ::slotted cannot reach nested wrappers. Prefer vu-button for focus chrome. */
  ::slotted(button),
  ::slotted([role="button"]),
  ::slotted(a) {
    color: inherit;
  }
  ::slotted(button:focus-visible),
  ::slotted([role="button"]:focus-visible),
  ::slotted(a:focus-visible) {
    outline: none;
    box-shadow: var(--vu-focus-ring);
    border-radius: var(--vu-radius-md);
    corner-shape: var(--vu-corner-shape, round);
  }

  @media (prefers-reduced-motion: reduce) {
    [part="bar"] {
      transition-duration: var(--vu-duration-instant);
    }
    :host([autohide]) [part="bar"].is-hidden {
      transform: none;
      opacity: 0;
      pointer-events: none;
    }
  }

  @media (prefers-contrast: more) {
    :host([variant="outline"]) [part="bar"] {
      border-block-end-width: var(--vu-border-width-emphasis);
    }
    :host([variant="outline"][placement="bottom"]) [part="bar"] {
      border-block-start-width: var(--vu-border-width-emphasis);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    [part="bar"]:not(.is-hidden) {
      background: var(--appbar-bg);
      opacity: 1;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
  }

  @media (forced-colors: active) {
    [part="bar"] {
      border-block-end: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }
    :host([placement="bottom"]) [part="bar"] {
      border-block-end: 0 solid transparent;
      border-block-start: var(--vu-border-width-emphasis) solid CanvasText;
    }
    :host([variant="elevated"]) [part="bar"],
    :host([condense][sticky]) [part="bar"].is-stuck {
      box-shadow: none;
    }
    ::slotted(button:focus-visible),
    ::slotted([role="button"]:focus-visible),
    ::slotted(a:focus-visible) {
      box-shadow: none;
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
    }
  }
`;
