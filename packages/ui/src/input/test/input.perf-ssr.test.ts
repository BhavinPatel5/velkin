/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-input",
  load: () => Promise.all([import("../input.js"), import("../../icon/icon.js")]),
  template: html`<vu-input label="Name" placeholder="Enter name"></vu-input>`,
});
