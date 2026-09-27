/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuDropdownItem } from "../dropdown-item.js";
import "../../icon/icon.js";

tierAPerfSuite({
  id: "vu-dropdown-item",
  tag: "vu-dropdown-item",
  load: () => import("../dropdown-item.js"),
  create: async () =>
    fixture<VuDropdownItem>(html`
      <vu-dropdown-item
        label="Save"
        hint="Writes to disk"
        shortcut="⌘S"
        starticon="mdi:content-save"
      ></vu-dropdown-item>
    `),
  mutate: (el, i) => {
    const host = el as VuDropdownItem;
    host.selected = i % 2 === 0;
    host.disabled = i % 3 === 0;
    host.color = i % 4 === 0 ? "danger" : "default";
    host.size = i % 5 === 0 ? "lg" : "md";
  },
});
