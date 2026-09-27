/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuBreadcrumbItem } from "../breadcrumb-item.js";

tierAPerfSuite({
  id: "vu-breadcrumb-item",
  tag: "vu-breadcrumb-item",
  load: () => import("../breadcrumb-item.js"),
  create: async () =>
    fixture<VuBreadcrumbItem>(html`
      <vu-breadcrumb-item href="/docs" size="md">Documentation</vu-breadcrumb-item>
    `),
  mutate: (el, i) => {
    const host = el as VuBreadcrumbItem;
    host.setAttribute("size", i % 2 === 0 ? "sm" : "lg");
    host.current = i % 3 === 0;
    host.disabled = i % 4 === 0;
    host.href = i % 5 === 0 ? "/guides" : "/docs";
  },
});
