/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-button-group",
  load: () => import("../button-group.js"),
  template: html`
    <vu-button-group label="Actions">
      <vu-button>One</vu-button>
      <vu-button>Two</vu-button>
    </vu-button-group>
  `,
});
