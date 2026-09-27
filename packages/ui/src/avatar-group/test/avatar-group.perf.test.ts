/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuAvatarGroup } from "../avatar-group.js";

tierAPerfSuite({
  id: "vu-avatar-group",
  tag: "vu-avatar-group",
  load: () => import("../avatar-group.js"),
  create: async () =>
    fixture<VuAvatarGroup>(html`
      <vu-avatar-group max="3" total="8">
        <vu-avatar name="A"></vu-avatar>
        <vu-avatar name="B"></vu-avatar>
        <vu-avatar name="C"></vu-avatar>
        <vu-avatar name="D"></vu-avatar>
        <vu-avatar name="E"></vu-avatar>
      </vu-avatar-group>
    `),
  mutate: (el, i) => {
    const host = el as VuAvatarGroup;
    host.size = i % 2 === 0 ? "sm" : "lg";
    host.spacing = i % 3 === 0 ? "lg" : "md";
    host.max = i % 4 === 0 ? 2 : 3;
    host.disabled = i % 5 === 0;
  },
});
