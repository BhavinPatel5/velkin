/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-checkbox-group",
  load: () => import("../checkbox-group.js"),
  template: html`
    <vu-checkbox-group label="Channels" legend="Pick any">
      <vu-checkbox value="a" label="Email"></vu-checkbox>
      <vu-checkbox value="b" label="SMS"></vu-checkbox>
    </vu-checkbox-group>
  `,
});
