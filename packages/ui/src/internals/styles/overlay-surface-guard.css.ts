import { css } from "lit";

/** Keeps closed `<dialog>` / `[popover]` surfaces hidden when author CSS sets `display`. */
export const overlaySurfaceGuard = css`
  dialog:not([open]) {
    display: none;
  }

  [popover]:not(:popover-open) {
    display: none;
  }
`;
