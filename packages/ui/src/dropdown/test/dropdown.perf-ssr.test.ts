/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-dropdown",
  load: () => import("../dropdown.js"),
  template: html`
    <vu-dropdown>
      <button slot="trigger">Menu</button>
      <vu-dropdown-item label="One"></vu-dropdown-item>
    </vu-dropdown>
  `,
});
