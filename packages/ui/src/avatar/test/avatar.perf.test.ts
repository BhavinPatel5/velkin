/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuAvatar } from "../avatar.js";

tierAPerfSuite({
  id: "vu-avatar",
  tag: "vu-avatar",
  load: () => import("../avatar.js"),
  create: async () =>
    fixture<VuAvatar>(html`<vu-avatar name="Jane Doe" color="primary" bordered></vu-avatar>`),
  mutate: (el, i) => {
    const host = el as VuAvatar;
    host.size = i % 2 === 0 ? "sm" : "lg";
    host.color = i % 3 === 0 ? "success" : "primary";
    host.bordered = i % 4 === 0;
    host.disabled = i % 5 === 0;
  },
});
