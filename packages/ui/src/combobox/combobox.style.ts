import { css } from "lit";
import { fieldChromeVariantStyles } from "../internals/form/field-chrome.style.js";
import { fieldValidationStyles } from "../internals/form/field-validation.style.js";
import { fieldToneSoftHost } from "../internals/styles/field-tone-soft.css.js";
import { overlaySurfaceGuard } from "../internals/styles/overlay-surface-guard.css.js";
import {
  menuOverlayCohesionHost,
  menuOverlayCohesionSize,
  menuOverlayCohesionTone,
} from "../internals/styles/menu-overlay-cohesion.css.js";
import {
  menuPanelInnerClip,
  menuPanelItemCorners,
  menuPanelRadiusTokens,
} from "../internals/styles/menu-panel-radius.css.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const comboboxStyles = css`
  ${overlaySurfaceGuard}
  ${fieldValidationStyles}
  ${fieldChromeVariantStyles}
  ${fieldToneSoftHost}
  ${controlSizeMetricsTokens}

    :host {
    display: inline-block;
    box-sizing: border-box;
      font-family: var(--vu-font-sans);
    line-height: var(--vu-line-height-none);
    -webkit-tap-highlight-color: transparent;

    --cbx-soft: var(--fc-soft);
    --cbx-soft-fg: var(--fc-soft-fg);
    --cbx-soft-hover: var(--fc-soft-hover);

    --cbx-py: var(--vu-csm-field-py);
    --cbx-px: var(--vu-csm-field-px);
    --cbx-min-block-size: var(--vu-csm-field-min-block-size);
    --cbx-font-size: var(--vu-csm-field-font-size);
    --cbx-icon-size: var(--vu-csm-field-icon-size);
    --cbx-field-gap: var(--vu-csm-field-gap);
    --cbx-input-min-inline: 5.5rem;

    ${menuOverlayCohesionHost}
    --cbx-dropdown-pad: var(--menu-overlay-pad);
    --menu-panel-radius: var(--menu-overlay-radius);
    --menu-panel-pad: var(--cbx-dropdown-pad);
    ${menuPanelRadiusTokens}

    --cbx-bg: var(--fc-bg);
    --cbx-fg: var(--fc-fg);
    --cbx-border: var(--fc-border);
    --cbx-shadow: var(--fc-shadow);
    --cbx-radius: var(--fc-radius);
    --cbx-muted: var(--vu-color-muted);
    --cbx-accent: var(--vu-color-accent);
    }

    :host([disabled]) {
    opacity: var(--vu-opacity-disabled-control);
      pointer-events: none;
  }

  :host([block]) {
    display: block;
    inline-size: 100%;
  }

  ${menuOverlayCohesionTone}
  ${menuOverlayCohesionSize}

  :host([radius="none"]) {
    --cbx-radius: 0;
    --fc-radius: 0;
  }

  :host([radius="sm"]) {
    --cbx-radius: var(--vu-control-radius-sm);
  }
  :host([radius="md"]) {
    --cbx-radius: var(--vu-control-radius-md);
  }
  :host([radius="lg"]) {
    --cbx-radius: var(--vu-control-radius-lg);
  }
  :host([radius="full"]) {
    --cbx-radius: var(--vu-radius-full);
  }

  :host([variant="underline"]) {
    --cbx-radius: 0;
    --fc-radius: 0;
  }

  :host {
    --vu-combobox-panel-max-height: 200px;
    --vu-combobox-z-index: 11;
  }

  .combobox-field {
      display: flex;
      flex-direction: column;
    align-items: stretch;
    gap: var(--cbx-field-gap);
    font-size: var(--cbx-font-size);
    line-height: var(--vu-line-height-snug);
    inline-size: 100%;
  }

  .combobox-label {
    display: block;
    color: var(--vu-color-foreground);
    font-weight: var(--vu-font-weight-medium);
    font-size: inherit;
    cursor: default;
  }

  .combobox-label[aria-hidden="true"] {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .combobox-control-row {
    display: inline-flex;
    align-items: stretch;
    inline-size: fit-content;
    max-inline-size: 100%;
  }

  :host([block]) .combobox-control-row {
      display: flex;
    inline-size: 100%;
  }

  :host([block]) .container {
    flex: 1 1 auto;
    inline-size: 100%;
  }

  .combobox-affix {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    color: var(--vu-color-muted);
    font-size: var(--cbx-font-size);
    font-weight: var(--vu-font-weight-normal);
    user-select: none;
  }

  .combobox-affix[hidden] {
    display: none;
  }

  :host:not(:has([slot="start"])) [part="start"] {
    display: none;
  }

  :host:not(:has([slot="end"])) [part="end"] {
    display: none;
  }

  .container {
    position: relative;
      display: flex;
      align-items: center;
    gap: var(--vu-space-1-25);
      box-sizing: border-box;
    min-block-size: var(--cbx-min-block-size);
    padding-block: var(--cbx-py);
    padding-inline: var(--cbx-px);
    border-radius: var(--cbx-radius);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--cbx-bg);
    color: var(--cbx-fg);
    border: var(--cbx-border);
    box-shadow: var(--cbx-shadow);
    inline-size: fit-content;
    max-inline-size: 100%;
    min-inline-size: 0;
    cursor: pointer;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  .container[open]:not(:focus-within:has(:focus-visible)) {
    border-color: var(--fc-interaction-color);
  }

  :host([readonly]) .container {
    cursor: default;
  }

  vu-icon {
    display: inline-block;
    inline-size: 1em;
    block-size: 1em;
    font-size: var(--cbx-icon-size);
    color: currentColor;
  }

  .placeholder-label {
    flex: 1 1 auto;
    min-inline-size: 0;
    color: var(--cbx-muted);
    font-size: var(--cbx-font-size);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  }

  .value-area {
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--vu-space-1-25);
    min-inline-size: 0;
  }

  .field-input {
    flex: 1 1 var(--cbx-input-min-inline);
    min-inline-size: var(--cbx-input-min-inline);
    margin: 0;
    padding: 0;
    border: 0;
    outline: none;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: var(--cbx-font-size);
    line-height: var(--vu-line-height-snug);
  }

  .field-input::placeholder {
    color: var(--cbx-muted);
  }

  .field-input:disabled {
    cursor: not-allowed;
  }

  :host([block]) .field-input {
    min-inline-size: var(--cbx-input-min-inline);
    }

    .chip-container {
      display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--vu-space-1-25);
    flex: 0 1 auto;
    min-inline-size: 0;
  }

  .chip-container--static {
    flex: 1 1 auto;
    }

    .chip {
    display: inline-flex;
    align-items: center;
    gap: var(--vu-space-1);
    padding: var(--vu-space-0-75) var(--vu-space-1-5);
      border-radius: var(--vu-radius-sm);
      corner-shape: var(--vu-corner-shape, round);
    background: var(--cbx-soft);
    color: var(--cbx-soft-fg);
    font-size: calc(var(--cbx-font-size) * 0.92);
  }

  .new-option-btn {
    flex: 0 0 auto;
    display: inline-flex;
      align-items: center;
    justify-content: center;
    inline-size: 1.5rem;
    block-size: 1.5rem;
    border-radius: var(--vu-radius-sm);
    corner-shape: var(--vu-corner-shape, round);
    cursor: pointer;
    background: transparent;
    color: var(--vu-color-accent);
  }

  @media (hover: hover) {
    .new-option-btn:hover {
      background: var(--surface-tone-hover);
    }

    .chip .remove-chip:hover {
      color: var(--vu-color-danger);
    }

    .clear-button:hover {
      color: var(--vu-color-danger);
    }
  }

  .chip[single-select] {
    background: transparent;
    padding: 0;
    font-size: var(--cbx-font-size);
    color: var(--cbx-fg);
  }

  .chip .remove-chip {
    flex: 0 0 auto;
    cursor: pointer;
    color: var(--cbx-muted);
  }

  .clear-button,
  .dropdown-button {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    background: transparent;
    color: var(--cbx-muted);
    cursor: pointer;
    padding: 0;
  }

  .dropdown-button {
    color: var(--cbx-fg);
  }

  .loading-indicator {
    flex: 0 0 auto;
    display: inline-block;
    inline-size: var(--vu-space-4);
    block-size: var(--vu-space-4);
    border: var(--vu-space-half) solid var(--surface-tone-hover);
    border-top-color: var(--cbx-accent);
    border-radius: 50%;
    animation: cbx-spin var(--vu-duration-spin) linear infinite;
  }

  @keyframes cbx-spin {
    to {
      transform: rotate(360deg);
    }
    }

    .dropdown {
      position: fixed;
      padding: var(--cbx-dropdown-pad);
      background: var(--menu-overlay-bg);
      color: var(--menu-overlay-fg);
      border-radius: var(--menu-overlay-radius);
      corner-shape: var(--vu-corner-shape, round);
      box-shadow: var(--menu-overlay-shadow);
      backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
      -webkit-backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
      box-sizing: border-box;
      border: 0;
      pointer-events: auto;
      margin: 0;
      overflow: hidden;
    }

    .dropdown-scroller {
      display: flex;
      flex-direction: column;
      gap: var(--vu-space-half);
      max-height: var(--vu-combobox-panel-max-height, 200px);
      overflow-y: auto;
      ${menuPanelInnerClip}
    }

    .dropdown-scroller [data-virtualize-content] {
      flex: 0 0 auto;
      box-sizing: border-box;
      min-width: 0;
      width: 100%;
    }

    .dropdown-scroller [data-virtualize-content] .dropdown-item {
      inline-size: 100%;
      max-inline-size: 100%;
      box-sizing: border-box;
    }

    [part="select-all"] {
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--menu-overlay-bg);
    }

  .dropdown-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--vu-space-2);
    padding: var(--vu-space-4) var(--vu-space-2-5);
    color: var(--cbx-muted);
    font-size: var(--menu-overlay-row-font-size, var(--cbx-font-size));
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: var(--vu-space-2);
      box-sizing: border-box;
      min-block-size: var(--menu-overlay-row-min-block-size);
      padding: var(--menu-overlay-row-pad-block) var(--menu-overlay-row-pad-inline);
      ${menuPanelItemCorners}
      cursor: pointer;
      font-size: var(--menu-overlay-row-font-size);
      color: var(--menu-overlay-fg);
      margin: 0;
      transition: background-color var(--vu-duration-fast) var(--vu-ease-out-cubic);
    }

  .dropdown-item.active:not(.selected) {
    background: var(--menu-overlay-hover);
  }

  @media (hover: hover) {
    .dropdown-item:hover:not(.selected) {
      background: var(--menu-overlay-hover);
    }

    .dropdown-item.selected:hover {
      background: var(--vu-color-accent-soft);
    }
  }

  .dropdown-item.selected {
    color: var(--vu-color-accent);
  }

  .option-content {
    flex: 1 1 auto;
    min-inline-size: 0;
  }

  .option-content:not(.highlighted-text) {
    display: flex;
    flex-direction: column;
    gap: var(--vu-space-half);
  }

  .highlighted-text {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dropdown-item.active.selected {
    background: var(--vu-color-accent-soft);
  }

  .highlight {
    color: var(--vu-color-accent);
    font-weight: var(--vu-font-weight-semibold);
  }

    .hidden-chips-dropdown {
    position: fixed;
    padding: var(--cbx-dropdown-pad);
    background: var(--menu-overlay-bg);
    color: var(--menu-overlay-fg);
    box-shadow: var(--menu-overlay-shadow);
      border-radius: var(--menu-overlay-radius);
      corner-shape: var(--vu-corner-shape, round);
    backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
    -webkit-backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
    inline-size: max-content;
      opacity: 0;
      transform: scale(0.98);
    transition:
      opacity var(--vu-duration-fast) var(--vu-ease-out-cubic),
      transform var(--vu-duration-fast) var(--vu-ease-out-cubic);
      margin: 0;
      border: 0;
      box-sizing: border-box;
      overflow: hidden;
    }

    .hidden-chips-dropdown:popover-open {
      opacity: 1;
      transform: scale(1);
    }

    .hidden-chip-inner {
      padding: var(--vu-space-2) var(--vu-space-2-5);
      display: flex;
      align-items: center;
      justify-content: space-between;
    gap: var(--vu-space-2);
      font-size: var(--menu-overlay-row-font-size, var(--cbx-font-size));
    ${menuPanelItemCorners}
    }

  @media (prefers-reduced-motion: reduce) {
    .container,
    .dropdown-item,
    .hidden-chips-dropdown,
    .clear-button,
    .dropdown-button,
    .loading-indicator {
      animation: none !important;
      transition-duration: var(--vu-duration-instant) !important;
    }
  }

  @media (prefers-contrast: more) {
    .container {
      box-shadow: inset 0 0 0 var(--vu-border-width-emphasis) currentColor;
    }
    .container:focus-within:has(:focus-visible) {
      --vu-focus-ring: 0 0 0 2px var(--vu-color-background), 0 0 0 5px var(--vu-color-focus);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
      filter: grayscale(1);
    }
  }

  @media (forced-colors: active) {
    .container {
      forced-color-adjust: none;
      border-color: CanvasText;
    }
    .dropdown,
    .hidden-chips-dropdown {
      forced-color-adjust: none;
      background: Canvas;
      border: var(--vu-border-width) solid CanvasText;
      box-shadow: none;
    }
    .dropdown-item.active {
      background: Highlight;
      color: HighlightText;
    }
  }
`;
