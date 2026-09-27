import { css } from "lit";

/**
 * Canonical `size` metrics for Role A (action), Role E (field), and Role D (chrome).
 * Import once per host; alias component vars (`--btn-py`, `--inp-py`, …) to `--vu-csm-*`.
 * `size` adjusts padding, type, and hit target only — never radius.
 */
export const controlSizeMetricsTokens = css`
  :host {
    /* Role A — buttons, compact actions (font-size-sm at md). */
    --vu-csm-action-py: var(--vu-space-1-5);
    --vu-csm-action-px: var(--vu-space-4);
    --vu-csm-action-gap: var(--vu-space-1-25);
    --vu-csm-action-min-block-size: var(--vu-control-height-md);
    --vu-csm-action-font-size: var(--vu-font-size-sm);
    --vu-csm-action-icon-size: var(--vu-font-size-md);
    --vu-csm-action-spinner-size: var(--vu-space-6);

    /* Role E — inputs, counters, combobox fields (font-size-md at md). */
    --vu-csm-field-py: var(--vu-space-2);
    --vu-csm-field-px: var(--vu-space-2-5);
    --vu-csm-field-gap: var(--vu-space-1-5);
    --vu-csm-field-min-block-size: var(--vu-control-height-md);
    --vu-csm-field-font-size: var(--vu-font-size-md);
    --vu-csm-field-icon-size: var(--vu-font-size-lg);
    --vu-csm-field-btn-px: var(--vu-space-2);

    /* Role D — navbar, appbar, menubar shells (taller than controls). */
    --vu-csm-chrome-min-block-size: var(--vu-chrome-height-md);
    --vu-csm-chrome-font-size: var(--vu-font-size-sm);

    /* Dismiss / close controls — one step smaller than Role A hit targets. */
    --vu-csm-dismiss-size: var(--vu-control-height-sm);
    --vu-csm-dismiss-icon-size: var(--vu-font-size-sm);
  }

  :host([size="sm"]) {
    --vu-csm-action-py: var(--vu-space-1-25);
    --vu-csm-action-px: var(--vu-space-2-5);
    --vu-csm-action-gap: var(--vu-space-1);
    --vu-csm-action-min-block-size: var(--vu-control-height-sm);
    --vu-csm-action-font-size: var(--vu-font-size-sm);
    --vu-csm-action-icon-size: var(--vu-font-size-md);
    --vu-csm-action-spinner-size: var(--vu-font-size-md);

    --vu-csm-field-py: var(--vu-space-1-25);
    --vu-csm-field-px: var(--vu-space-2);
    --vu-csm-field-min-block-size: var(--vu-control-height-sm);
    --vu-csm-field-font-size: var(--vu-font-size-sm);
    --vu-csm-field-icon-size: var(--vu-font-size-md);
    --vu-csm-field-btn-px: var(--vu-space-1-5);

    --vu-csm-chrome-min-block-size: var(--vu-chrome-height-sm);
    --vu-csm-chrome-font-size: var(--vu-font-size-xs);

    --vu-csm-dismiss-size: var(--vu-space-7);
    --vu-csm-dismiss-icon-size: var(--vu-font-size-xs);
  }

  :host([size="lg"]) {
    --vu-csm-action-py: var(--vu-space-2-5);
    --vu-csm-action-px: var(--vu-space-4-5);
    --vu-csm-action-gap: var(--vu-space-1-5);
    --vu-csm-action-min-block-size: var(--vu-control-height-lg);
    --vu-csm-action-font-size: var(--vu-font-size-lg);
    --vu-csm-action-icon-size: var(--vu-font-size-xl);
    --vu-csm-action-spinner-size: var(--vu-font-size-xl);

    --vu-csm-field-py: var(--vu-space-2-5);
    --vu-csm-field-px: var(--vu-space-3);
    --vu-csm-field-min-block-size: var(--vu-control-height-lg);
    --vu-csm-field-font-size: var(--vu-font-size-lg);
    --vu-csm-field-icon-size: var(--vu-font-size-xl);
    --vu-csm-field-btn-px: var(--vu-space-2-5);

    --vu-csm-chrome-min-block-size: var(--vu-chrome-height-lg);
    --vu-csm-chrome-font-size: var(--vu-font-size-md);

    --vu-csm-dismiss-size: var(--vu-control-height-md);
    --vu-csm-dismiss-icon-size: var(--vu-font-size-md);
  }
`;
