/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-theme-switcher",
  load: () =>
    Promise.all([
      import("../theme-switcher.js"),
      import("../../theme-provider/theme-provider.js"),
      import("../../button/button.js"),
      import("../../icon/icon.js"),
    ]),
  template: html`
    <vu-theme-provider preference="light" .persist=${false}>
      <vu-theme-switcher></vu-theme-switcher>
    </vu-theme-provider>
  `,
});
