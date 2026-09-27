/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { stubPrefersReducedMotion } from "../../../internals/test/prefers-reduced-motion.js";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuSpeeddial } from "../speeddial.js";

beforeAll(() => {
  stubPrefersReducedMotion();
});

tierAPerfSuite({
  id: "vu-speeddial",
  tag: "vu-speeddial",
  load: () => import("../speeddial.js"),
  create: async () =>
    fixture<VuSpeeddial>(html`<vu-speeddial open label="Actions"></vu-speeddial>`),
  mutate: (el, i) => {
    const host = el as VuSpeeddial;
    host.direction = i % 2 === 0 ? "top" : "bottom";
    host.color = i % 3 === 0 ? "success" : "primary";
    host.size = i % 4 === 0 ? "lg" : "md";
  },
});
