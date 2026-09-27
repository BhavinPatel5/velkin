/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuColorPicker } from "../color-picker.js";

tierAPerfSuite({
  id: "vu-color-picker",
  tag: "vu-color-picker",
  load: () => import("../color-picker.js"),
  create: async () =>
    fixture<VuColorPicker>(
      html`<vu-color-picker label="Brand" value="#3b82f6" showalpha></vu-color-picker>`,
    ),
  mutate: (el, i) => {
    const host = el as VuColorPicker;
    host.value = i % 2 === 0 ? "#ef4444" : "#22c55e";
    host.format = i % 3 === 0 ? "rgb" : "hex";
    host.showAlpha = i % 4 !== 0;
    host.disabled = i % 7 === 0;
  },
});
