import { expect } from "vitest";
import { getDefaultThemeStylesheet } from "../internals/theme-core.js";
import { defaultThemeCss, themeToCriticalCss } from "../theme-styles.js";

describe("theme-styles", () => {
  it("defaultThemeCss matches getDefaultThemeStylesheet", () => {
    expect(defaultThemeCss).toBe(getDefaultThemeStylesheet());
  });

  it("themeToCriticalCss emits light and dark root blocks", () => {
    const css = themeToCriticalCss({ primary: "oklch(0.58 0.2 264)" });
    expect(css).toContain(":root{");
    expect(css).toContain('html[data-theme="dark"]');
  });
});
