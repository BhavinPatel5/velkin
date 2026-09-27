/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuForm } from "../form.js";

tierAPerfSuite({
  id: "vu-form",
  tag: "vu-form",
  load: () => import("../form.js"),
  create: async () =>
    fixture<VuForm>(html`
      <vu-form mode="client" livevalidation>
        <input name="email" value="a@b.co" />
        <button type="submit">Save</button>
      </vu-form>
    `),
  mutate: (el, i) => {
    const host = el as VuForm;
    host.liveValidation = i % 2 === 0;
    host.showErrors = i % 3 !== 0;
    host.enterSubmit = i % 4 === 0;
    host.mode = i % 5 === 0 ? "server" : "client";
  },
});
