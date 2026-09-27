/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-adaptive-bar",
  load: () =>
    Promise.all([
      import("../adaptive-bar.js"),
      import("../../adaptive-item/adaptive-item.js"),
      import("../../icon/icon.js"),
    ]),
  template: html`
    <vu-adaptive-bar>
      <vu-adaptive-item><a href="#">Home</a></vu-adaptive-item>
    </vu-adaptive-bar>
  `,
});
