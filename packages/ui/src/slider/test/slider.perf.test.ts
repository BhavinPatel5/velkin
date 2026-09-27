/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuSlider } from "../slider.js";

tierAPerfSuite({
  id: "vu-slider",
  tag: "vu-slider",
  load: () => import("../slider.js"),
  create: async () => fixture<VuSlider>(html`<vu-slider label="Volume"></vu-slider>`),
  mutate: (el, i) => {
    (el as VuSlider).value = i % 100;
  },
});
