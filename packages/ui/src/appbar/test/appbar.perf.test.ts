/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuAppbar } from "../appbar.js";

tierAPerfSuite({
  id: "vu-appbar",
  tag: "vu-appbar",
  load: () => import("../appbar.js"),
  create: async () =>
    fixture<VuAppbar>(html`
      <vu-appbar>
        <button slot="start" aria-label="Menu">M</button>
        <span>Brand</span>
        <button slot="end" aria-label="Profile">P</button>
      </vu-appbar>
    `),
  mutate: (el, i) => {
    const host = el as VuAppbar;
    host.variant = i % 2 === 0 ? "flat" : "elevated";
    host.sticky = i % 3 === 0;
    host.autohide = i % 4 === 0;
  },
});
