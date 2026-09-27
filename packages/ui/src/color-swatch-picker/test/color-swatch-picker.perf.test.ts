/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuColorSwatchPicker } from "../color-swatch-picker.js";

tierAPerfSuite({
  id: "vu-color-swatch-picker",
  tag: "vu-color-swatch-picker",
  load: () => import("../color-swatch-picker.js"),
  create: async () =>
    fixture<VuColorSwatchPicker>(
      html`<vu-color-swatch-picker
        label="Theme"
        value="#0f0"
        .colors=${["#f00", "#0f0", "#00f", "#ff0"]}
      ></vu-color-swatch-picker>`,
    ),
  mutate: (el, i) => {
    const host = el as VuColorSwatchPicker;
    host.value = i % 2 === 0 ? "#f00" : "#0f0";
    host.layout = i % 3 === 0 ? "stack" : "grid";
    host.columns = i % 4;
    host.disabled = i % 7 === 0;
  },
});
