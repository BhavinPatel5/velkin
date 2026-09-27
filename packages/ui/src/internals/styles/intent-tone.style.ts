import { css } from "lit";

/**
 * Mixes `--intent-strong` / `--intent-soft` from `-raw` sources when `[tone]` is set.
 * Each host must bridge: `--intent-strong-raw` ← `*‑strong-raw`, same for soft + fg pairs,
 * then `*‑strong: var(--intent-strong)` and `*‑soft: var(--intent-soft)`.
 */
export const intentToneStyles = css`
  :host {
    --intent-strong: var(--intent-strong-raw);
    --intent-soft: var(--intent-soft-raw);
  }

  :host([tone="subtle"]) {
    --intent-strong: color-mix(in oklab, var(--intent-strong-raw) 84%, transparent);
    --intent-soft: color-mix(in oklab, var(--intent-soft-raw) 46%, transparent);
  }

  :host([tone="strong"]) {
    --intent-strong: color-mix(in oklab, var(--intent-strong-raw) 94%, var(--intent-strong-fg) 6%);
    --intent-soft: color-mix(in oklab, var(--intent-soft-raw) 74%, var(--intent-soft-fg) 14%);
  }
`;
