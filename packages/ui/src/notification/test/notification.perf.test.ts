/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { fixture, html } from "@open-wc/testing";
import { PERF_BUDGETS } from "../../../internals/test/performance-budgets.js";
import { measureUpdate100 } from "../../../internals/test/performance-harness.js";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuNotification } from "../notification.js";

tierAPerfSuite({
  id: "vu-notification",
  tag: "vu-notification",
  load: () =>
    Promise.all([
      import("../notification.js"),
      import("../../icon/icon.js"),
      import("../../button/button.js"),
    ]),
  create: async () => fixture<VuNotification>(html`<vu-notification></vu-notification>`),
  mutate: (el, i) => {
    const host = el as VuNotification;
    host.position = i % 2 === 0 ? "bottom-end" : "top-end";
    host.layout = i % 3 === 0 ? "stack" : "list";
    host.variant = i % 4 === 0 ? "soft" : "flat";
    host.maxVisible = i % 5 === 0 ? 3 : 5;
  },
});

describe("perf vu-notification stack layout", () => {
  it("100 stack updates within budget", async () => {
    const budget = PERF_BUDGETS["vu-notification"];
    const ms = await measureUpdate100({
      tag: "vu-notification",
      load: () =>
        Promise.all([
          import("../notification.js"),
          import("../../icon/icon.js"),
          import("../../button/button.js"),
        ]),
      create: async () =>
        fixture<VuNotification>(html`<vu-notification layout="stack"></vu-notification>`),
      mutate: (el, i) => {
        const host = el as VuNotification;
        host.visibleToasts = (i % 3) + 1;
        host.withOverflowCount = i % 2 === 0;
      },
    });
    expect(ms).toBeLessThanOrEqual(budget.update100Ms * 1.5);
  });
});
