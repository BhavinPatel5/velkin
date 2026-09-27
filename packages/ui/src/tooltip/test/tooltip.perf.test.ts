/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuTooltip } from "../tooltip.js";

tierAPerfSuite({
  id: "vu-tooltip",
  tag: "vu-tooltip",
  load: () => import("../tooltip.js"),
  create: async () => fixture<VuTooltip>(html`<vu-tooltip label="Hint"></vu-tooltip>`),
  mutate: (el, i) => {
    (el as VuTooltip).open = i % 2 === 0;
  },
});
