/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuSerial } from "../serial.js";

tierAPerfSuite({
  id: "vu-serial",
  tag: "vu-serial",
  load: () => import("../serial.js"),
  create: async () => fixture<VuSerial>(html`<vu-serial label="Key"></vu-serial>`),
  mutate: (el, i) => {
    (el as VuSerial).value = `k${i}`;
  },
});
