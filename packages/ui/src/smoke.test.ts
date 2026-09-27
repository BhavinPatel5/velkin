/**
 * Public MIT smoke tests — full suite lives in the private source of truth.
 * CI on this repo verifies free packages build and core elements register.
 */
import { fixture, html } from "@open-wc/testing";
import { expect, test } from "vitest";
import { VuButton } from "./button/button.js";
import { VuThemeProvider } from "./theme-provider/theme-provider.js";

test("vu-button is registered and renders", async () => {
  expect(customElements.get("vu-button")).toBe(VuButton);
  const el = await fixture<VuButton>(html`<vu-button>Save</vu-button>`);
  expect(el.tagName.toLowerCase()).toBe("vu-button");
  expect(el.textContent?.trim()).toBe("Save");
});

test("vu-theme-provider is registered", () => {
  expect(customElements.get("vu-theme-provider")).toBe(VuThemeProvider);
});
