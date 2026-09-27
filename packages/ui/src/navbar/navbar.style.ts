import { css, type CSSResult } from "lit";
import {
  menuOverlayCohesionHost,
  menuOverlayCohesionSize,
  menuOverlayCohesionTone,
} from "../internals/styles/menu-overlay-cohesion.css.js";
import { surfaceToneInteractionHost } from "../internals/styles/surface-tone-interaction.css.js";
import { overlaySurfaceGuard } from "../internals/styles/overlay-surface-guard.css.js";
import {
  menuPanelInnerClip,
  menuPanelItemCorners,
  menuPanelRadiusTokens,
} from "../internals/styles/menu-panel-radius.css.js";
import {
  menuStackDividerHost,
} from "../internals/styles/menu-stack-dividers.css.js";
import {
  glassSurfaceHost,
  glassReducedTransparency,
} from "../internals/styles/glass-surface.css.js";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const navbarStyles: CSSResult = css`
  ${overlaySurfaceGuard}
  ${surfaceToneInteractionHost}
  ${glassSurfaceHost}
  ${glassReducedTransparency}
  ${controlSizeMetricsTokens}

  :host {
    display: block;
    width: 100%;
    box-sizing: border-box;
    font-family: var(--vu-font-sans);

    --navbar-bar-min-h: var(--vu-csm-chrome-min-block-size);
    --navbar-bar-min-h-condensed: var(--vu-chrome-height-lg);
    --navbar-bar-py: var(--vu-space-1);
    --navbar-bar-px: var(--vu-space-3);
    --navbar-link-py: var(--vu-space-2);
    --navbar-link-px: var(--vu-space-3);
    --navbar-link-font: var(--vu-csm-chrome-font-size);
    --navbar-items-gap: var(--vu-space-1);
    --navbar-max-width: 72rem;

    --navbar-bg: var(--vu-color-surface);
    --navbar-fg: var(--vu-color-surface-foreground);
    --navbar-border-block-end: var(--vu-border-primary);
    --navbar-shadow: var(--vu-shadow-surface);

    --navbar-menu-left: 0px;
    --navbar-menu-top: 0px;
    --navbar-submenu-left: 0px;
    --navbar-submenu-top: 0px;
    ${menuOverlayCohesionHost}
    --navbar-menu-radius: var(--menu-overlay-radius);
    --navbar-menu-pad: var(--menu-overlay-pad);
    --navbar-menu-row-pad-block: var(--menu-overlay-row-pad-block);
    --navbar-menu-row-pad-inline: var(--menu-overlay-row-pad-inline);
    --navbar-menu-row-font: var(--menu-overlay-row-font-size);
    --navbar-menu-row-min-block-size: var(--menu-overlay-row-min-block-size);
    --navbar-menu-min-w: 13rem;
    --navbar-menu-max-h: 22rem;
    --menu-panel-radius: var(--navbar-menu-radius);
    --menu-panel-pad: var(--navbar-menu-pad);
    ${menuPanelRadiusTokens}

    color: var(--navbar-fg);
    background: color-mix(
      in oklab,
      var(--navbar-bg) var(--vu-surface-fill, 100%),
      transparent
    );
    border-block-end: var(--navbar-border-block-end);
    box-shadow: var(--navbar-shadow);
    backdrop-filter: var(--vu-surface-backdrop-filter);
    -webkit-backdrop-filter: var(--vu-surface-backdrop-filter);
  }

  ${menuOverlayCohesionTone}
  ${menuOverlayCohesionSize}

  :host([tone="subtle"]) {
    --navbar-bg: var(--vu-color-surface-secondary);
    --navbar-fg: var(--vu-color-surface-secondary-foreground);
  }

  :host([tone="strong"]) {
    --navbar-bg: var(--vu-color-surface-tertiary);
    --navbar-fg: var(--vu-color-surface-tertiary-foreground);
  }

  :host([variant="outline"]) {
    --navbar-border-block-end: var(--vu-border-width) solid var(--vu-color-border);
    --navbar-shadow: none;
  }

  :host([variant="elevated"]) {
    --navbar-border-block-end: var(--vu-border-width) solid transparent;
    --navbar-shadow: var(--vu-shadow-overlay);
  }

  :host([variant="transparent"]) {
    --navbar-bg: transparent;
    --navbar-border-block-end: var(--vu-border-width) solid transparent;
    --navbar-shadow: none;
  }

  :host([variant="transparent"]) .bar.is-stuck {
    --navbar-bg: var(--vu-color-surface);
    --navbar-border-block-end: var(--vu-border-primary);
    --navbar-shadow: var(--vu-shadow-overlay);
    background: var(--navbar-bg);
    color: var(--navbar-fg);
    border-block-end: var(--navbar-border-block-end);
    box-shadow: var(--navbar-shadow);
  }

  :host([variant="transparent"][tone="subtle"]) .bar.is-stuck {
    --navbar-bg: var(--vu-color-surface-secondary);
  }

  :host([variant="transparent"][tone="strong"]) .bar.is-stuck {
    --navbar-bg: var(--vu-color-surface-tertiary);
  }

  :host([variant="inset"]) {
    --navbar-bg: transparent;
    --navbar-border-block-end: var(--vu-border-width) solid transparent;
    --navbar-shadow: none;
    padding: var(--vu-space-2) var(--vu-space-3);
  }

  :host([variant="inset"]) .bar,
  :host([variant="inset"]) .m-top {
    background: var(--navbar-bg);
    color: var(--navbar-fg);
    border: var(--vu-border-primary);
    border-radius: var(--vu-radius-xl);
    corner-shape: var(--vu-corner-shape, round);
    box-shadow: var(--vu-shadow-surface);
  }

  :host([size="sm"]) {
    --navbar-bar-min-h-condensed: var(--vu-control-height-sm);
    --navbar-bar-py: var(--vu-space-half);
    --navbar-bar-px: var(--vu-space-2);
    --navbar-link-py: var(--vu-space-1-5);
    --navbar-link-px: var(--vu-space-2);
    --navbar-items-gap: var(--vu-space-half);
  }

  :host([size="lg"]) {
    --navbar-bar-min-h-condensed: var(--vu-chrome-height-lg);
    --navbar-bar-py: var(--vu-space-2);
    --navbar-bar-px: var(--vu-space-4);
    --navbar-link-py: var(--vu-space-2-5);
    --navbar-link-px: var(--vu-space-4);
    --navbar-items-gap: var(--vu-space-1-5);
  }

  :host([contained]) .bar,
  :host([contained]) .m-top {
    max-width: var(--navbar-max-width);
    margin-inline: auto;
    width: 100%;
    box-sizing: border-box;
  }

  :host([sticky]) {
    position: sticky;
    top: 0;
    z-index: var(--vu-z-sticky);
  }

  :host([sticky]) .bar.is-stuck {
    min-height: var(--navbar-bar-min-h-condensed);
    box-shadow: var(--vu-shadow-overlay);
    border-bottom-color: transparent;
  }

  :host([sticky][condense]) .bar {
    transition:
      min-height var(--vu-duration-fast) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-fast) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  :host([isMobile]) .desktop {
    display: none;
  }

  :host([isMobile]) .mobile {
    display: flex;
  }

  @media (display-mode: window-controls-overlay) {
    :host([pwaOverlay]) {
      position: fixed;
      top: env(titlebar-area-y, var(--vu-space-0));
      left: env(titlebar-area-x, var(--vu-space-0));
      width: env(titlebar-area-width, 100vw);
      height: env(titlebar-area-height, var(--vu-space-8));
      z-index: 100000;
      pointer-events: auto;
      border-bottom: none;
      box-shadow: none;
    }

    :host([pwaOverlay]) .bar {
      height: env(titlebar-area-height, var(--vu-space-12));
      box-shadow: none;
      border-bottom: none;
      -webkit-app-region: drag;
    }
  }

  .btn,
  .menu-row,
  .m-btn,
  select,
  input,
  a,
  vu-icon,
  slot,
  .slot-pre,
  .slot-post {
    -webkit-app-region: no-drag;
  }

  .bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: var(--justify-bar, space-between);
    gap: var(--vu-space-2);
    min-height: var(--navbar-bar-min-h);
    padding: var(--navbar-bar-py) var(--navbar-bar-px);
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
  }

  .bar-items {
    display: flex;
    align-items: center;
    flex: var(--grow-bar-items, 1 1 auto);
    min-width: 0;
    gap: var(--navbar-items-gap);
  }

  .slot-pre,
  .slot-post {
    display: flex;
    align-items: center;
    flex: var(--grow-slot, 0 0 auto);
    gap: var(--vu-space-2);
  }

  .slot-pre[hidden],
  .slot-post[hidden] {
    display: none;
  }

  :host:not(:has([slot="prepend"])) .desktop .slot-pre,
  :host:not(:has([slot="append"])) .desktop .slot-post,
  :host:not(:has([slot="prepend-mobile"])) .mobile .slot-pre,
  :host:not(:has([slot="append-mobile"])) .mobile .slot-post {
    display: none;
  }

  .slot-pre {
    margin-inline-end: var(--vu-space-2);
  }

  .slot-post {
    margin-inline-start: var(--vu-space-2);
  }

  .btn {
    position: relative;
    display: inline-flex;
    gap: var(--vu-space-1-5);
    align-items: center;
    padding: var(--navbar-link-py) var(--navbar-link-px);
    border: none;
    background: transparent;
    color: color-mix(in oklab, var(--navbar-fg) 68%, transparent);
    font-size: var(--navbar-link-font);
    font-weight: var(--vu-font-weight-medium);
    font-family: var(--vu-font-sans);
    letter-spacing: var(--vu-letter-spacing-normal);
    border-radius: var(--vu-radius-md);
    corner-shape: var(--vu-corner-shape, round);
    cursor: pointer;
    flex-shrink: 0;
    transition:
      color var(--vu-duration-fast) var(--vu-ease-out-cubic),
      background var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  .btn::after {
    content: "";
    position: absolute;
    inset-inline: var(--navbar-link-px);
    inset-block-end: calc(var(--vu-space-1) * -1);
    height: 2px;
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--vu-color-accent);
    transform: scaleX(0);
    transition: transform var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  :host([indicator="pill"]) .btn::after,
  :host([indicator="dot"]) .btn::after,
  :host([indicator="none"]) .btn::after {
    content: none;
  }

  :host([indicator="pill"]) .btn {
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
  }

  :host([indicator="pill"]) .btn.active,
  :host([indicator="pill"]) .btn.open {
    background: color-mix(in oklab, var(--navbar-fg) 8%, transparent);
  }

  :host([indicator="dot"]) .btn::before {
    content: "";
    position: absolute;
    inset-inline-start: 50%;
    inset-block-end: calc(var(--vu-space-half) * -1);
    width: 4px;
    height: 4px;
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--vu-color-accent);
    transform: translateX(-50%) scale(0);
    transition: transform var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  :host([indicator="dot"]) .btn.active::before,
  :host([indicator="dot"]) .btn.open::before {
    transform: translateX(-50%) scale(1);
  }

  @media (hover: hover) {
    .btn:hover:not([aria-disabled="true"]):not(.active):not(.open) {
      color: var(--navbar-fg);
      background: var(--surface-tone-hover);
    }
  }

  .btn.active {
    color: var(--navbar-fg);
  }

  .btn.active::after {
    transform: scaleX(1);
  }

  .btn.open {
    color: var(--navbar-fg);
    background: var(--surface-tone-hover);
  }

  .btn[aria-disabled="true"] {
    opacity: var(--vu-opacity-disabled-control);
    cursor: not-allowed;
  }

  .btn:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  vu-icon {
    display: inline-block;
    width: 1em;
    height: 1em;
  }

  .menu-panel {
    position: fixed;
    left: var(--navbar-menu-left, 0px);
    top: var(--navbar-menu-top, 0px);
    min-inline-size: var(--navbar-menu-min-w);
    max-inline-size: calc(100vw - var(--vu-space-4));
    margin: 0;
    padding: var(--navbar-menu-pad);
    border: 0;
    border-radius: var(--navbar-menu-radius);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--menu-overlay-bg);
    color: var(--menu-overlay-fg);
    box-shadow: var(--menu-overlay-shadow);
    backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
    -webkit-backdrop-filter: var(--menu-overlay-backdrop-filter, var(--vu-overlay-backdrop-filter));
    box-sizing: border-box;
    overflow: hidden;
  }

  .menu-panel[data-kind="nested"] {
    left: var(--navbar-submenu-left, 0px);
    top: var(--navbar-submenu-top, 0px);
    min-inline-size: 12rem;
  }

  .menu-panel.menu-mega {
    min-inline-size: min(48rem, calc(100vw - var(--vu-space-4)));
    max-inline-size: calc(100vw - var(--vu-space-4));
  }

  .mega-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(10rem, 1fr));
    gap: var(--vu-space-3);
    max-block-size: var(--navbar-menu-max-h);
    overflow-y: auto;
    ${menuPanelInnerClip}
  }

  .menu-panel.menu-mega[data-cols="1"] .mega-grid {
    grid-template-columns: repeat(1, minmax(10rem, 1fr));
  }

  .menu-panel.menu-mega[data-cols="2"] .mega-grid {
    grid-template-columns: repeat(2, minmax(10rem, 1fr));
  }

  .menu-panel.menu-mega[data-cols="4"] .mega-grid {
    grid-template-columns: repeat(4, minmax(10rem, 1fr));
  }

  .menu-panel.menu-mega[data-cols="5"] .mega-grid {
    grid-template-columns: repeat(5, minmax(10rem, 1fr));
  }

  .menu-panel.menu-mega[data-cols="6"] .mega-grid {
    grid-template-columns: repeat(6, minmax(10rem, 1fr));
  }

  .mega-col {
    display: flex;
    flex-direction: column;
    gap: var(--vu-space-1);
    min-width: 0;
  }

  .mega-heading {
    font-size: var(--vu-font-size-xs);
    font-weight: var(--vu-font-weight-semibold);
    letter-spacing: var(--vu-letter-spacing-wide);
    text-transform: uppercase;
    color: color-mix(in oklab, var(--vu-color-overlay-foreground) 62%, transparent);
    padding: var(--vu-space-1) var(--vu-space-2) 0;
  }

  .mega-sub {
    font-size: var(--vu-font-size-xs);
    color: color-mix(in oklab, var(--vu-color-overlay-foreground) 55%, transparent);
    padding: 0 var(--vu-space-2);
  }

  .mega-rows {
    display: flex;
    flex-direction: column;
    --menu-stack-gap: var(--vu-space-half);
    gap: var(--menu-stack-gap);
  }

  .menu-scroll {
    display: flex;
    flex-direction: column;
    --menu-stack-gap: var(--vu-space-half);
    gap: var(--menu-stack-gap);
    max-block-size: var(--navbar-menu-max-h);
    overflow-y: auto;
    ${menuPanelInnerClip}
  }

  .menu-row {
    display: flex;
    align-items: center;
    gap: var(--vu-space-2);
    width: 100%;
    min-block-size: var(--navbar-menu-row-min-block-size);
    padding: var(--navbar-menu-row-pad-block) var(--navbar-menu-row-pad-inline);
    border: none;
    background: transparent;
    text-align: start;
    color: inherit;
    font-size: var(--navbar-menu-row-font);
    font-weight: var(--vu-font-weight-normal);
    font-family: var(--vu-font-sans);
    cursor: pointer;
    box-sizing: border-box;
    transition: background var(--vu-duration-fast) var(--vu-ease-out-cubic);
    ${menuPanelItemCorners}
  }

  @media (hover: hover) {
    .menu-row:hover:not([aria-disabled="true"]):not(.active) {
      background: var(--menu-overlay-hover);
    }
  }

  .menu-row.active {
    color: var(--vu-color-accent);
    font-weight: var(--vu-font-weight-medium);
  }

  @media (hover: hover) {
    .menu-row.active:hover:not([aria-disabled="true"]) {
      background: var(--menu-overlay-hover);
    }
  }

  .menu-row[aria-disabled="true"] {
    opacity: var(--vu-opacity-disabled-control);
    cursor: not-allowed;
  }

  .menu-row:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  .menu-row.no-icon {
    padding-inline-start: var(--navbar-menu-row-pad-inline);
  }

  .cell-state,
  .cell-R {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }

  .cell-label {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-width: 0;
    gap: var(--vu-space-half);
  }

  .cell-label > span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sub {
    font-size: var(--vu-font-size-xs);
    color: color-mix(in oklab, var(--vu-color-overlay-foreground) 68%, transparent);
    font-weight: var(--vu-font-weight-normal);
  }

  .cell-R {
    margin-inline-start: var(--vu-space-1);
    color: color-mix(in oklab, var(--vu-color-overlay-foreground) 55%, transparent);
    gap: var(--vu-space-1-5);
  }

  .shortcut {
    font-size: var(--vu-font-size-xs);
    color: color-mix(in oklab, var(--vu-color-overlay-foreground) 60%, transparent);
    font-variant-numeric: tabular-nums;
  }

  .badge {
    font-size: var(--vu-font-size-xs);
    font-weight: var(--vu-font-weight-medium);
    padding: var(--vu-space-half) var(--vu-space-1-5);
    border-radius: var(--vu-radius-full);
    corner-shape: var(--vu-corner-shape, round);
    background: color-mix(in oklab, var(--vu-color-accent) 16%, transparent);
    color: var(--vu-color-accent);
  }

  a.btn,
  a.menu-row {
    text-decoration: none;
    color: inherit;
  }

  .menu-scroll > .divider,
  .mega-rows > .divider {
    --divider-color: color-mix(in oklab, var(--vu-color-overlay-foreground) 14%, transparent);
    --menu-stack-divider-inset-inline: var(--vu-space-2);
    ${menuStackDividerHost}
  }

  .mobile {
    display: none;
    flex-direction: column;
  }

  .m-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: var(--navbar-bar-min-h);
    padding: var(--navbar-bar-py) var(--navbar-bar-px);
    gap: var(--vu-space-2);
    box-sizing: border-box;
  }

  .m-btn {
    font-size: var(--navbar-link-font);
    padding: var(--navbar-link-py) var(--navbar-link-px);
    display: flex;
    border-radius: var(--vu-radius-md);
    corner-shape: var(--vu-corner-shape, round);
    cursor: pointer;
    color: var(--navbar-fg);
    background: transparent;
    border: none;
  }

  @media (hover: hover) {
    .m-btn:hover {
      background: var(--surface-tone-hover);
    }
  }

  .m-btn:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  vu-nav-panel {
    flex: 1 1 auto;
    min-height: 0;
  }

  .m-drawer-body {
    display: flex;
    flex-direction: column;
    gap: var(--vu-space-2);
    min-height: 0;
  }

  .m-drawer-body > slot[hidden] {
    display: none;
  }

  :host:not(:has([slot="header"])) .m-drawer-body > slot[name="header"],
  :host:not(:has([slot="footer"])) .m-drawer-body > slot[name="footer"] {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .btn,
    .menu-row,
    :host([sticky][condense]) .bar {
      transition: none !important;
    }

    .btn::after,
    .btn::before {
      transition: none !important;
    }
  }

  @media (prefers-contrast: more) {
    .btn:focus-visible,
    .menu-row:focus-visible,
    .m-btn:focus-visible {
      outline: var(--vu-border-width-emphasis) solid var(--vu-color-focus);
      outline-offset: var(--vu-space-half);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host {
      background: var(--navbar-bg);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    [part="top-menu"],
    [part="nested-menu"],
    .menu-panel {
      background: var(--vu-color-overlay);
      color: var(--vu-color-overlay-foreground);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
  }

  @media (forced-colors: active) {
    .btn:focus-visible,
    .menu-row:focus-visible,
    .m-btn:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      box-shadow: none;
    }

    [part="top-menu"],
    [part="nested-menu"] {
      forced-color-adjust: none;
      border: var(--vu-border-width-emphasis) solid CanvasText;
      background: Canvas;
      color: CanvasText;
    }
  }
`;
