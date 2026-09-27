/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuOverlay } from "../overlay.js";

tierAPerfSuite({
  id: "vu-overlay",
  tag: "vu-overlay",
  load: () => import("../overlay.js"),
  create: async () => fixture<VuOverlay>(html`<vu-overlay></vu-overlay>`),
  mutate: (el, i) => {
    (el as VuOverlay).open = i % 2 === 0;
  },
});
