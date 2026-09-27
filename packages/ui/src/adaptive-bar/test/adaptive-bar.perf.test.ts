/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuAdaptiveBar } from "../adaptive-bar.js";

tierAPerfSuite({
  id: "vu-adaptive-bar",
  tag: "vu-adaptive-bar",
  load: () =>
    Promise.all([
      import("../adaptive-bar.js"),
      import("../../adaptive-item/adaptive-item.js"),
      import("../../icon/icon.js"),
    ]),
  create: async () =>
    fixture<VuAdaptiveBar>(html`
      <vu-adaptive-bar>
        <vu-adaptive-item><a href="#">Home</a></vu-adaptive-item>
        <vu-adaptive-item><a href="#">Settings</a></vu-adaptive-item>
      </vu-adaptive-bar>
    `),
  mutate: (el, i) => {
    const host = el as VuAdaptiveBar;
    host.justify = i % 2 === 0 ? "start" : "end";
    host.gapThreshold = i % 5;
  },
});
