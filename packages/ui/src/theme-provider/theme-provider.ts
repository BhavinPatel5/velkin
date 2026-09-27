import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createContext, provide } from "@lit/context";
import { isClient } from "../internals/utils/env.js";
import { setLocale } from "../internals/utils/localize.js";
import {
  createTheme,
  getThemePreference,
  VU_THEME_EVENT,
  resolveActualTheme,
  THEME_KEY,
  type ThemePreference,
  type VuThemeConfig,
} from "./internals/theme-core.js";
import {
  applyThemeVariables,
  detachHostThemeSheet,
  type ThemeHostSheetState,
} from "./internals/theme-injection.js";
import { themeProviderStyles } from "./theme-provider.style.js";
import type {
  VuThemeProviderChangeDetail,
  VuThemeProviderScope,
  ThemeContextValue,
} from "./theme-provider.types.js";

export * from "./internals/theme-core.js";
export { defaultThemeCss, themeToCriticalCss } from "./theme-styles.js";
export type {
  VuThemeProviderChangeDetail,
  VuThemeProviderScope,
  ThemeContextValue,
  ThemeConfig,
  ThemePreference,
  VuThemeConfig,
  VuThemeSeeds,
  VuThemeVars,
} from "./theme-provider.types.js";
export { VU_THEME_EVENT } from "./internals/theme-core.js";

export const themeContext = createContext<ThemeContextValue>("vu/theme");

/**
 * @element vu-theme-provider
 *
 * @summary A theme provider component that supplies tokens and locale.
 *
 * @status stable
 * @since 1.0.0
 *
 * @documentation https://velkinui.com/components/theme-provider
 *
 * @slot - App subtree that inherits theme tokens and locale.
 *
 * @property {VuThemeConfig} theme - Brand seeds (`primary`, intents, `radius`, `spacing`, `tint`, fonts) plus optional per-mode seeds and raw `vars`.
 * @property {VuThemeProviderScope} scope - Where CSS variables are applied. Default: `"root"`.
 * @property {ThemePreference} preference - Stored UI preference. Default: `"system"`.
 * @property {boolean} persist - Persists preference to localStorage when scope includes root. Default: `true`.
 * @property {boolean} broadcast - Emits global theme events when the active mode changes. Default: `true`.
 * @property {string} locale - BCP 47 locale for built-in `msg()` strings. Default: `"en"`.
 * @property {boolean} injectStyles - When false, skips injected token styles. Default: `true`.
 * @property {boolean} vibrantpalette - Higher-contrast soft intent foregrounds. Default: `false`.
 * @property {boolean} glass - App-wide glassmorphism for elevated surfaces and overlays. Does not paint a page background gradient — set your own. Default: `true`.
 *
 * @method setPreference - Sets preference, optionally persists, and emits theme events when broadcast is true.
 * @method togglePreference - Cycles preference light, dark, then system.
 *
 * @fires {CustomEvent<VuThemeProviderChangeDetail>} vu-theme - Bubbles when broadcast is true.
 */
@customElement("vu-theme-provider")
export class VuThemeProvider extends LitElement {
  /** Brand seeds expanded into a full palette; `vars` overrides individual `--vu-*` tokens. */
  @property({ type: Object, attribute: false })
  theme?: VuThemeConfig;

  /** Where CSS variables are applied. */
  @property({ type: String, reflect: true })
  scope: VuThemeProviderScope = "root";

  /** Stored UI preference. Default is always 'system' so SSR matches the first client render. */
  @property({ type: String, reflect: true })
  preference: ThemePreference = "system";

  /** Persists preference to localStorage when scope includes root. */
  @property({ type: Boolean })
  persist = true;

  /** Emits global theme events when the active mode changes. */
  @property({ type: Boolean })
  broadcast = true;

  /** BCP 47 locale for built-in `msg()` strings. */
  @property({ type: String, reflect: true })
  locale = "en";

  /** When false, skips injected token styles. */
  @property({ type: Boolean, reflect: true })
  injectStyles = true;

  /** Higher-contrast soft intent foregrounds. */
  @property({ type: Boolean, reflect: true })
  vibrantpalette = false;

  /** App-wide glassmorphism for elevated surfaces, overlays, chrome, and fields (no page gradient injection). */
  @property({ type: Boolean, reflect: true })
  glass = true;

  @provide({ context: themeContext })
  private _ctx!: ThemeContextValue;

  /** Resolved light/dark; not `@state` — `render()` is a slot, tokens go out via CSS + context. */
  private mode: "light" | "dark" = "light";

  private media: MediaQueryList | null = null;
  private hostSheet: ThemeHostSheetState = { hostSheet: null, hostStyleEl: null };

  static override styles = themeProviderStyles;

  override connectedCallback(): void {
    super.connectedCallback();
    this.mode = resolveActualTheme(this.preference);
    this._syncLocale();
    this.pushContext();
    this.setupSystemWatcher();
    if (this.scope === "host" && isClient()) {
      this.applyVariables();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.media?.removeEventListener("change", this.onSystemChange);
    detachHostThemeSheet(this.hostSheet, this.scope, this.renderRoot);
  }

  protected override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("locale")) {
      this._syncLocale();
    }

    const prefChanged = changed.has("preference");
    const scopeChanged = changed.has("scope");
    const themeChanged = changed.has("theme");
    const injectChanged = changed.has("injectStyles");
    const vibrantChanged = changed.has("vibrantpalette");
    const glassChanged = changed.has("glass");

    let modeChanged = false;

    if (prefChanged || scopeChanged) {
      const nextMode = resolveActualTheme(this.preference);
      if (nextMode !== this.mode) {
        this.mode = nextMode;
        modeChanged = true;
      }
    }

    const hydrated = !!this.hasUpdated;
    const canApplyNow = this.scope === "host" || hydrated;
    if (
      canApplyNow &&
      (modeChanged || scopeChanged || themeChanged || injectChanged || vibrantChanged || glassChanged)
    ) {
      this.applyVariables();
    }

    if (
      prefChanged ||
      modeChanged ||
      themeChanged ||
      scopeChanged ||
      injectChanged ||
      vibrantChanged ||
      glassChanged
    ) {
      this.pushContext();
    }
  }

  override firstUpdated(): void {
    if (this.scope === "root" || this.scope === "both") {
      this.applyVariables();
    }
    this._queuePersistedPreferenceRestore();
  }

  setPreference(pref: ThemePreference): void {
    try {
      if (this.persist && (this.scope === "root" || this.scope === "both")) {
        localStorage.setItem(THEME_KEY, pref);
      }
    } catch {

    }
    this.preference = pref;
    this._emitThemeChangeGlobal();
  }

  togglePreference(): ThemePreference {
    const current = this.preference ?? getThemePreference();
    const next: ThemePreference =
      current === "light" ? "dark" : current === "dark" ? "system" : "light";
    this.setPreference(next);
    return next;
  }

  /** After hydrate — writing `preference` in firstUpdated would trigger Lit change-in-update. */
  private _queuePersistedPreferenceRestore(): void {
    if (!this.persist || !isClient() || this.preference !== "system") return;
    const stored = getThemePreference();
    if (stored === "system") return;
    queueMicrotask(() => {
      if (!this.isConnected || !this.persist || this.preference !== "system") return;
      this.preference = stored;
    });
  }

  private onSystemChange = (): void => {
    if ((this.preference ?? getThemePreference()) === "system") {
      this.mode = resolveActualTheme("system");
      this.applyVariables();
      this.pushContext();
      this._dispatchVuTheme(this._themeChangeDetail());
    }
  };

  private setupSystemWatcher(): void {
    if (!isClient() || !window.matchMedia) return;
    this.media = window.matchMedia("(prefers-color-scheme: dark)");
    this.media.addEventListener("change", this.onSystemChange);
  }

  private applyVariables(): void {
    this.toggleAttribute("data-vibrant-palette", this.vibrantpalette);
    this.toggleAttribute("data-glass", this.glass);
    applyThemeVariables({
      el: this,
      renderRoot: this.renderRoot,
      sheet: this.hostSheet,
      mode: this.mode,
      scope: this.scope,
      injectStyles: this.injectStyles,
      theme: this.theme,
      preference: this.preference,
      broadcast: this.broadcast,
      vibrantPalette: this.vibrantpalette,
      glass: this.glass,
    });
  }

  private _emitThemeChangeGlobal(): void {
    if (!this.broadcast || (this.scope !== "root" && this.scope !== "both")) return;
    this._dispatchVuTheme(this._themeChangeDetail());
  }

  private _dispatchVuTheme(detail: VuThemeProviderChangeDetail): void {
    this.dispatchEvent(
      new CustomEvent<VuThemeProviderChangeDetail>(VU_THEME_EVENT, {
        detail,
        bubbles: false,
        composed: true,
      }),
    );
  }

  private _themeChangeDetail(): VuThemeProviderChangeDetail {
    return {
      mode: resolveActualTheme(this.preference),
      preference: this.preference,
    };
  }

  private _syncLocale(): void {
    void setLocale(this.locale);
  }

  private pushContext(): void {
    this._ctx = {
      mode: this.mode,
      preference: this.preference,
      theme: createTheme(this.theme, this),
      setPreference: (pref: ThemePreference) => this.setPreference(pref),
      togglePreference: () => this.togglePreference(),
    };
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-theme-provider": VuThemeProvider;
  }
}
