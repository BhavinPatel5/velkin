import { css } from "lit";
import {
  surfaceToneChildRelay,
  surfaceToneInteractionHost,
} from "../internals/styles/surface-tone-interaction.css.js";
import {
  glassSurfaceHost,
  glassReducedTransparency,
} from "../internals/styles/glass-surface.css.js";

export const cardStyles = css`
  ${surfaceToneInteractionHost}
  ${surfaceToneChildRelay}
  ${glassSurfaceHost}
  ${glassReducedTransparency}

  :host {

    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    font-family: var(--vu-font-sans);
    color: var(--vu-color-foreground);

    --card-strong-bg: var(--vu-color-surface-tertiary);
    --card-strong-fg: var(--vu-color-surface-tertiary-foreground);
    --card-soft-bg: var(--vu-color-surface-secondary);
    --card-soft-fg: var(--vu-color-surface-secondary-foreground);
    --card-edge: var(--vu-color-border);
    --card-surface-bg: var(--vu-color-surface);
    --card-surface-fg: var(--vu-color-surface-foreground);
    --host-surface-bg: var(--card-surface-bg);

    --card-pad: var(--vu-space-3-5);
    --card-gap: var(--vu-space-2);

    --card-media-size: 33%;

    --card-radius: var(--vu-radius-surface);

    --card-shadow: var(--vu-shadow-surface);
    --card-shadow-hover: var(--vu-shadow-surface);
  }

  :host([tone="subtle"]) {
    --card-surface-bg: var(--vu-color-surface-secondary);
    --card-surface-fg: var(--vu-color-surface-secondary-foreground);
    --host-surface-bg: var(--card-surface-bg);
    --card-soft-bg: var(--vu-color-surface-secondary);
    --card-soft-fg: var(--vu-color-surface-secondary-foreground);
    --card-strong-bg: var(--vu-color-surface-secondary);
    --card-strong-fg: var(--vu-color-surface-secondary-foreground);
  }

  :host([tone="strong"]) {
    --card-surface-bg: var(--vu-color-surface-tertiary);
    --card-surface-fg: var(--vu-color-surface-tertiary-foreground);
    --host-surface-bg: var(--card-surface-bg);
    --card-soft-bg: var(--vu-color-surface-tertiary);
    --card-soft-fg: var(--vu-color-surface-tertiary-foreground);
    --card-strong-bg: var(--vu-color-foreground);
    --card-strong-fg: var(--vu-color-background);
  }

  :host([size="sm"]) {
    --card-pad: var(--vu-space-2-5);
    --card-gap: var(--vu-space-1-5);
  }
  :host([size="md"]) {
    --card-pad: var(--vu-space-3-5);
    --card-gap: var(--vu-space-2);
  }
  :host([size="lg"]) {
    --card-pad: var(--vu-space-5);
    --card-gap: var(--vu-space-3);
  }

  :host([radius="sm"]) { --card-radius: var(--vu-radius-lg); }
  :host([radius="md"]) { --card-radius: var(--vu-radius-surface); }
  :host([radius="lg"]) { --card-radius: min(32px, var(--vu-radius-3xl)); }

  [part="base"] {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    flex: 1 1 auto;
    inline-size: 100%;
    min-block-size: 100%;
    background: color-mix(
      in oklab,
      var(--card-surface-bg) var(--vu-surface-fill, 100%),
      transparent
    );
    color: var(--card-surface-fg);

    border: var(--vu-border-width) solid transparent;
    border-radius: var(--card-radius);
    corner-shape: var(--vu-corner-shape, round);
    overflow: hidden;
    backdrop-filter: var(--vu-surface-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-surface-backdrop-filter);
    transition:
      box-shadow var(--vu-duration-fast) var(--vu-ease-out-cubic),
      transform var(--vu-duration-fast) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-fast) var(--vu-ease-out-cubic),
      background var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }
  :host([orientation="horizontal"]) [part="base"] {
    flex-direction: row;
  }

  [part="content"] {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-inline-size: 0;
    box-sizing: border-box;
    padding: var(--card-pad);
    gap: var(--card-gap);
  }
  [part="content"][hidden] {
    display: none;
  }
  :host:not(:has([slot="header"])):not(:has([slot="footer"])):not(:has(> :not([slot]))) [part="content"] {
    display: none;
  }

  :host([variant="elevated"]) [part="base"] {
    box-shadow: var(--card-shadow);
  }
  :host([variant="outline"]) [part="base"] {
    border-color: var(--card-edge);
  }
  :host([variant="soft"]) [part="base"] {
    background: color-mix(
      in oklab,
      var(--card-soft-bg) var(--vu-surface-fill, 100%),
      transparent
    );
    color: var(--card-soft-fg);
  }
  :host([variant="filled"]) [part="base"] {
    background: color-mix(
      in oklab,
      var(--card-strong-bg) var(--vu-surface-fill, 100%),
      transparent
    );
    color: var(--card-strong-fg);
  }
  :host([variant="ghost"]) [part="base"] {
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  :host([variant="glass"]) {
    --vu-surface-fill: var(--vu-glass-fill);
    --vu-surface-blur: var(--vu-blur-md);
  }

  :host([variant="gradient"]) [part="base"] {
    background:
      linear-gradient(
        135deg,
        var(--card-soft-bg) 0%,
        var(--card-strong-bg) 100%
      );
    background-origin: border-box;
    background-clip: border-box;
    color: var(--card-strong-fg);
    box-shadow: var(--card-shadow);
  }

  [part="media"] {
    display: block;
    position: relative;
    inline-size: 100%;
    overflow: hidden;
  }
  [part="media"][hidden] {
    display: none;
  }
  :host:not(:has([slot="media"])) [part="media"] {
    display: none;
  }

  :host([orientation="horizontal"]) [part="media"] {
    flex: 0 0 auto;
    inline-size: var(--card-media-size, 33%);
    align-self: stretch;
  }

  [part="media"] ::slotted(img),
  [part="media"] ::slotted(video),
  [part="media"] ::slotted(picture),
  [part="media"] ::slotted(svg) {
    display: block;
    inline-size: 100%;
    block-size: auto;
    object-fit: cover;
  }
  :host([orientation="horizontal"]) [part="media"] ::slotted(img),
  :host([orientation="horizontal"]) [part="media"] ::slotted(video),
  :host([orientation="horizontal"]) [part="media"] ::slotted(picture),
  :host([orientation="horizontal"]) [part="media"] ::slotted(svg) {
    block-size: 100%;
  }

  [part="media-actions"] {
    position: absolute;
    inset-block-start: var(--vu-space-2);
    inset-inline-end: var(--vu-space-2);
    display: flex;
    align-items: center;
    gap: var(--vu-space-1);
    z-index: 1;
  }
  [part="media-actions"][hidden] {
    display: none;
  }
  :host:not(:has([slot="media-actions"])) [part="media-actions"] {
    display: none;
  }

  [part="header"] {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--card-gap);
    box-sizing: border-box;
    padding: var(--card-pad-header, 0);
  }
  [part="header"][hidden] {
    display: none;
  }
  :host:not(:has([slot="header"])) [part="header"] {
    display: none;
  }
  [part="body"] {
    display: block;
    flex: 1 1 auto;
    box-sizing: border-box;
    padding: var(--card-pad-body, 0);
  }
  [part="body"][hidden] {
    display: none;
  }
  :host:not(:has(> :not([slot]))) [part="body"] {
    display: none;
  }
  [part="footer"] {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: flex-end;
    gap: var(--card-gap);
    box-sizing: border-box;
    margin-block-start: auto;
    padding: var(--card-pad-footer, 0);
  }
  [part="footer"][hidden] {
    display: none;
  }
  :host:not(:has([slot="footer"])) [part="footer"] {
    display: none;
  }

  :host([flush]) {
    --card-pad: 0;
  }

  /* Gap moves onto section-divider margins so hairlines don't double the spacing. */
  :host([divider="header"]) [part="content"],
  :host([divider="footer"]) [part="content"],
  :host([divider="all"]) [part="content"] {
    gap: 0;
  }

  [part="section-divider"][hidden],
  [part="media-divider"][hidden] {
    display: none !important;
  }

  [part="section-divider"] {
    --divider-color: var(
      --card-divider,
      color-mix(in oklab, currentColor 14%, transparent)
    );
    /* Center the hairline in the former content gap. */
    --divider-margin: calc(var(--card-gap) / 2) 0;
  }

  [part="media-divider"] {
    flex-shrink: 0;
    --divider-color: var(
      --card-divider,
      color-mix(in oklab, currentColor 14%, transparent)
    );
    --divider-margin: 0;
    --divider-length: 100%;
  }

  :host([orientation="horizontal"]) [part="media-divider"] {
    align-self: stretch;
  }

  :host([variant="filled"]),
  :host([variant="soft"]),
  :host([variant="gradient"]) {
    --card-divider: color-mix(in oklab, currentColor 22%, transparent);
  }

  :host([selected]:not([variant="outline"])) [part="base"] {
    border-color: transparent;
    box-shadow:
      0 0 0 var(--vu-border-width-emphasis) var(--vu-color-accent),
      0 0 0 calc(var(--vu-border-width-emphasis) + var(--vu-border-width))
        color-mix(in oklab, var(--vu-color-accent) 35%, transparent);
  }

  :host([selected][variant="outline"]) [part="base"] {
    border-color: var(--vu-color-accent);
    border-width: var(--vu-border-width-emphasis);
    box-shadow: 0 0 0 var(--vu-border-width)
      color-mix(in oklab, var(--vu-color-accent) 35%, transparent);
  }

  :host([selected][variant="filled"]) [part="base"],
  :host([selected][variant="gradient"]) [part="base"] {
    box-shadow:
      0 0 0 var(--vu-border-width)
        color-mix(in oklab, var(--card-edge) 35%, transparent),
      inset 0 0 0 var(--vu-border-width-emphasis)
        color-mix(in oklab, currentColor 35%, transparent);
  }

  :host([interactive]) [part="base"] {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }
  :host([interactive]:not([disabled])) [part="base"]:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring), var(--card-shadow, 0 0 #0000);
  }

  @media (hover: hover) {
    :host([interactive][variant="elevated"]:not([disabled]):not([selected])) [part="base"]:hover {
      box-shadow: var(--card-shadow-hover);
      transform: translateY(-1px);
    }
    :host([interactive][variant="outline"]:not([disabled]):not([selected])) [part="base"]:hover {
      border-color: var(--vu-color-foreground);
    }
    :host([interactive][variant="soft"]:not([disabled]):not([selected])) [part="base"]:hover,
    :host([interactive][variant="filled"]:not([disabled]):not([selected])) [part="base"]:hover {
      filter: brightness(0.97);
    }
    :host([interactive][variant="ghost"]:not([disabled]):not([selected])) [part="base"]:hover {
      background: var(--surface-tone-hover);
    }
    :host([interactive][variant="glass"]:not([disabled]):not([selected])) [part="base"]:hover {
      background: color-mix(in oklab, var(--card-surface-bg) 75%, transparent);
    }
    :host([interactive][variant="gradient"]:not([disabled]):not([selected])) [part="base"]:hover {
      filter: brightness(0.97);
    }

    :host([interactive][selected]:not([disabled]):not([variant="outline"])) [part="base"]:hover {
      filter: brightness(0.98);
    }
    :host([interactive][selected][variant="outline"]:not([disabled])) [part="base"]:hover {
      border-color: var(--vu-color-accent);
    }
  }

  :host([interactive]:not([disabled])) [part="base"]:active {
    transform: translateY(1px);
  }

  :host([interactive][disabled]) [part="base"] {
    cursor: not-allowed;
    opacity: var(--vu-opacity-disabled-control);
  }

  @media (prefers-reduced-motion: reduce) {
    [part="base"] {
      transition: none;
    }
    :host([interactive]) [part="base"]:hover,
    :host([interactive]) [part="base"]:active {
      transform: none;
    }
  }

  @media (prefers-reduced-transparency: reduce) {

    :host([variant="glass"]) {
      --vu-surface-fill: 100%;
      --vu-surface-blur: var(--vu-blur-none);
    }
    :host([variant="glass"]) [part="base"] {
      background: var(--vu-color-surface);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    :host([interactive][disabled]) [part="base"] {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  @media (prefers-contrast: more) {
    :host([variant="outline"]) [part="base"] {
      border-width: var(--vu-border-width-emphasis);
    }
    :host([interactive]:not([disabled])) [part="base"]:focus-visible {
      box-shadow: none;
      outline: var(--vu-border-width-emphasis) solid currentColor;
      outline-offset: var(--vu-space-half);
    }
    :host([selected]) [part="base"] {
      box-shadow: 0 0 0 calc(var(--vu-border-width-emphasis) * 2) var(--vu-color-accent);
    }
  }

  @media (forced-colors: active) {

    [part="base"] {
      border: var(--vu-border-width-emphasis, 2px) solid CanvasText;
      background: Canvas;
      color: CanvasText;
      box-shadow: none;
      backdrop-filter: none;
    }
    :host([variant="gradient"]) [part="base"] {
      background: Canvas;
    }
    :host([interactive]:not([disabled])) [part="base"]:focus-visible {
      outline: var(--vu-border-width-emphasis, 2px) solid CanvasText;
      outline-offset: var(--vu-space-half, 2px);
      box-shadow: none;
    }
    :host([interactive][disabled]) [part="base"] {
      color: GrayText;
      border-color: GrayText;
    }

    :host([selected]) [part="base"] {
      border-color: Highlight;
      box-shadow: inset 0 0 0 var(--vu-border-width-emphasis, 2px) Highlight;
      forced-color-adjust: none;
    }
  }
`;
