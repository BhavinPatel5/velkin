/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuAdaptiveItem } from "../adaptive-item.js";

tierAPerfSuite({
  id: "vu-adaptive-item",
  tag: "vu-adaptive-item",
  load: () => import("../adaptive-item.js"),
  create: async () =>
    fixture<VuAdaptiveItem>(html` <vu-adaptive-item><a href="#">Home</a></vu-adaptive-item> `),
  mutate: (el, i) => {
    const item = el as VuAdaptiveItem;
    item.size = (["sm", "md", "lg"] as const)[i % 3];
    item.disabled = i % 4 === 0;
  },
});
