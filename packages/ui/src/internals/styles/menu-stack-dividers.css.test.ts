import { describe, expect, it } from "vitest";
import {
  menuStackDividerHost,
  menuStackDividerRow,
  menuStackGap,
} from "./menu-stack-dividers.css.js";

describe("menuStackDividers", () => {
  it("exports gap cancellation rules for flex stacks", () => {
    const gap = String(menuStackGap);
    const host = String(menuStackDividerHost);
    const row = String(menuStackDividerRow);

    expect(gap).toContain("--menu-stack-gap");
    expect(host).toContain("margin-block: calc(-0.5 * var(--menu-stack-gap");
    expect(host).toContain("--divider-margin: 0");
    expect(row).toContain("margin-block: calc(-0.5 * var(--menu-stack-gap");
  });
});
