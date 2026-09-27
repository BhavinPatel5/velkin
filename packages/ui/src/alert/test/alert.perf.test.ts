/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuAlert } from "../alert.js";

const COLORS = ["default", "primary", "success", "warning", "danger"] as const;

tierAPerfSuite({
  id: "vu-alert",
  tag: "vu-alert",
  load: () => Promise.all([import("../alert.js"), import("../../icon/icon.js")]),
  create: async () =>
    fixture<VuAlert>(html` <vu-alert heading="Notice" message="Something happened."></vu-alert> `),
  mutate: (el, i) => {
    const host = el as VuAlert;
    host.color = COLORS[i % COLORS.length];
    host.removable = i % 2 === 0;
  },
});
