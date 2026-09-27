import {
  buildVarCSS,
  createTheme,
  resolveModeVars,
  VU_THEME_EVENT,
  VU_THEME_KEYFRAMES_CSS,
  VU_VIBRANT_PALETTE_CSS,
  VU_CORNER_CSS,
  VU_GLASS_CSS,
  type VuThemeConfig,
} from "./theme-core.js";
import { canUseDocument } from "../../internals/utils/env.js";

export const THEME_STYLE_IDS = {
  rootVars: "vu-theme-vars-root",
  global: "vu-theme-provider-global-style",
  keyframes: "vu-theme-keyframes",
} as const;

export type ThemeHostSheetState = {
  hostSheet: CSSStyleSheet | null;
  hostStyleEl: HTMLStyleElement | null;
};

function ensureStyleTag(id: string, cssText: string): HTMLStyleElement {
  let tag = document.getElementById(id) as HTMLStyleElement | null;
  if (!tag) {
    tag = document.createElement("style");
    tag.id = id;
    document.head.appendChild(tag);
  }
  tag.textContent = cssText;
  return tag;
}

export function setRootThemeAttrs(mode: "light" | "dark"): void {
  const de = document.documentElement;
  de.toggleAttribute("data-theme-light", mode === "light");
  de.toggleAttribute("data-theme-dark", mode === "dark");
  de.setAttribute("data-theme", mode);
  (de.style as CSSStyleDeclaration & { colorScheme?: string }).colorScheme = mode;
}

/** Applies `data-vibrant-palette` on the document root. */
export function setRootVibrantPalette(enabled: boolean): void {
  if (!canUseDocument()) return;
  document.documentElement.toggleAttribute("data-vibrant-palette", enabled);
}

/** Applies `data-glass` on the document root (orthogonal to light/dark). */
export function setRootGlass(enabled: boolean): void {
  if (!canUseDocument()) return;
  document.documentElement.toggleAttribute("data-glass", enabled);
}

export function broadcastThemeGlobal(
  mode: "light" | "dark",
  preference: "light" | "dark" | "system",
): void {
  const detail = { mode, preference };
  window.dispatchEvent(new CustomEvent(VU_THEME_EVENT, { detail }));
}

export function clearInjectedRootStyles(): void {
  document.getElementById(THEME_STYLE_IDS.rootVars)?.remove();
  document.getElementById(THEME_STYLE_IDS.global)?.remove();
  document.getElementById(THEME_STYLE_IDS.keyframes)?.remove();
}

function ensureGlobalBaselineStyles(): void {
  if (!canUseDocument()) return;
  ensureStyleTag(THEME_STYLE_IDS.keyframes, VU_THEME_KEYFRAMES_CSS);
  ensureStyleTag(
    THEME_STYLE_IDS.global,
    `${VU_VIBRANT_PALETTE_CSS}

${VU_CORNER_CSS}

${VU_GLASS_CSS}

      html {
        scrollbar-width: var(--vu-scrollbar-width);
        scrollbar-color: var(--vu-scrollbar-color);
      }

      body {
        font-family: var(--vu-font-sans);
        margin: 0;
        padding: 0;
        background: var(--vu-color-background);
        color: var(--vu-color-foreground);
      }

      html[data-vu-dialog-open="true"] {
        overflow: hidden !important;
        overscroll-behavior: none;
      }

      html[data-vu-dialog-open="true"] body {
        overscroll-behavior: none;
      }
    `.trim(),
  );
}

function resetHostVariableSheet(
  renderRoot: Element | DocumentFragment,
  sheet: ThemeHostSheetState,
): void {
  if (sheet.hostSheet) {
    try {
      sheet.hostSheet.replaceSync(":host{}");
    } catch {

    }
  }
  if (sheet.hostStyleEl) {
    sheet.hostStyleEl.textContent = ":host{}";
  }
}

function canUseConstructableStylesheets(): boolean {
  return (
    canUseDocument() &&
    typeof Document !== "undefined" &&
    "adoptedStyleSheets" in Document.prototype &&
    typeof CSSStyleSheet !== "undefined" &&
    "replaceSync" in CSSStyleSheet.prototype
  );
}

function applyHostVariableSheet(
  el: HTMLElement,
  renderRoot: Element | DocumentFragment,
  sheet: ThemeHostSheetState,
  vars: Record<string, string>,
): void {
  /* Next prerender / Lit SSR have `document` shims but no `Document` constructor. */
  if (!canUseDocument()) return;

  const cssText = buildVarCSS(vars, ":host");

  if (canUseConstructableStylesheets()) {
    if (!sheet.hostSheet) {
      sheet.hostSheet = new CSSStyleSheet();
      const current = (renderRoot as ShadowRoot).adoptedStyleSheets ?? [];
      (renderRoot as ShadowRoot).adoptedStyleSheets = [...current, sheet.hostSheet];
    }
    sheet.hostSheet.replaceSync(cssText);
  } else {
    if (!renderRoot || typeof renderRoot.appendChild !== "function") return;
    if (!sheet.hostStyleEl) {
      sheet.hostStyleEl = document.createElement("style");
      renderRoot.appendChild(sheet.hostStyleEl);
    }
    sheet.hostStyleEl.textContent = cssText;
  }

  if (el.style && typeof el.style.removeProperty === "function") {
    el.style.removeProperty("color");
    el.style.removeProperty("background");
  }
}

export type ApplyThemeVariablesOptions = {
  el: HTMLElement;
  renderRoot: Element | DocumentFragment;
  sheet: ThemeHostSheetState;
  mode: "light" | "dark";
  scope: "root" | "host" | "both";
  injectStyles: boolean;
  /** Minimal author config; derived tokens and raw `vars` resolve here. */
  theme?: VuThemeConfig;
  preference: "light" | "dark" | "system";
  broadcast?: boolean;
  vibrantPalette?: boolean;
  glass?: boolean;
};

export function applyThemeVariables(opts: ApplyThemeVariablesOptions): void {
  const full = createTheme(opts.theme, opts.el);
  const vars = resolveModeVars(full, opts.mode, opts.el);

  opts.el.toggleAttribute("data-theme-light", opts.mode === "light");
  opts.el.toggleAttribute("data-theme-dark", opts.mode === "dark");
  opts.el.setAttribute("data-theme", opts.mode);
  opts.el.toggleAttribute("data-glass", opts.glass === true);

  if (!opts.injectStyles) {
    clearInjectedRootStyles();
    resetHostVariableSheet(opts.renderRoot, opts.sheet);
    if (opts.scope === "root" || opts.scope === "both") {
      setRootThemeAttrs(opts.mode);
      setRootVibrantPalette(opts.vibrantPalette === true);
      setRootGlass(opts.glass === true);
      if (opts.broadcast) broadcastThemeGlobal(opts.mode, opts.preference);
    }
    return;
  }

  if (opts.scope === "host" || opts.scope === "both") {
    applyHostVariableSheet(opts.el, opts.renderRoot, opts.sheet, vars);
  }

  if (opts.scope === "root" || opts.scope === "both") {
    ensureStyleTag(THEME_STYLE_IDS.rootVars, buildVarCSS(vars, ":root"));
    setRootThemeAttrs(opts.mode);
    setRootVibrantPalette(opts.vibrantPalette === true);
    setRootGlass(opts.glass === true);
    ensureGlobalBaselineStyles();

    if (document.body) {
      document.body.style.removeProperty("color");
      document.body.style.removeProperty("background");
      document.body.style.removeProperty("font-family");
    }

    if (opts.broadcast) broadcastThemeGlobal(opts.mode, opts.preference);
  }
}

export function detachHostThemeSheet(
  sheet: ThemeHostSheetState,
  scope: "root" | "host" | "both",
  renderRoot?: Element | DocumentFragment,
): void {
  if (sheet.hostSheet && renderRoot && "adoptedStyleSheets" in renderRoot) {
    const hostSheet = sheet.hostSheet;
    const shadow = renderRoot as ShadowRoot;
    shadow.adoptedStyleSheets = (shadow.adoptedStyleSheets ?? []).filter((s) => s !== hostSheet);
    sheet.hostSheet = null;
  }

  if (sheet.hostStyleEl?.parentNode) {
    sheet.hostStyleEl.parentNode.removeChild(sheet.hostStyleEl);
    sheet.hostStyleEl = null;
  }

  if (scope === "host") {
    document.getElementById(THEME_STYLE_IDS.global)?.remove();
    document.getElementById(THEME_STYLE_IDS.keyframes)?.remove();
  }
}
