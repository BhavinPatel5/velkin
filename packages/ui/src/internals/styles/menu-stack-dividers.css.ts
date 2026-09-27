import { css } from "lit";

/** Flex column `gap` token for stacks that include `vu-divider` rows. */
export const menuStackGap = css`
  --menu-stack-gap: var(--vu-space-half);
`;

/** `vu-divider` direct child — cancels adjacent flex `gap` doubling. */
export const menuStackDividerHost = css`
  --divider-margin: 0 var(--menu-stack-divider-inset-inline, var(--vu-space-2));
  margin-block: calc(-0.5 * var(--menu-stack-gap, var(--vu-space-half)));
`;

/** Wrapper row (`li`, etc.) around `vu-divider` in a gap stack. */
export const menuStackDividerRow = css`
  list-style: none;
  margin-block: calc(-0.5 * var(--menu-stack-gap, var(--vu-space-half)));
  padding: 0;
  --divider-margin: 0;
`;
