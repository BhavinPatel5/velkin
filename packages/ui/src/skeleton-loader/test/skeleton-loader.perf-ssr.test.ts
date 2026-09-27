/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-skeleton-loader",
  load: () => Promise.all([import("../skeleton-loader.js"), import("../../skeleton/skeleton.js")]),
  template: html`
    <vu-skeleton-loader loading>
      <vu-skeleton slot="placeholder" variant="text"></vu-skeleton>
      <p>Loaded</p>
    </vu-skeleton-loader>
  `,
});
