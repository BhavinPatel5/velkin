import { html, type TemplateResult } from "lit";
import { msg, str } from "../../internals/utils/localize.js";
import type { VuTabChangeDetail, VuTabStateItem } from "../../tab/tab.types.js";
import type { ThemePreference } from "../../theme-provider/internals/theme-core.js";
import type {
  VuThemeSwitcherColor,
  VuThemeSwitcherRadius,
  VuThemeSwitcherSize,
  VuThemeSwitcherType,
  VuThemeSwitcherVariant,
} from "../theme-switcher.types.js";
import {
  applyThemePreference,
  iconForPreference,
  nextThemePreference,
  type ThemeSwitcherActionHost,
} from "./theme-switcher.logic.js";

/** Host surface for render helpers. */
export type ThemeSwitcherRenderHost = ThemeSwitcherActionHost & {
  type: VuThemeSwitcherType;
  variant: VuThemeSwitcherVariant;
  color: VuThemeSwitcherColor;
  size: VuThemeSwitcherSize;
  radius: VuThemeSwitcherRadius;
  disabled: boolean;
  iconOnly: boolean;
  lightIcon: string;
  darkIcon: string;
  systemIcon: string;
};

function preference(host: ThemeSwitcherRenderHost): ThemePreference {
  return host.themeCtx?.preference ?? "system";
}

function onButtonClick(host: ThemeSwitcherRenderHost): void {
  if (!host.themeCtx || host.disabled) return;
  applyThemePreference(host, nextThemePreference(preference(host)));
}

function onTabChange(
  host: ThemeSwitcherRenderHost,
  e: CustomEvent<VuTabChangeDetail>,
): void {
  /* Internal tab vu-change must not escape; the public event is vu-theme. */
  e.stopPropagation();
  const next = e.detail.value;
  if (next !== "light" && next !== "dark" && next !== "system") return;
  applyThemePreference(host, next);
}

function switchStates(
  host: ThemeSwitcherRenderHost,
  labels: { light: string; auto: string; dark: string },
): VuTabStateItem[] {
  return [
    { value: "light", icon: host.lightIcon, label: host.iconOnly ? undefined : labels.light },
    { value: "system", icon: host.systemIcon, label: host.iconOnly ? undefined : labels.auto },
    { value: "dark", icon: host.darkIcon, label: host.iconOnly ? undefined : labels.dark },
  ];
}

/** Button or segmented switch UI bound to theme context. */
export function renderThemeSwitcher(host: ThemeSwitcherRenderHost): TemplateResult {
  const pref = preference(host);
  const icons = {
    light: host.lightIcon,
    dark: host.darkIcon,
    system: host.systemIcon,
  };
  const groupLabel = String(
    msg("Theme preference", { desc: "Accessible name for the theme switcher group." }),
  );
  const lightText = String(msg("Light", { desc: "Light theme option label." }));
  const autoText = String(msg("Auto", { desc: "System theme option label." }));
  const darkText = String(msg("Dark", { desc: "Dark theme option label." }));

  if (host.type === "switch") {
    return html`
      <div part="container">
        <vu-tab
          part="switch"
          .label=${groupLabel}
          .size=${host.size}
          .color=${host.color}
          .radius=${host.radius}
          .value=${pref}
          .states=${switchStates(host, { light: lightText, auto: autoText, dark: darkText })}
          ?iconOnly=${host.iconOnly}
          ?disabled=${host.disabled}
          @vu-change=${(e: CustomEvent<VuTabChangeDetail>) => onTabChange(host, e)}
        ></vu-tab>
      </div>
    `;
  }

  const icon = iconForPreference(pref, icons);
  const buttonLabel = String(
    msg(str`Theme: ${pref}. Click to change.`, {
      desc: "Accessible name for the cycling theme button.",
    }),
  );

  return html`
    <div part="container">
      <vu-button
        part="button"
        .variant=${host.variant}
        .color=${host.color}
        .size=${host.size}
        .radius=${host.radius}
        .label=${buttonLabel}
        ?iconOnly=${true}
        ?disabled=${host.disabled}
        title=${buttonLabel}
        @click=${() => onButtonClick(host)}
      >
        <slot name="icon"><vu-icon part="icon" .icon=${icon}></vu-icon></slot>
      </vu-button>
    </div>
  `;
}
