import { css } from "lit";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const adaptiveItemStyles = css`
  ${controlSizeMetricsTokens}

  :host {
    display: inline-flex;
    max-inline-size: 100%;
    box-sizing: border-box;
    color: inherit;
    font-family: var(--vu-font-sans);
    line-height: var(--vu-line-height-snug);

    /* Shell is a measure wrapper — slotted content owns its own hit padding. */
    --adaptive-item-gap: var(--vu-csm-action-gap);
    --adaptive-item-py: 0px;
    --adaptive-item-px: 0px;
    --adaptive-item-font-size: var(--vu-csm-action-font-size);
    --adaptive-item-min-block-size: var(--vu-csm-action-min-block-size);
    --adaptive-item-radius: var(--vu-radius-md);
  }

  :host([disabled]) {
    opacity: var(--vu-opacity-disabled-control);
    pointer-events: none;
    cursor: var(--vu-cursor-disabled);
  }

  .item-container {
    display: inline-flex;
    align-items: center;
    gap: var(--adaptive-item-gap);
    inline-size: auto;
    max-inline-size: 100%;
    min-block-size: var(--adaptive-item-min-block-size);
    padding-block: var(--adaptive-item-py);
    padding-inline: var(--adaptive-item-px);
    box-sizing: border-box;
    font-size: var(--adaptive-item-font-size);
    border-radius: var(--adaptive-item-radius);
    corner-shape: var(--vu-corner-shape, round);
    transition: background-color var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  :host([inoverflow]) {
    display: block;
    inline-size: 100%;
  }

  :host([inoverflow]) .item-container {
    inline-size: 100%;
    justify-content: flex-start;
    padding-block: var(--menu-overlay-row-pad-block, var(--vu-space-1-5));
    padding-inline: var(--menu-overlay-row-pad-inline, var(--vu-space-2-5));
    font-size: var(--menu-overlay-row-font-size, var(--vu-font-size-sm));
    min-block-size: var(--menu-overlay-row-min-block-size, var(--vu-space-8));
    border-radius: var(--menu-item-radius, var(--vu-radius-sm));
    corner-shape: var(--vu-corner-shape, round);
  }

  /* :host(:hover) — slotted light-DOM content never matches .item-container:hover alone. */
  @media (hover: hover) {
    :host(:not([inoverflow]):not([disabled]):hover) .item-container {
      background: var(--surface-tone-hover, var(--vu-color-surface-hover));
    }
    :host([inoverflow]:not([disabled]):hover) .item-container {
      background: var(--menu-overlay-hover, var(--vu-color-overlay-hover));
    }
  }

  ::slotted(*) {
    min-inline-size: 0;
  }

  ::slotted(vu-button),
  ::slotted(vu-chip),
  ::slotted(vu-badge) {
    flex-shrink: 0;
  }

  :host([dir="rtl"]) .item-container {
    flex-direction: row-reverse;
  }

  @media (prefers-reduced-motion: reduce) {
    .item-container {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
    }
  }

  @media (prefers-contrast: more) {
    :host([inoverflow]:not([disabled]):hover) .item-container {
      background: var(--vu-color-overlay-hover);
    }
  }

  @media (forced-colors: active) {
    :host([inoverflow]:not([disabled]):hover) .item-container {
      background: Highlight;
      color: HighlightText;
    }
  }
`;
