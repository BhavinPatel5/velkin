/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { stubPrefersReducedMotion } from "../../../internals/test/prefers-reduced-motion.js";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuDrawer } from "../drawer.js";

beforeAll(() => {
  stubPrefersReducedMotion();
});

tierAPerfSuite({
  id: "vu-drawer",
  tag: "vu-drawer",
  load: () => import("../drawer.js"),
  create: async () =>
    fixture<VuDrawer>(html`
      <vu-drawer open arialabel="Navigation" closable side="left" variant="elevated">
        <h2 slot="header">Menu</h2>
        <p slot="body">Drawer body copy.</p>
        <span slot="footer">Actions</span>
      </vu-drawer>
    `),
  mutate: (el, i) => {
    const host = el as VuDrawer;
    host.side = i % 3 === 0 ? "right" : "left";
    host.variant = i % 4 === 0 ? "outline" : "elevated";
    host.divider = i % 5 === 0;
    host.closable = i % 6 !== 0;
  },
});
