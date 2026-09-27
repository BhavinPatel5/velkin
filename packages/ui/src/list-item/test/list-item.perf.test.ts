/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuListitem } from "../list-item.js";

tierAPerfSuite({
  id: "vu-listitem",
  tag: "vu-listitem",
  load: () => import("../list-item.js"),
  create: async () =>
    fixture<VuListitem>(html`<vu-listitem label="Alpha" hint="Secondary" value="a"></vu-listitem>`),
  mutate: (el, i) => {
    const host = el as VuListitem;
    host.selected = i % 2 === 0;
    host.disabled = i % 3 === 0;
    host.dense = i % 4 === 0;
    host.size = i % 5 === 0 ? "lg" : "md";
    host.label = i % 2 === 0 ? "Alpha" : `Item ${i}`;
  },
});
