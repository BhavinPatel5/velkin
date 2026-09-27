/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuDropdown } from "../dropdown.js";
import "../../dropdown-item/dropdown-item.js";
import "../../button/button.js";

tierAPerfSuite({
  id: "vu-dropdown",
  tag: "vu-dropdown",
  load: () => import("../dropdown.js"),
  create: async () =>
    fixture<VuDropdown>(html`
      <vu-dropdown size="md" variant="elevated">
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="One" value="one"></vu-dropdown-item>
        <vu-dropdown-item label="Two" value="two"></vu-dropdown-item>
      </vu-dropdown>
    `),
  mutate: (el, i) => {
    const host = el as VuDropdown;
    host.open = i % 2 === 0;
    host.variant = i % 3 === 0 ? "outline" : "elevated";
    host.size = i % 4 === 0 ? "lg" : "md";
    host.disabled = i % 5 === 0;
  },
});
