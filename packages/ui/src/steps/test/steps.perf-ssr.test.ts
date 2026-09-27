/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-steps",
  load: () => Promise.all([import("../steps.js"), import("../../icon/icon.js")]),
  template: html`<vu-steps
    .steps=${[
      { label: "Account", subtitle: "Sign in" },
      { label: "Shipping", subtitle: "Delivery" },
    ]}
    currentstep="1"
    label="Checkout"
  ></vu-steps>`,
});
