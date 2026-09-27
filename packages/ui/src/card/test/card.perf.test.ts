/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuCard } from "../card.js";

tierAPerfSuite({
  id: "vu-card",
  tag: "vu-card",
  load: () => import("../card.js"),
  create: async () =>
    fixture<VuCard>(html`
      <vu-card variant="elevated" interactive label="Pro plan">
        <h3 slot="header">Pro</h3>
        <p>Body copy for the card.</p>
        <span slot="footer">Action</span>
      </vu-card>
    `),
  mutate: (el, i) => {
    const host = el as VuCard;
    host.variant = i % 2 === 0 ? "outline" : "elevated";
    host.tone = i % 3 === 0 ? "strong" : "normal";
    host.selected = i % 4 === 0;
    host.disabled = i % 5 === 0;
  },
});
