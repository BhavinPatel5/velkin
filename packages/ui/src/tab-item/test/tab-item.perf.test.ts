/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuTabItem } from "../tab-item.js";

tierAPerfSuite({
  id: "vu-tab-item",
  tag: "vu-tab-item",
  load: () => Promise.all([import("../tab-item.js"), import("../../icon/icon.js")]),
  create: async () => fixture<VuTabItem>(html`<vu-tab-item label="Tab" value="a"></vu-tab-item>`),
  mutate: (el, i) => {
    (el as VuTabItem).label = `Tab ${i}`;
  },
});
