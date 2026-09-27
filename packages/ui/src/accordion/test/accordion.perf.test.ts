/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuAccordion } from "../accordion.js";
import type { VuAccordionVariant } from "../accordion.types.js";

const VARIANTS: VuAccordionVariant[] = ["light", "solid", "outline", "split", "splitted"];
const TONES = ["subtle", "normal", "strong"] as const;

tierAPerfSuite({
  id: "vu-accordion",
  tag: "vu-accordion",
  load: () =>
    Promise.all([
      import("../accordion.js"),
      import("../../accordion-item/accordion-item.js"),
      import("../../icon/icon.js"),
    ]),
  create: async () =>
    fixture<VuAccordion>(html`
      <vu-accordion>
        <vu-accordion-item>
          <span slot="title">Section</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      </vu-accordion>
    `),
  mutate: (el, i) => {
    const host = el as VuAccordion;
    host.variant = VARIANTS[i % VARIANTS.length];
    host.tone = TONES[i % TONES.length];
    host.flush = i % 2 === 0;
  },
});
