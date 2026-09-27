/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-form",
  load: () => import("../form.js"),
  template: html`
    <vu-form mode="client">
      <input name="email" />
    </vu-form>
  `,
});
