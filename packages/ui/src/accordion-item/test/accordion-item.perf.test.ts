/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { stubPrefersReducedMotion } from "../../../internals/test/prefers-reduced-motion.js";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuAccordionItem } from "../accordion-item.js";

beforeAll(() => {
  stubPrefersReducedMotion();
});

tierAPerfSuite({
  id: "vu-accordion-item",
  tag: "vu-accordion-item",
  load: () =>
    Promise.all([
      import("../accordion-item.js"),
      import("../../icon/icon.js"),
    ]),
  create: async () =>
    fixture<VuAccordionItem>(html`
      <vu-accordion-item open>
        <span slot="title">Section</span>
        <div slot="body">Content</div>
      </vu-accordion-item>
    `),
  mutate: (el, i) => {
    (el as VuAccordionItem).disabled = i % 2 === 0;
  },
});
