/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { stubPrefersReducedMotion } from "../../../internals/test/prefers-reduced-motion.js";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuDialog } from "../dialog.js";

beforeAll(() => {
  stubPrefersReducedMotion();
});

tierAPerfSuite({
  id: "vu-dialog",
  tag: "vu-dialog",
  load: () => import("../dialog.js"),
  create: async () =>
    fixture<VuDialog>(html`
      <vu-dialog open arialabel="Confirm" closable variant="elevated">
        <h2 slot="header">Title</h2>
        <p slot="body">Body copy for the dialog.</p>
        <span slot="footer">Actions</span>
      </vu-dialog>
    `),
  mutate: (el, i) => {
    const host = el as VuDialog;
    host.variant = i % 3 === 0 ? "outline" : "elevated";
    host.size = i % 2 === 0 ? "sm" : "lg";
    host.tone = i % 4 === 0 ? "strong" : "normal";
    host.divider = i % 5 === 0;
    host.closable = i % 6 !== 0;
  },
});
