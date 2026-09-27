/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuRange } from "../range.js";

tierAPerfSuite({
  id: "vu-range",
  tag: "vu-range",
  load: () => import("../range.js"),
  create: async () => fixture<VuRange>(html`<vu-range label="Budget"></vu-range>`),
  mutate: (el, i) => {
    (el as VuRange).from = i % 40;
    (el as VuRange).to = 60 + (i % 40);
  },
});
