import { css } from "lit";
import {
  surfaceToneChildRelay,
  surfaceToneInteractionHost,
} from "../internals/styles/surface-tone-interaction.css.js";
import {
  glassSurfaceHost,
  glassReducedTransparency,
} from "../internals/styles/glass-surface.css.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const accordionStyles = css`
  ${surfaceToneInteractionHost}
  ${surfaceToneChildRelay}
  ${glassSurfaceHost}
  ${glassReducedTransparency}
  ${controlSizeMetricsTokens}

  :host {
    display: block;
    width: 100%;
    box-sizing: border-box;
    font-family: var(--vu-font-sans);
    --acc-surface-bg: var(--vu-color-surface);
    --acc-surface-fg: var(--vu-color-surface-foreground);
    --host-surface-bg: var(--acc-surface-bg);
    color: var(--acc-surface-fg);

    --acc-header-pad-block: var(--vu-space-3);
    --acc-header-pad-inline: var(--vu-space-4);
    --acc-header-gap: var(--vu-space-3);
    --acc-title-font-size: var(--vu-csm-field-font-size);
    --acc-subtitle-font-size: var(--vu-csm-chrome-font-size);
    --acc-icon-size: var(--vu-csm-action-icon-size);
    /* Asymmetric body pad — start tight under header, end matches prior block pad. */
    --acc-body-pad-block-start: var(--vu-space-1);
    --acc-body-pad-block-end: var(--vu-space-3);
    --acc-body-pad-inline: var(--vu-space-4);
    --acc-body-font-size: var(--vu-csm-field-font-size);
  }

  :host([size="sm"]) {
    --acc-header-pad-block: var(--vu-space-2);
    --acc-header-pad-inline: var(--vu-space-3);
    --acc-header-gap: var(--vu-space-2);
    --acc-body-pad-block-start: var(--vu-space-half);
    --acc-body-pad-block-end: var(--vu-space-2);
    --acc-body-pad-inline: var(--vu-space-3);
  }

  :host([size="lg"]) {
    --acc-header-pad-block: var(--vu-space-4);
    --acc-header-pad-inline: var(--vu-space-5);
    --acc-header-gap: var(--vu-space-4);
    --acc-body-pad-block-start: var(--vu-space-2);
    --acc-body-pad-block-end: var(--vu-space-4);
    --acc-body-pad-inline: var(--vu-space-5);
    /* Body stays md at lg — denser copy than the title scale. */
    --acc-body-font-size: var(--vu-font-size-md);
  }

  :host([tone="subtle"]) {
    --acc-surface-bg: var(--vu-color-surface-secondary);
    --acc-surface-fg: var(--vu-color-surface-secondary-foreground);
    --host-surface-bg: var(--acc-surface-bg);
  }

  :host([tone="strong"]) {
    --acc-surface-bg: var(--vu-color-surface-tertiary);
    --acc-surface-fg: var(--vu-color-surface-tertiary-foreground);
    --host-surface-bg: var(--acc-surface-bg);
  }

  ::slotted(vu-accordion-item) {
    --acc-item-hover: var(--surface-tone-hover);
    --acc-item-active: var(--surface-tone-active);
  }

  :host([disabled]) {
    opacity: var(--vu-opacity-disabled-control);
    cursor: var(--vu-cursor-disabled);
    pointer-events: none;
  }

  [part="group"] {
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
    background: transparent;
    transition: background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host([variant="light"])
    ::slotted(vu-accordion-item:not(:last-child)) {
    border-block-end: var(--vu-border-light);
  }

  :host([variant="solid"]) [part="group"] {
    background: color-mix(
      in oklab,
      var(--acc-surface-bg) var(--vu-surface-fill, 100%),
      transparent
    );
    color: var(--acc-surface-fg);
    border: var(--vu-border-width) solid transparent;
    border-radius: var(--vu-radius-md);
    corner-shape: var(--vu-corner-shape, round);
    box-shadow: var(--vu-shadow-surface);
    backdrop-filter: var(--vu-surface-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-surface-backdrop-filter);
    overflow: hidden;
  }
  :host([variant="solid"])
    ::slotted(vu-accordion-item:not(:last-child)) {
    border-block-end: var(--vu-border-light);
  }

  :host([variant="outline"]) [part="group"] {
    background: transparent;
    border: var(--vu-border-primary);
    border-radius: var(--vu-radius-md);
    corner-shape: var(--vu-corner-shape, round);
    overflow: hidden;
  }
  :host([variant="outline"])
    ::slotted(vu-accordion-item:not(:last-child)) {
    border-block-end: var(--vu-border-light);
  }

  :host([variant="split"]) [part="group"],
  :host([variant="splitted"]) [part="group"] {
    gap: var(--vu-space-2);
    background: transparent;
  }
  :host([variant="split"]) ::slotted(vu-accordion-item),
  :host([variant="splitted"]) ::slotted(vu-accordion-item) {
    background: color-mix(
      in oklab,
      var(--acc-surface-bg) var(--vu-surface-fill, 100%),
      transparent
    );
    color: var(--acc-surface-fg);
    border-radius: var(--vu-radius-md);
    corner-shape: var(--vu-corner-shape, round);
    box-shadow: var(--vu-shadow-surface);
    backdrop-filter: var(--vu-surface-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-surface-backdrop-filter);
    overflow: hidden;
  }

  :host([flush]) ::slotted(vu-accordion-item:not(:last-child)) {
    border-block-end: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    [part="group"] {
      transition: none;
    }
  }

  @media (prefers-contrast: more) {
    :host([variant="outline"]) [part="group"] {
      border-width: var(--vu-border-width-emphasis);
    }
    :host([variant="light"]) ::slotted(vu-accordion-item:not(:last-child)),
    :host([variant="solid"]) ::slotted(vu-accordion-item:not(:last-child)),
    :host([variant="outline"]) ::slotted(vu-accordion-item:not(:last-child)) {
      border-block-end-width: var(--vu-border-width-emphasis);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([variant="solid"]) [part="group"],
    :host([variant="split"]) ::slotted(vu-accordion-item),
    :host([variant="splitted"]) ::slotted(vu-accordion-item) {
      background: var(--acc-surface-bg);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    :host([disabled]) {
      opacity: 1;
    }
  }

  @media (forced-colors: active) {
    :host([variant="outline"]) [part="group"] {
      border: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }
    :host([variant="solid"]) [part="group"] {
      box-shadow: none;
      border: var(--vu-border-width-emphasis) solid CanvasText;
    }
    :host([variant="split"]) ::slotted(vu-accordion-item),
    :host([variant="splitted"]) ::slotted(vu-accordion-item) {
      box-shadow: none;
      border: var(--vu-border-width-emphasis) solid CanvasText;
    }
    ::slotted(vu-accordion-item:not(:last-child)) {
      border-block-end-color: CanvasText;
    }
  }
`;
