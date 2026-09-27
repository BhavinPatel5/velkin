/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuColorSlider } from "../color-slider.js";

tierAPerfSuite({
  id: "vu-color-slider",
  tag: "vu-color-slider",
  load: () => import("../color-slider.js"),
  create: async () =>
    fixture<VuColorSlider>(
      html`<vu-color-slider channel="hue" value="hsl(200 80% 50%)"></vu-color-slider>`,
    ),
  mutate: (el, i) => {
    const host = el as VuColorSlider;
    host.value = i % 2 === 0 ? "hsl(120 90% 45%)" : "hsl(280 70% 55%)";
    host.channel = i % 3 === 0 ? "saturation" : "hue";
    host.orientation = i % 4 === 0 ? "vertical" : "horizontal";
    host.disabled = i % 7 === 0;
  },
});
