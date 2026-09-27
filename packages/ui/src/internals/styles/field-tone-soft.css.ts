import { css } from "lit";
import { surfaceToneInteractionHost } from "./surface-tone-interaction.css.js";

/** Role E `[tone]` soft fills — map `--fc-soft*` to a component prefix in `*.style.ts`. */
export const fieldToneSoftHost = css`
  ${surfaceToneInteractionHost}

  :host {
    --fc-soft: var(--vu-color-field-hover);
    --fc-soft-fg: var(--vu-color-field-foreground);
    --fc-soft-hover: var(--vu-color-field-active);
  }

  :host([tone="subtle"]) {
    --fc-soft: var(--vu-color-surface-secondary);
    --fc-soft-fg: var(--vu-color-surface-secondary-foreground);
    --fc-soft-hover: color-mix(
      in oklab,
      var(--vu-color-surface-secondary) 92%,
      var(--vu-color-surface-secondary-foreground) 8%
    );
  }

  :host([tone="strong"]) {
    --fc-soft: var(--vu-color-surface-tertiary);
    --fc-soft-fg: var(--vu-color-surface-tertiary-foreground);
    --fc-soft-hover: color-mix(
      in oklab,
      var(--vu-color-surface-tertiary) 92%,
      var(--vu-color-surface-tertiary-foreground) 8%
    );
  }
`;
