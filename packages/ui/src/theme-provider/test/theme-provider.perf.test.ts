/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuThemeProvider } from "../theme-provider.js";

tierAPerfSuite({
  id: "vu-theme-provider",
  tag: "vu-theme-provider",
  load: () => import("../theme-provider.js"),
  create: async () =>
    fixture<VuThemeProvider>(html`
      <vu-theme-provider preference="light" locale="en" .persist=${false}>
        <span>App</span>
      </vu-theme-provider>
    `),
  mutate: (el, i) => {
    (el as VuThemeProvider).locale = i % 2 === 0 ? "en" : "de";
  },
});
