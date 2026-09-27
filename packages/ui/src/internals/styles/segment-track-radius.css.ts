import { css } from "lit";

/**
 * Padded segmented track — host sets `--segment-radius` and `--segment-track-pad`
 * before importing (tab maps `--tab-radius` / `--tab-pad`).
 * Must be nested inside `:host` or a class rule — never at stylesheet root before another `:host`.
 */
export const segmentTrackRadiusTokens = css`
  --segment-item-radius: max(
    0px,
    calc(var(--segment-radius, var(--vu-control-radius-md)) - var(--segment-track-pad, 0px))
  );
  --segment-track-radius: calc(var(--segment-item-radius) + var(--segment-track-pad, 0px));
`;
