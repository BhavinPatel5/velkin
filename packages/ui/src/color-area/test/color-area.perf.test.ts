/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuColorArea } from "../color-area.js";

tierAPerfSuite({
  id: "vu-color-area",
  tag: "vu-color-area",
  load: () => import("../color-area.js"),
  create: async () =>
    fixture<VuColorArea>(
      html`<vu-color-area hue="200" saturation="80" brightness="90"></vu-color-area>`,
    ),
  mutate: (el, i) => {
    const host = el as VuColorArea;
    host.saturation = 50 + (i % 40);
    host.brightness = 40 + (i % 50);
    host.hue = (host.hue + (i % 7)) % 360;
    host.disabled = i % 11 === 0;
  },
});
