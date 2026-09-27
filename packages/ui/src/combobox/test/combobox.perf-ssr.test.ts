/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-combobox",
  load: () =>
    Promise.all([
      import("../combobox.js"),
      import("../../icon/icon.js"),
      import("../../checkbox/checkbox.js"),
    ]),
  template: html`<vu-combobox label="Fruit"></vu-combobox>`,
});
