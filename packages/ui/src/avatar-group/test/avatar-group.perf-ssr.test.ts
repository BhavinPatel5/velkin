/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-avatar-group",
  load: () => import("../avatar-group.js"),
  template: html`
    <vu-avatar-group max="2">
      <vu-avatar name="A"></vu-avatar>
      <vu-avatar name="B"></vu-avatar>
      <vu-avatar name="C"></vu-avatar>
    </vu-avatar-group>
  `,
});
