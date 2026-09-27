/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuThemeSwitcher } from "../theme-switcher.js";

tierAPerfSuite({
  id: "vu-theme-switcher",
  tag: "vu-theme-switcher",
  load: () =>
    Promise.all([
      import("../theme-switcher.js"),
      import("../../theme-provider/theme-provider.js"),
      import("../../button/button.js"),
      import("../../icon/icon.js"),
    ]),
  create: async () => fixture<VuThemeSwitcher>(html`<vu-theme-switcher></vu-theme-switcher>`),
  mutate: (el, i) => {
    (el as VuThemeSwitcher).disabled = i % 2 === 0;
  },
});
