import { css, unsafeCSS } from "lit";

export const stepsVerticalPanelStyles = css`
  .v-panel {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    overflow: hidden;
    transition:
      grid-template-rows var(--steps-anim-ms, var(--vu-duration-normal)) var(--steps-anim-ease, var(--vu-ease-out-cubic)),
      opacity var(--steps-anim-ms, var(--vu-duration-normal)) var(--steps-anim-ease, var(--vu-ease-out-cubic));
  }

  .v-panel.is-open {
    grid-template-rows: 1fr;
    opacity: 1;
  }

  .v-inner {
    min-height: 0;
    overflow: hidden;
    display: grid;
    grid-template-rows: 1fr;
    block-size: 100%;
    box-sizing: border-box;
    margin-inline-start: var(--steps-content-inset);
    border-inline-start: none;
    transition: border-color var(--steps-anim-ms, var(--vu-duration-normal)) var(--steps-anim-ease, var(--vu-ease-out-cubic));
  }

  .v-panel.is-open .v-inner {
    overflow: visible;
  }

  .v-content {
    box-sizing: border-box;
    min-block-size: 0;
    block-size: 100%;
    align-self: stretch;
    padding-block-start: var(--vu-space-2-5);
    padding-inline-start: var(--steps-content-pad-inline, var(--vu-space-3));
    padding-block-end: 0;
    padding-inline-end: 0;
  }

  .panel-body {
    padding-block-start: var(--vu-space-1);
  }

  @media (prefers-reduced-motion: reduce) {
    .v-panel {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    .v-inner {
      border-inline-start-width: calc(var(--steps-rail-width) + var(--vu-border-width));
    }
  }

  @media (forced-colors: active) {
    .v-inner {
      border-inline-start-color: CanvasText;
    }
  }
`;

function notLast(item: string): string {
  return item.includes(":host")
    ? ':host([layout="vertical"]):not([last])'
    : `${item}:not(.last)`;
}

function isLast(item: string): string {
  return item.includes(":host")
    ? ':host([layout="vertical"])[last]'
    : `${item}.last`;
}

export const stepsVerticalPanelBorderStyles = (item: string) => css`
  ${unsafeCSS(`${notLast(item)} .v-panel:not(.is-open) .v-inner`)} {
    border-inline-start: var(--steps-rail-width) dashed var(--vu-color-muted);
    opacity: var(--vu-opacity-disabled-control);
  }

  ${unsafeCSS(`${notLast(item)} .v-panel.is-open .v-inner`)} {
    border-inline-start: var(--steps-rail-width) solid var(--vu-color-accent);
  }

  ${unsafeCSS(`${isLast(item)} .v-inner`)} {
    border-inline-start: none !important;
  }
`;

export const stepsVerticalRailStyles = (item: string) => {
  const completedRail = item.includes(":host")
    ? ':host([layout="vertical"][completed]:not([last]))::after'
    : `${item}.completed:not(.last)::after`;

  return css`
    :host(:not([layout="vertical"]))::after {
      content: none;
      display: none;
    }

    ${unsafeCSS(`${notLast(item)}::after`)} {
      content: "";
      position: absolute;
      inset-inline-start: var(--steps-node-center);
      margin-inline-start: calc(var(--steps-rail-width) / -2);
      top: var(--steps-rail-top);
      bottom: calc(-1 * var(--steps-gap, var(--vu-space-3)));
      width: var(--steps-rail-width);
      background: var(--vu-color-muted);
      z-index: 0;
      transition: background-color var(--steps-anim-ms, var(--vu-duration-normal)) var(--steps-anim-ease, var(--vu-ease-out-cubic));
    }

    ${unsafeCSS(completedRail)} {
      background: var(--vu-color-accent);
    }

    ${unsafeCSS(`${notLast(item)}:has(.v-panel.is-open)::after`)} {
      background: var(--vu-color-accent);
    }

    ${unsafeCSS(`${isLast(item)}::after`)} {
      content: none;
      display: none;
    }

    :host([layout="vertical"]) .v-rail {
      position: absolute;
      inset-inline-start: var(--steps-node-center);
      margin-inline-start: calc(var(--steps-rail-width) / -2);
      top: var(--steps-rail-top);
      bottom: calc(-1 * var(--steps-gap, var(--vu-space-3)));
      width: var(--steps-rail-width);
      background: var(--vu-color-muted);
      z-index: 0;
      pointer-events: none;
    }

    :host([layout="vertical"][completed]:not([last])) .v-rail,
    :host([layout="vertical"]:not([last]):has(.v-panel.is-open)) .v-rail {
      background: var(--vu-color-accent);
    }

    :host([layout="vertical"])[last] .v-inner {
      border-inline-start: none;
    }

    :host([layout="vertical"])[last] .v-rail,
    :host(:not([layout="vertical"])) .v-rail {
      display: none;
    }

    .v-header .node {
      position: relative;
      z-index: 1;
    }
  `;
};
