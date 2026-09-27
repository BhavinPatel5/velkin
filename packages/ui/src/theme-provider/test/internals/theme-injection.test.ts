import { expect } from "vitest";
import {
  applyThemeVariables,
  detachHostThemeSheet,
  THEME_STYLE_IDS,
  type ThemeHostSheetState,
} from "../../internals/theme-injection.js";

describe("theme-injection", () => {
  it("detachHostThemeSheet removes adopted host variable sheet", () => {
    if (!("adoptedStyleSheets" in Document.prototype)) return;

    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    const sheet: ThemeHostSheetState = { hostSheet: null, hostStyleEl: null };

    applyThemeVariables({
      el: host,
      renderRoot: shadow,
      sheet,
      mode: "light",
      scope: "host",
      injectStyles: true,
      broadcast: false,
      preference: "light",
    });

    expect(sheet.hostSheet).toBeTruthy();
    const sheetsBefore = shadow.adoptedStyleSheets.length;

    detachHostThemeSheet(sheet, "host", shadow);

    expect(sheet.hostSheet).toBeNull();
    expect(shadow.adoptedStyleSheets.length).toBeLessThan(sheetsBefore);
  });

  it("global baseline body font uses --vu-font-sans", () => {
    const host = document.createElement("vu-theme-provider");
    const sheet: ThemeHostSheetState = { hostSheet: null, hostStyleEl: null };

    applyThemeVariables({
      el: host,
      renderRoot: host,
      sheet,
      mode: "light",
      scope: "root",
      injectStyles: true,
      broadcast: false,
      preference: "light",
    });

    const globalCss =
      document.getElementById(THEME_STYLE_IDS.global)?.textContent ?? "";
    expect(globalCss).toContain("font-family: var(--vu-font-sans)");
  });
});
