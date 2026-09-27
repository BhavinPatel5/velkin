import { css } from "lit";
import { controlSizeMetricsTokens } from "../internals/styles/control-size-metrics.css.js";

export const buttonStyles = css`
  ${controlSizeMetricsTokens}

  :host {
    display: inline-flex;
    box-sizing: border-box;
    line-height: var(--vu-line-height-none);
    font-family: var(--vu-font-sans);
    vertical-align: middle;

    /* Intent channels — overridden by [color='*'] selectors below.
       'strong' is the saturated bg used by [variant='solid']; 'strong-fg' is its
       paired text color. 'soft' / 'soft-fg' / 'soft-hover' drive [variant='soft']
       and hover fills for outline / ghost. 'edge' is the border for outline.
       Default soft uses surface-secondary (opaque) so non-solid variants stay
       visible on the page bg — same model as vu-chip / vu-alert. */
    --btn-strong: var(--vu-color-default);
    --btn-strong-fg: var(--vu-color-default-foreground);
    --btn-strong-hover: var(--vu-color-default-hover);
    --btn-soft: var(--vu-color-surface-secondary);
    --btn-soft-fg: var(--vu-color-surface-secondary-foreground);
    --btn-soft-hover: color-mix(
      in oklab,
      var(--vu-color-surface-secondary) 88%,
      var(--vu-color-surface-secondary-foreground) 12%
    );
    --btn-edge: var(--vu-color-border);

    /* Size metrics — from controlSizeMetricsTokens (Role A). */
    --btn-py: var(--vu-csm-action-py);
    --btn-px: var(--vu-csm-action-px);
    --btn-gap: var(--vu-csm-action-gap);
    --btn-min-block-size: var(--vu-csm-action-min-block-size);
    --btn-font-size: var(--vu-csm-action-font-size);
    --btn-icon-size: var(--vu-csm-action-icon-size);
    --btn-spinner-size: var(--vu-csm-action-spinner-size);

    /* Radius — explicit radius prop only; size never changes corners. */
    --btn-radius: var(--vu-control-radius-md);
  }

  :host([disabled]) {
    cursor: not-allowed;
  }
  :host([block]) {
    display: flex;
    inline-size: 100%;
  }

  /* Icon-only square hit target. [icononly] = prop; [data-icononly] = inferred. */
  :host([icononly]:not([block]):not([variant="link"])),
  :host([data-icononly]:not([block]):not([variant="link"])) {
    inline-size: var(--btn-min-block-size);
    block-size: var(--btn-min-block-size);
  }
  :host([icononly]:not([block]):not([variant="link"])) [part="base"],
  :host([data-icononly]:not([block]):not([variant="link"])) [part="base"] {
    aspect-ratio: 1;
    inline-size: 100%;
    block-size: 100%;
    padding-inline: var(--btn-py);
  }
  :host([icononly][variant="outline"]:not([block])) [part="base"],
  :host([data-icononly][variant="outline"]:not([block])) [part="base"] {
    padding-inline: calc(var(--btn-py) - var(--vu-border-width-emphasis));
  }

  /* Intent palettes — only re-pin the channel vars; never touch sizing. */
  :host([color="primary"]) {
    --btn-strong: var(--vu-color-accent);
    --btn-strong-fg: var(--vu-color-accent-foreground);
    --btn-strong-hover: color-mix(in oklab, var(--vu-color-accent) 92%, var(--vu-color-foreground) 8%);
    --btn-soft: var(--vu-color-accent-soft);
    --btn-soft-fg: var(--vu-color-accent-soft-foreground);
    --btn-soft-hover: var(--vu-color-accent-soft-hover);
    --btn-edge: var(--vu-color-accent);
  }
  :host([color="success"]) {
    --btn-strong: var(--vu-color-success);
    --btn-strong-fg: var(--vu-color-success-foreground);
    --btn-strong-hover: color-mix(in oklab, var(--vu-color-success) 92%, var(--vu-color-foreground) 8%);
    --btn-soft: var(--vu-color-success-soft);
    --btn-soft-fg: var(--vu-color-success-soft-foreground);
    --btn-soft-hover: var(--vu-color-success-soft-hover);
    --btn-edge: var(--vu-color-success);
  }
  :host([color="warning"]) {
    --btn-strong: var(--vu-color-warning);
    --btn-strong-fg: var(--vu-color-warning-foreground);
    --btn-strong-hover: color-mix(in oklab, var(--vu-color-warning) 92%, var(--vu-color-foreground) 8%);
    --btn-soft: var(--vu-color-warning-soft);
    --btn-soft-fg: var(--vu-color-warning-soft-foreground);
    --btn-soft-hover: var(--vu-color-warning-soft-hover);
    --btn-edge: var(--vu-color-warning);
  }
  :host([color="danger"]) {
    --btn-strong: var(--vu-color-danger);
    --btn-strong-fg: var(--vu-color-danger-foreground);
    --btn-strong-hover: color-mix(in oklab, var(--vu-color-danger) 92%, var(--vu-color-foreground) 8%);
    --btn-soft: var(--vu-color-danger-soft);
    --btn-soft-fg: var(--vu-color-danger-soft-foreground);
    --btn-soft-hover: var(--vu-color-danger-soft-hover);
    --btn-edge: var(--vu-color-danger);
  }

  :host([radius="none"]) {
    --btn-radius: 0;
  }

  :host([radius="sm"]) {
    --btn-radius: var(--vu-control-radius-sm);
  }
  :host([radius="md"]) {
    --btn-radius: var(--vu-control-radius-md);
  }
  :host([radius="lg"]) {
    --btn-radius: var(--vu-control-radius-lg);
  }
  :host([radius="full"]) {
    --btn-radius: var(--vu-radius-full);
  }

  /* The native button — variant-neutral surface; per-variant rules paint the channels. */
  [part="base"] {
    position: relative;
    display: inline-flex;
    inline-size: 100%;
    align-items: center;
    justify-content: center;
    gap: var(--btn-gap);
    box-sizing: border-box;
    min-block-size: var(--btn-min-block-size);
    padding-block: var(--btn-py);
    padding-inline: var(--btn-px);
    margin: 0;
    border: 0 solid transparent;
    border-radius: var(--btn-radius);
    corner-shape: var(--vu-corner-shape, round);
    background: var(--btn-strong);
    color: var(--btn-strong-fg);
    font: inherit;
    font-family: var(--vu-font-sans);
    font-size: var(--btn-font-size);
    font-weight: var(--vu-font-weight-semibold);
    line-height: var(--vu-line-height-none);
    letter-spacing: var(--vu-letter-spacing-normal);
    text-align: center;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition:
      background-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      border-color var(--vu-duration-normal) var(--vu-ease-out-cubic),
      box-shadow var(--vu-duration-normal) var(--vu-ease-out-cubic),
      transform var(--vu-duration-fast) var(--vu-ease-out-cubic);
  }

  /* Variant treatments — pick which channels become bg / fg / border. */
  :host([variant="solid"]) [part="base"] {
    background: var(--btn-strong);
    color: var(--btn-strong-fg);
  }
  :host([variant="soft"]) [part="base"] {
    background: var(--btn-soft);
    color: var(--btn-soft-fg);
  }
  :host([variant="outline"]) [part="base"] {
    background: color-mix(in oklab, var(--btn-strong) 8%, transparent);
    color: var(--btn-soft-fg);
    border: var(--vu-border-width-emphasis) solid var(--btn-edge);
    /* Compensate for the emphasis-width border so size matches solid/soft. */
    padding-block: calc(var(--btn-py) - var(--vu-border-width-emphasis));
    padding-inline: calc(var(--btn-px) - var(--vu-border-width-emphasis));
  }
  :host([variant="ghost"]) [part="base"] {
    background: transparent;
    color: var(--btn-soft-fg);
  }
  :host([variant="link"]) [part="base"] {
    background: transparent;
    color: var(--btn-soft-fg);
    padding-inline: 0;
    min-block-size: 0;
    border-radius: var(--vu-radius-xs);
    corner-shape: var(--vu-corner-shape, round);
    text-decoration: underline;
    text-underline-offset: 0.2em;
    text-decoration-thickness: var(--vu-border-width);
  }
  /* Default intent on transparent shells — page foreground + neutral edge. */
  :host([variant="outline"]:not([color]):not([color="primary"]):not([color="success"]):not([color="warning"]):not([color="danger"])),
  :host([variant="outline"][color="default"]),
  :host([variant="ghost"]:not([color]):not([color="primary"]):not([color="success"]):not([color="warning"]):not([color="danger"])),
  :host([variant="ghost"][color="default"]),
  :host([variant="link"]:not([color]):not([color="primary"]):not([color="success"]):not([color="warning"]):not([color="danger"])),
  :host([variant="link"][color="default"]) {
    --btn-strong: var(--vu-color-foreground);
    --btn-soft-fg: var(--vu-color-foreground);
    --btn-edge: var(--vu-color-border);
  }
  :host([variant="outline"]:not([color]):not([color="primary"]):not([color="success"]):not([color="warning"]):not([color="danger"])) [part="base"],
  :host([variant="outline"][color="default"]) [part="base"] {
    background: color-mix(in oklab, var(--vu-color-field) 70%, transparent);
  }

  /* Hover — gated for hover-capable devices so iOS / Android don't keep the tone after a tap. */
  @media (hover: hover) {
    :host([variant="solid"]:not([disabled]):not([loading]):not([pressed])) [part="base"]:hover {
      background: var(--btn-strong-hover);
    }
    :host([variant="soft"]:not([disabled]):not([loading]):not([pressed])) [part="base"]:hover {
      background: var(--btn-soft-hover);
    }
    :host([variant="outline"]:not([disabled]):not([loading]):not([pressed])) [part="base"]:hover {
      background: color-mix(in oklab, var(--btn-strong) 16%, transparent);
      color: var(--btn-soft-fg);
    }
    :host([variant="outline"]:not([color]):not([color="primary"]):not([color="success"]):not([color="warning"]):not([color="danger"]):not([disabled]):not([loading]):not([pressed])) [part="base"]:hover,
    :host([variant="outline"][color="default"]:not([disabled]):not([loading]):not([pressed])) [part="base"]:hover {
      background: color-mix(in oklab, var(--vu-color-field) 85%, var(--vu-color-foreground) 6%);
      color: var(--vu-color-foreground);
    }
    :host([variant="ghost"]:not([disabled]):not([loading]):not([pressed])) [part="base"]:hover {
      background: var(--btn-soft);
      color: var(--btn-soft-fg);
    }
    :host([variant="link"]:not([disabled]):not([loading]):not([pressed])) [part="base"]:hover {
      text-decoration-thickness: var(--vu-border-width-emphasis);
      color: var(--btn-soft-fg);
    }
    :host([variant="solid"][pressed]:not([disabled]):not([loading])) [part="base"]:hover {
      background: color-mix(in oklab, var(--btn-strong-hover) 88%, black);
    }
    :host([variant="soft"][pressed]:not([disabled]):not([loading])) [part="base"]:hover,
    :host([variant="ghost"][pressed]:not([disabled]):not([loading])) [part="base"]:hover {
      background: color-mix(in oklab, var(--btn-soft-hover) 88%, var(--btn-soft-fg));
      color: var(--btn-soft-fg);
    }
    :host([variant="outline"][pressed]:not([disabled]):not([loading])) [part="base"]:hover {
      background: color-mix(in oklab, var(--btn-strong) 28%, transparent);
      color: var(--btn-soft-fg);
    }
  }

  /* Press — slight scale + downward nudge (gated by reduced-motion below). */
  :host(:not([variant="link"]):not([disabled]):not([loading])) [part="base"]:active {
    transform: translateY(1px) scale(0.98);
  }

  /* Pressed (a.k.a. active / selected) — drives toggle buttons and the
     selected radio inside <vu-button-group>. Visual goal: the button reads as
     'recessed' so it's distinguishable from hover (which is transient). The
     inset shadow is the cheapest visual that reads at any contrast level;
     outline / ghost variants keep the soft tint to differentiate from their
     flat default.
     Disabled is intentionally NOT excluded — a disabled selected radio still
     needs to LOOK selected (matches native 'input type=radio checked disabled');
     the [disabled] opacity rule below dims the whole pressed visual uniformly.
     Loading IS excluded because the spinner replaces the button content — a
     pressed background under a spinner is noise. */
  :host([variant="solid"][pressed]:not([loading])) [part="base"] {
    background: var(--btn-strong-hover);
    box-shadow: inset 0 var(--vu-border-width) var(--vu-space-half) rgb(0 0 0 / 18%);
  }
  /* Pressed recess must not replace the focus ring — layer both. */
  :host([variant="solid"][pressed]:not([loading])) [part="base"]:focus-visible {
    box-shadow:
      inset 0 var(--vu-border-width) var(--vu-space-half) rgb(0 0 0 / 18%),
      var(--vu-focus-ring);
  }
  :host([variant="soft"][pressed]:not([loading])) [part="base"],
  :host([variant="ghost"][pressed]:not([loading])) [part="base"] {
    background: var(--btn-soft-hover);
    color: var(--btn-soft-fg);
  }
  :host([variant="outline"][pressed]:not([loading])) [part="base"] {
    background: color-mix(in oklab, var(--btn-strong) 24%, transparent);
    color: var(--btn-soft-fg);
  }
  :host([variant="outline"]:not([color]):not([color="primary"]):not([color="success"]):not([color="warning"]):not([color="danger"])[pressed]:not([loading])) [part="base"],
  :host([variant="outline"][color="default"][pressed]:not([loading])) [part="base"] {
    background: color-mix(in oklab, var(--vu-color-field) 95%, var(--vu-color-foreground) 10%);
    color: var(--vu-color-foreground);
  }
  /* Link variant: pressed = persistent thicker underline (no background change). */
  :host([variant="link"][pressed]:not([loading])) [part="base"] {
    text-decoration-thickness: var(--vu-border-width-emphasis);
  }

  /* Focus-visible — replaces UA outline with our token ring. */
  [part="base"]:focus-visible {
    outline: none;
    box-shadow: var(--vu-focus-ring);
  }

  /* Disabled — opacity + cursor; pointer-events left intact so screen readers can still read tooltips. */
  [part="base"]:disabled,
  [part="base"][aria-disabled="true"] {
    opacity: var(--vu-opacity-disabled-control);
    cursor: not-allowed;
  }

  :host([radius="full"]) [part="base"] {
    corner-shape: round;
  }

  /* Loading — spinner replaces label slot; aria-busy on host; label container fades but stays in DOM. */
  :host([loading]) [part="label"],
  :host([loading]) [part="start"],
  :host([loading]) [part="end"] {
    visibility: hidden;
  }
  [part="spinner"] {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);
    inline-size: var(--btn-spinner-size);
    block-size: var(--btn-spinner-size);
    border: max(var(--vu-space-half), calc(var(--btn-spinner-size) * 0.1)) solid currentColor;
    border-block-start-color: transparent;
    border-radius: var(--vu-radius-full);
    corner-shape: round;
    animation: vu-button-spin var(--vu-duration-spin, 750ms) linear infinite;
  }
  @keyframes vu-button-spin {
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  /* Start/end use 'contents' so empty slots add no box; slotted icons still inherit size. */
  [part="start"],
  [part="end"] {
    display: contents;
    font-size: var(--btn-icon-size);
    line-height: 1;
  }
  [part="label"] {
    display: inline-flex;
    align-items: center;
    min-inline-size: 0;
  }
  [part="label"][hidden] {
    display: none;
  }

  /* Slotted icons inherit color and clamp to the icon-size channel. */
  ::slotted(vu-icon) {
    color: inherit;
    font-size: var(--btn-icon-size);
  }

  /* Cluster mode — 'attached' + 'axis' attributes are written by
     <vu-button-group>. Flatten the corners that touch a sibling so the cluster
     reads as one surface. Logical properties = RTL-correct without extra rules. */
  :host([attached="middle"]) [part="base"] {
    border-radius: 0;
  }
  :host([attached="first"][axis="horizontal"]) [part="base"] {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }
  :host([attached="last"][axis="horizontal"]) [part="base"] {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }
  :host([attached="first"][axis="vertical"]) [part="base"] {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }
  :host([attached="last"][axis="vertical"]) [part="base"] {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }

  /* User preferences */
  @media (prefers-reduced-motion: reduce) {
    [part="base"] {
      transition-duration: var(--vu-duration-instant);
    }
    [part="base"]:active {
      transform: none;
    }
    [part="spinner"] {
      animation-duration: 0s;
    }
  }

  @media (prefers-contrast: more) {
    :host([variant="outline"]) [part="base"] {
      border-width: calc(var(--vu-border-width-emphasis) * 2);
    }
    [part="base"]:focus-visible {
      box-shadow: none;
      outline: var(--vu-border-width-emphasis) solid currentColor;
      outline-offset: var(--vu-space-half);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    [part="base"]:disabled {
      opacity: 1;
      filter: grayscale(1);
    }
    @media (hover: hover) {
      :host([variant="outline"]:not([disabled]):not([loading]):not([pressed])) [part="base"]:hover {
        background: var(--vu-color-surface-hover);
      }
      :host([variant="ghost"]:not([disabled]):not([loading]):not([pressed])) [part="base"]:hover {
        background: var(--vu-color-surface-hover);
      }
    }
  }

  @media (forced-colors: active) {
    [part="base"] {
      border: var(--vu-border-width-emphasis) solid CanvasText;
    }
    [part="base"]:focus-visible {
      outline: var(--vu-border-width-emphasis) solid CanvasText;
      outline-offset: var(--vu-space-half);
      box-shadow: none;
    }
    :host([variant="link"]) [part="base"] {
      border: 0 solid transparent;
    }
    /* Pressed in forced-colors: ALL custom backgrounds collapse to system
       colors, so without this rule pressed and unpressed look identical.
       Highlight / HighlightText is the spec-blessed pair for "selected /
       active" surfaces; aria-checked / aria-pressed already mark the state
       semantically, this just makes it visible. */
    :host([pressed]:not([loading])) [part="base"] {
      background: Highlight;
      color: HighlightText;
      forced-color-adjust: none;
    }
    :host([variant="link"][pressed]:not([loading])) [part="base"] {
      background: transparent;
      color: LinkText;
      text-decoration-thickness: var(--vu-border-width-emphasis);
    }
  }
`;
