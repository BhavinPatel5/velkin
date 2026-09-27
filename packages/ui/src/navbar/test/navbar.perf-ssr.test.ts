/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-navbar",
  load: () => import("../navbar.js"),
  template: html`<vu-navbar
    .items=${[
      { id: "home", label: "Home", route: "/" },
      { id: "about", label: "About", route: "/about" },
    ]}
  ></vu-navbar>`,
});
