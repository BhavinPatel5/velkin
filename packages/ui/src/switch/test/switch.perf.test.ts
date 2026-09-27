/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuSwitch } from "../switch.js";

tierAPerfSuite({
  id: "vu-switch",
  tag: "vu-switch",
  load: () => import("../switch.js"),
  create: async () => fixture<VuSwitch>(html`<vu-switch label="Alerts"></vu-switch>`),
  mutate: (el, i) => {
    (el as VuSwitch).checked = i % 2 === 0;
  },
});
