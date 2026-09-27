/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-theme-provider",
  load: () => import("../theme-provider.js"),
  template: html`
    <vu-theme-provider preference="light" locale="en">
      <p>App</p>
    </vu-theme-provider>
  `,
});
