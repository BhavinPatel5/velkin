/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuColorSwatch } from "../color-swatch.js";

tierAPerfSuite({
  id: "vu-color-swatch",
  tag: "vu-color-swatch",
  load: () => import("../color-swatch.js"),
  create: async () =>
    fixture<VuColorSwatch>(
      html`<vu-color-swatch color="#3b82f6" selectable selected></vu-color-swatch>`,
    ),
  mutate: (el, i) => {
    const host = el as VuColorSwatch;
    host.color = i % 2 === 0 ? "#ef4444" : "#22c55e";
    host.selected = i % 3 === 0;
    host.checkerboard = i % 4 === 0;
    host.disabled = i % 5 === 0;
  },
});
