import { css } from "lit";

/** Host `[tone]` hover/active + surface stack for nested list/table/tree children. */
export const surfaceToneInteractionHost = css`
  :host {
    --surface-tone-hover: var(--vu-color-surface-hover);
    --surface-tone-active: var(--vu-color-surface-active);
    --host-surface-bg: var(--vu-color-surface);
    --host-surface-header-bg: var(--vu-color-surface-secondary);
  }

  :host([tone="subtle"]) {
    --surface-tone-hover: color-mix(
      in oklab,
      var(--vu-color-surface-secondary) 92%,
      var(--vu-color-surface-secondary-foreground) 8%
    );
    --surface-tone-active: color-mix(
      in oklab,
      var(--vu-color-surface-secondary) 84%,
      var(--vu-color-surface-secondary-foreground) 16%
    );
    --host-surface-bg: var(--vu-color-surface-secondary);
    --host-surface-header-bg: color-mix(
      in oklab,
      var(--vu-color-surface-secondary) 92%,
      var(--vu-color-surface-secondary-foreground) 8%
    );
  }

  :host([tone="strong"]) {
    --surface-tone-hover: color-mix(
      in oklab,
      var(--vu-color-surface-tertiary) 92%,
      var(--vu-color-surface-tertiary-foreground) 8%
    );
    --surface-tone-active: color-mix(
      in oklab,
      var(--vu-color-surface-tertiary) 84%,
      var(--vu-color-surface-tertiary-foreground) 16%
    );
    --host-surface-bg: var(--vu-color-surface-tertiary);
    --host-surface-header-bg: color-mix(
      in oklab,
      var(--vu-color-surface-tertiary) 92%,
      var(--vu-color-surface-tertiary-foreground) 8%
    );
  }
`;

/** Relay host surface/hover to common light-DOM children inside Role C/D shells. */
export const surfaceToneChildRelay = css`
  ::slotted(vu-list),
  ::slotted(vu-listitem),
  ::slotted(vu-tree),
  ::slotted(vu-data-table),
  ::slotted(vu-nav-panel),
  ::slotted(vu-pagination) {
    --list-surface-bg: var(--host-surface-bg);
    --dt-row-bg: var(--host-surface-bg);
    --dt-header-bg: var(--host-surface-header-bg);
    --tree-row-bg: var(--host-surface-bg);
  }
`;
