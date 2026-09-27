/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuSteps } from "../steps.js";
import "../../icon/icon.js";
import "../../step-item/step-item.js";

tierAPerfSuite({
  id: "vu-steps",
  tag: "vu-steps",
  load: () =>
    Promise.all([
      import("../steps.js"),
      import("../../step-item/step-item.js"),
      import("../../icon/icon.js"),
    ]),
  create: async () =>
    fixture<VuSteps>(html`
      <vu-steps currentstep="1">
        <vu-step-item label="Account">Panel one</vu-step-item>
        <vu-step-item label="Shipping">Panel two</vu-step-item>
        <vu-step-item label="Payment">Panel three</vu-step-item>
      </vu-steps>
    `),
  mutate: (el, i) => {
    (el as VuSteps).currentStep = (i % 3) + 1;
  },
});
