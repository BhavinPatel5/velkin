/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuBadge } from "../badge.js";

tierAPerfSuite({
  id: "vu-badge",
  tag: "vu-badge",
  load: () => import("../badge.js"),
  create: async () =>
    fixture<VuBadge>(html`
      <vu-badge value="12" color="danger" placement="top-right" processing bordered>
        <button>Inbox</button>
      </vu-badge>
    `),
  mutate: (el, i) => {
    const host = el as VuBadge;
    host.value = String((i % 150) + 1);
    host.color = i % 2 === 0 ? "primary" : "danger";
    host.show = i % 3 !== 0;
    host.processing = i % 4 === 0;
    host.disabled = i % 5 === 0;
  },
});
