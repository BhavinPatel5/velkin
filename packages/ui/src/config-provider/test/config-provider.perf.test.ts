/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuConfigProvider } from "../config-provider.js";

tierAPerfSuite({
  id: "vu-config-provider",
  tag: "vu-config-provider",
  load: () => import("../config-provider.js"),
  create: async () => fixture<VuConfigProvider>(html`<vu-config-provider></vu-config-provider>`),
  mutate: (el, i) => {
    (el as VuConfigProvider).presets = {
      defaults: { "vu-button": { size: i % 2 === 0 ? "sm" : "md" } },
    };
  },
});
