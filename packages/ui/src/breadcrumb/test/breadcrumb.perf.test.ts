/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuBreadcrumb } from "../breadcrumb.js";
import "../../breadcrumb-item/breadcrumb-item.js";

tierAPerfSuite({
  id: "vu-breadcrumb",
  tag: "vu-breadcrumb",
  load: () =>
    Promise.all([
      import("../breadcrumb.js"),
      import("../../breadcrumb-item/breadcrumb-item.js"),
    ]),
  create: async () =>
    fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="4" itemsbefore="1" itemsafter="1">
        <vu-breadcrumb-item href="/">Home</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/docs">Docs</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/guides">Guides</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/api">API</vu-breadcrumb-item>
        <vu-breadcrumb-item current>Current</vu-breadcrumb-item>
      </vu-breadcrumb>
    `),
  mutate: (el, i) => {
    const host = el as VuBreadcrumb;
    host.size = i % 2 === 0 ? "sm" : "lg";
    host.disabled = i % 5 === 0;
  },
});
