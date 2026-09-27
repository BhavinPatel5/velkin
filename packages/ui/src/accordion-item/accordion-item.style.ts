import { css } from "lit";

export const accordionItemStyles = css`
  :host {
    display: block;
    width: 100%;
    box-sizing: border-box;
    font-family: var(--vu-font-sans);
    color: var(--vu-color-surface-foreground);
    background: transparent;
  }

  /* Host accordion already dims — avoid stacking opacity with relayed item disabled. */
  :host([disabled]) {
    opacity: var(--vu-opacity-disabled-control);
    cursor: var(--vu-cursor-disabled);
    pointer-events: none;
  }
  :host([disabled]):host-context(vu-accordion[disabled]) {
    opacity: 1;
  }

  [part="item"] {
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
  }

  [part="header"] {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--acc-header-gap, var(--vu-space-3));
    width: 100%;
    box-sizing: border-box;
    min-height: var(--vu-min-touch-target);
    padding-block: var(--acc-header-pad-block, var(--vu-space-3));
    padding-inline: var(--acc-header-pad-inline, var(--vu-space-4));
    background: transparent;
    color: inherit;
    text-align: start;
    cursor: var(--vu-cursor-interactive);
    outline: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  @media (hover: hover) {
    [part="header"]:hover {
      background-color: var(
        --acc-item-hover,
        var(--surface-tone-hover, var(--vu-color-surface-hover))
      );
    }
    :host([disabled]) [part="header"]:hover {
      background-color: transparent;
    }
  }

  [part="header"]:active {
    background-color: var(
      --acc-item-active,
      var(--surface-tone-active, var(--vu-color-surface-active))
    );
  }
  :host([disabled]) [part="header"]:active {
    background-color: transparent;
  }

  /* Inset ring — solid/outline/split clip with overflow:hidden and would crop --vu-focus-ring. */
  [part="header"]:focus-visible {
    box-shadow:
      inset 0 0 0 2px var(--vu-color-background),
      inset 0 0 0 4px var(--vu-color-focus);
    z-index: var(--vu-z-raised);
  }

  [part="start"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    min-inline-size: var(--acc-icon-size, var(--vu-font-size-lg));
    min-block-size: var(--acc-icon-size, var(--vu-font-size-lg));
    color: var(--vu-color-muted);
    transition: color var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  [part="start"][hidden] {
    display: none;
  }

  :host:not(:has([slot="start"])) [part="start"] {
    display: none;
  }

  .title-group {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-inline-size: 0;
  }

  [part="title"] {
    display: block;
    font-family: var(--vu-font-sans);
    font-size: var(--acc-title-font-size, var(--vu-font-size-md));
    font-weight: var(--vu-font-weight-semibold);
    line-height: var(--vu-line-height-snug);
    letter-spacing: var(--vu-letter-spacing-normal);
    color: var(--vu-color-surface-foreground);
  }

  [part="sub-title"] {
    display: block;
    margin-block-start: var(--vu-space-half);
    font-family: var(--vu-font-sans);
    font-size: var(--acc-subtitle-font-size, var(--vu-font-size-sm));
    font-weight: var(--vu-font-weight-normal);
    line-height: var(--vu-line-height-normal);
    letter-spacing: var(--vu-letter-spacing-normal);
    color: var(--vu-color-muted);
  }

  [part="sub-title"][hidden] {
    display: none;
  }

  :host:not(:has([slot="sub-title"])) [part="sub-title"] {
    display: none;
  }

  [part="icon"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    min-inline-size: var(--acc-icon-size, var(--vu-font-size-lg));
    min-block-size: var(--acc-icon-size, var(--vu-font-size-lg));
    color: var(--vu-color-muted);
    font-size: var(--acc-icon-size, var(--vu-font-size-lg));
    transition: color var(--vu-duration-normal) var(--vu-ease-out-cubic);
  }

  .icon-slot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .icon-slot[hidden] {
    display: none;
  }

  .body {
    display: grid;
    grid-template-rows: 0fr;
    overflow: hidden;
    transition: grid-template-rows var(--vu-duration-normal) var(--vu-ease-out-fluid);
    contain: layout paint style;
  }
  :host([open]) .body {
    grid-template-rows: 1fr;
  }

  .body-clip {
    min-block-size: 0;
    min-inline-size: 0;
    overflow: hidden;
  }

  [part="body"] {
    padding-block-start: var(--acc-body-pad-block-start, var(--vu-space-1));
    padding-block-end: var(--acc-body-pad-block-end, var(--vu-space-3));
    padding-inline-end: var(--acc-body-pad-inline, var(--vu-space-4));
    /* Default: indent under title when start is present; reset below when absent. */
    padding-inline-start: calc(
      var(--acc-body-pad-inline, var(--vu-space-4)) + var(--acc-icon-size, var(--vu-font-size-lg)) +
        var(--acc-header-gap, var(--vu-space-3))
    );
    font-family: var(--vu-font-sans);
    font-size: var(--acc-body-font-size, var(--vu-font-size-md));
    line-height: var(--vu-line-height-normal);
    color: var(--vu-color-surface-foreground);
    transition: opacity var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }
  :host:not(:has([slot="start"])) [part="body"] {
    padding-inline-start: var(--acc-body-pad-inline, var(--vu-space-4));
  }
  :host(:not([open])) [part="body"] {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    [part="header"],
    [part="icon"],
    [part="start"],
    .body,
    [part="body"] {
      transition-duration: var(--vu-duration-instant);
    }
  }

  @media (prefers-contrast: more) {
    [part="header"]:focus-visible {
      box-shadow: none;
      outline: var(--vu-border-width-emphasis) solid currentColor;
      outline-offset: calc(var(--vu-border-width-emphasis) * -1);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host([disabled]) {
      opacity: 1;
    }
    :host(:not([open])) [part="body"] {
      opacity: 1;
    }
  }

  @media (forced-colors: active) {
    [part="header"]:focus-visible {
      box-shadow: none;
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: calc(var(--vu-border-width-emphasis) * -1);
    }
  }
`;
