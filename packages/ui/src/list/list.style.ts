import { css } from "lit";
import { surfaceToneInteractionHost } from "../internals/styles/surface-tone-interaction.css.js";
import {
  glassSurfaceHost,
  glassReducedTransparency,
} from "../internals/styles/glass-surface.css.js";

export const listStyles = css`
  ${surfaceToneInteractionHost}
  ${glassSurfaceHost}
  ${glassReducedTransparency}

  :host {
    display: block;
    width: 100%;
    font-family: var(--vu-font-sans);
    color: var(--vu-color-foreground);
    box-sizing: border-box;
  }

  [part="base"] {
    display: block;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
    border: var(--vu-border-width) solid var(--vu-color-border);
    border-radius: var(--vu-radius-md);
    corner-shape: var(--vu-corner-shape, round);
    overflow: hidden;
    background: color-mix(
      in oklab,
      var(--list-surface-bg, var(--host-surface-bg, var(--vu-color-surface)))
        var(--vu-surface-fill, 100%),
      transparent
    );
    color: var(--vu-color-surface-foreground);
    backdrop-filter: var(--vu-surface-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-surface-backdrop-filter);
  }

  [part="base"]:focus-visible {
    outline: var(--vu-border-width-emphasis) solid var(--vu-color-focus);
    outline-offset: var(--vu-space-half);
  }

  ::slotted(vu-listitem[data-subheader]:first-child) [part="subheader"] {
    border-start-start-radius: var(--vu-radius-md);
    border-start-end-radius: var(--vu-radius-md);
  }

  @media (prefers-contrast: more) {
    [part="base"] {
      border-width: var(--vu-border-width-emphasis);
    }

    [part="base"]:focus-visible {
      outline-width: calc(var(--vu-border-width-emphasis) * 2);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    [part="base"] {
      background: var(--list-surface-bg, var(--host-surface-bg, var(--vu-color-surface)));
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
  }

  @media (forced-colors: active) {
    [part="base"] {
      forced-color-adjust: none;
      border: var(--vu-border-width-emphasis) solid CanvasText;
      background: Canvas;
      color: CanvasText;
    }

    [part="base"]:focus-visible {
      outline: var(--vu-border-width-emphasis) solid Highlight;
      outline-offset: var(--vu-space-half);
    }
  }
`;
