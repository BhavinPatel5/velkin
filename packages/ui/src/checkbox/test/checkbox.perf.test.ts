/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuCheckbox } from "../checkbox.js";

tierAPerfSuite({
  id: "vu-checkbox",
  tag: "vu-checkbox",
  load: () => import("../checkbox.js"),
  create: async () => fixture<VuCheckbox>(html`<vu-checkbox label="Agree">Label</vu-checkbox>`),
  mutate: (el, i) => {
    (el as VuCheckbox).checked = i % 2 === 0;
  },
});
