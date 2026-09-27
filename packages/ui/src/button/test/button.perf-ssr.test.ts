/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-button",
  load: () => Promise.all([import("../button.js"), import("../../icon/icon.js")]),
  template: html`<vu-button>Save</vu-button>`,
});
