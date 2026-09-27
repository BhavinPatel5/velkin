/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-config-provider",
  load: () => import("../config-provider.js"),
  template: html`<vu-config-provider><p>App</p></vu-config-provider>`,
});
