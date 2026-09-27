/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuOtp } from "../otp.js";

tierAPerfSuite({
  id: "vu-otp",
  tag: "vu-otp",
  load: () => import("../otp.js"),
  create: async () => fixture<VuOtp>(html`<vu-otp label="Code"></vu-otp>`),
  mutate: (el, i) => {
    (el as VuOtp).value = String(i % 10).repeat(4);
  },
});
