import { localized } from "@lit/localize";
import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";
import { ICONS } from "../internals/icon.js";
import { devTag, devWarnOnceForHost } from "../internals/utils/dev-warn.js";
import { themeContext } from "../theme-provider/theme-provider.js";
import type { ThemeContextValue } from "../theme-provider/theme-provider.types.js";
import { applyThemePreference, nextThemePreference } from "./internals/theme-switcher.logic.js";
import { renderThemeSwitcher } from "./internals/theme-switcher.render.js";
import { themeSwitcherStyles } from "./theme-switcher.style.js";
import type {
  VuThemeSwitcherColor,
  VuThemeSwitcherSize,
  VuThemeSwitcherType,
  VuThemeSwitcherVariant,
  VuThemeSwitcherRadius,
} from "./theme-switcher.types.js";

export type {
  VuThemeSwitcherChangeDetail,
  VuThemeSwitcherColor,
  VuThemeSwitcherSize,
  VuThemeSwitcherType,
  VuThemeSwitcherVariant,
  ThemePreference,
  VuThemeSwitcherRadius,
} from "./theme-switcher.types.js";

export { VU_THEME_SWITCHER_CHANGE_EVENT } from "./theme-switcher.types.js";

import { VuButton } from "../button/button.js";
import { VuTab } from "../tab/tab.js";
import { VuIcon } from "../icon/icon.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";


/**
 * @element vu-theme-switcher
 *
 * @summary A theme switcher component for light, dark, and system modes.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/theme-switcher
 * @dependency vu-button
 * @dependency vu-tab
 * @dependency vu-icon
 *
 * @slot icon - Optional slot to override the cycling button icon (`type="button"` only).
 *
 * @csspart container - Wrapper around the control.
 * @csspart button - Cycling `<vu-button>` when `type="button"`.
 * @csspart switch - Segmented `<vu-tab>` when `type="switch"`.
 * @csspart icon - Theme icon inside the active control.
 *
 * @property {string} darkIcon - Iconify id for dark preference.
 * @property {string} lightIcon - Iconify id for light preference.
 * @property {string} systemIcon - Iconify id for system preference.
 * @property {VuThemeSwitcherType} type - `button` cycles on click; `switch` shows all three options.
 * @property {VuThemeSwitcherColor} color - Token intent forwarded to the active control.
 * @property {boolean} disabled - Disables interaction. Default: `false`.
 * @property {VuThemeSwitcherSize} size - Child button / tab size.
 * @property {VuThemeSwitcherVariant} variant - Visual variant for `type="button"` only.
 * @property {VuThemeSwitcherRadius} radius - Corner preset (`none`/`sm`/`md`/`lg`/`full`). Default: `md`.
 * @property {boolean} iconOnly - Square icon segments in `type="switch"`; cycling button is always icon-only.
 *
 * @fires {CustomEvent<VuThemeSwitcherChangeDetail>} vu-theme - Fired when the user changes preference.
 * @method toggleTheme - Cycles preference light → system → dark and emits `vu-theme`.
 */
@localized()
@customElement("vu-theme-switcher")
@withComponentPresets
export class VuThemeSwitcher extends LitElement {
  static override styles = themeSwitcherStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-button": VuButton,
    "vu-tab": VuTab,
    "vu-icon": VuIcon,
  };

  /** Iconify id for dark preference. */
  @property({ type: String })
  darkIcon = ICONS.themeDark;

  /** Iconify id for light preference. */
  @property({ type: String })
  lightIcon = ICONS.themeLight;

  /** Iconify id for system preference. */
  @property({ type: String })
  systemIcon = ICONS.themeSystem;

  /** `button` cycles on click; `switch` shows all three options. */
  @property({ type: String, reflect: true })
  type: VuThemeSwitcherType = "button";

  /** Token intent forwarded to the active control. */
  @property({ type: String, reflect: true })
  color: VuThemeSwitcherColor = "default";

  /** Disables interaction. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Child button / tab size. */
  @property({ type: String, reflect: true })
  size: VuThemeSwitcherSize = "md";

  /** Button variant when `type="button"`. */
  @property({ type: String, reflect: true })
  variant: VuThemeSwitcherVariant = "ghost";

  /** Explicit corner preset; `full` is capsule ends, `none` is square. */
  @property({ type: String, reflect: true })
  radius: VuThemeSwitcherRadius = "md";

  /** Square icon segments in `type="switch"`; cycling button is always icon-only. */
  @property({ type: Boolean })
  iconOnly = true;

  /** Live theme context from `<vu-theme-provider>`. */
  @consume({ context: themeContext, subscribe: true })
  private themeCtx?: ThemeContextValue;

  /** Cycles preference light → system → dark and emits `vu-theme`. */
  toggleTheme(): void {
    if (!this.themeCtx || this.disabled) return;
    applyThemePreference(this._actionHost(), nextThemePreference(this.themeCtx.preference));
  }

  override firstUpdated(): void {
    if (!this.themeCtx) {
      devWarnOnceForHost(
        this,
        "no-theme-provider",
        `${devTag(this)} requires an ancestor <vu-theme-provider>.`,
      );
    }
  }

  private _actionHost() {
    return {
      themeCtx: this.themeCtx,
      requestUpdate: () => this.requestUpdate(),
      dispatchEvent: (event: Event) => this.dispatchEvent(event),
    };
  }

  private get _renderHost() {
    return {
      ...this._actionHost(),
      type: this.type,
      variant: this.variant,
      color: this.color,
      size: this.size,
      radius: this.radius,
      disabled: this.disabled,
      iconOnly: this.iconOnly,
      lightIcon: this.lightIcon,
      darkIcon: this.darkIcon,
      systemIcon: this.systemIcon,
    };
  }

  override render() {
    return renderThemeSwitcher(this._renderHost);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-theme-switcher": VuThemeSwitcher;
  }
}
