/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-appbar",
  load: () => import("../appbar.js"),
  template: html`
    <vu-appbar>
      <span>Brand</span>
    </vu-appbar>
  `,
});
