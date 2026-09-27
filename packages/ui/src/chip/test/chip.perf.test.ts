/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuChip } from "../chip.js";

tierAPerfSuite({
  id: "vu-chip",
  tag: "vu-chip",
  load: () => import("../chip.js"),
  create: async () =>
    fixture<VuChip>(html`<vu-chip label="Filter" removable color="primary"></vu-chip>`),
  mutate: (el, i) => {
    const host = el as VuChip;
    host.selected = i % 2 === 0;
    host.variant = i % 3 === 0 ? "outline" : "soft";
    host.color = i % 4 === 0 ? "success" : "primary";
    host.disabled = i % 5 === 0;
  },
});
