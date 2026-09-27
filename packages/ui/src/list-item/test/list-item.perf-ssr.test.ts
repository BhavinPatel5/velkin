/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-listitem",
  load: () => import("../list-item.js"),
  template: html`<vu-listitem label="Alpha" hint="Secondary" value="a"></vu-listitem>`,
});
