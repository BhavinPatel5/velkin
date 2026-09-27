import { classMap } from "lit/directives/class-map.js";
import { html, nothing, type TemplateResult } from "lit";
import { when } from "lit/directives/when.js";
import { ICONS } from "../../internals/icon.js";
import type { VuDropdownItemKind } from "../dropdown-item.types.js";

/** Host surface for row shadow markup and submenu chevron affordances. */
export type DropdownItemRenderHost = {
  kind: VuDropdownItemKind;
  checked: boolean;
  startIcon: string;
  endIcon: string;
  label: string;
  hint: string;
  shortcut: string;
  badge: string;
  href: string;
  target: string;
  rel: string;
  disabled: boolean;
  menuTabIndex: number;
  readonly _hasSubmenu: boolean;
  readonly _isLink: boolean;
  readonly _role: string;
  readonly _submenuOpen: boolean;
  _effectiveRel(): string | undefined;
  _badgeTone(): "neutral" | "success" | "warning" | "danger";
  _onActivate: (e: Event) => void;
  _onKeyDown: (e: KeyboardEvent) => void;
  _onRowPointerEnter: () => void;
  _onRowPointerLeave: () => void;
  _onSubmenuSlotChange: () => void;
};

export function dropdownItemRowA11y(host: DropdownItemRenderHost) {
  return {
    haspopup: host._hasSubmenu ? "menu" : nothing,
    expanded: host._hasSubmenu ? String(host._submenuOpen) : nothing,
  };
}

export function renderDropdownItemLabel(host: DropdownItemRenderHost): TemplateResult | string {
  const fromProp = host.label.trim();
  if (fromProp) return fromProp;
  return html`<slot></slot>`;
}

export function renderDropdownItemStart(
  host: DropdownItemRenderHost,
): TemplateResult | typeof nothing {
  if (host.kind === "checkbox" || host.kind === "radio") {
    return html`<span part="check" aria-hidden="true">
      ${host.checked
        ? html`<vu-icon .icon=${ICONS.check} width="16" height="16"></vu-icon>`
        : nothing}
    </span>`;
  }
  /** Always-on start slot so light-DOM icons override startIcon. */
  return html`
    <span part="start" class=${host.startIcon ? "has-fallback" : nothing}>
      <slot name="start">
        ${when(
          !!host.startIcon,
          () => html`<vu-icon .icon=${host.startIcon} width="18" height="18"></vu-icon>`,
        )}
      </slot>
    </span>
  `;
}

export function renderDropdownItemRowContent(host: DropdownItemRenderHost): TemplateResult {
  const trailing = [
    host.badge
      ? html`<span part="badge" class=${classMap({ [`tone-${host._badgeTone()}`]: true })}>${host.badge}</span>`
      : nothing,
    host.shortcut
      ? html`<span part="shortcut">${host.shortcut}</span>`
      : nothing,
  ];

  return html`
    ${renderDropdownItemStart(host)}

    <span part="stack">
      <span part="label">${renderDropdownItemLabel(host)}</span>
      <span
        part="hint"
        class=${host.hint.trim() ? "has-text" : nothing}
      >
        <slot name="hint">${host.hint}</slot>
      </span>
    </span>

    <span part="trailing">
      ${trailing}
      <span
        part="end"
        class=${host.endIcon || host._hasSubmenu ? "has-fallback" : nothing}
      >
        <slot name="end">
          ${host.endIcon
            ? html`<vu-icon .icon=${host.endIcon} width="18" height="18"></vu-icon>`
            : host._hasSubmenu
              ? html`<vu-icon .icon=${ICONS.chevronRight} width="18" height="18"></vu-icon>`
              : nothing}
        </slot>
      </span>
    </span>
  `;
}

export function renderDropdownItemBase(
  host: DropdownItemRenderHost,
  checkedAttr: string | typeof nothing,
): TemplateResult {
  const a11y = dropdownItemRowA11y(host);
  if (host._isLink) {
    return html`
      <a
        part="base"
        role="menuitem"
        href=${host.href}
        target=${host.target || nothing}
        rel=${host._effectiveRel() ?? nothing}
        tabindex=${host.menuTabIndex}
        aria-disabled=${host.disabled ? "true" : "false"}
        aria-haspopup=${a11y.haspopup}
        aria-expanded=${a11y.expanded}
        @click=${host._onActivate}
        @keydown=${host._onKeyDown}
        @mouseenter=${host._onRowPointerEnter}
        @mouseleave=${host._onRowPointerLeave}
      >
        ${renderDropdownItemRowContent(host)}
        <slot
          name="submenu"
          class="submenu-host"
          @slotchange=${host._onSubmenuSlotChange}
        ></slot>
      </a>
    `;
  }

  return html`
    <div
      part="base"
      role=${host._role}
      tabindex=${host.menuTabIndex}
      aria-disabled=${host.disabled ? "true" : "false"}
      aria-checked=${checkedAttr}
      aria-haspopup=${a11y.haspopup}
      aria-expanded=${a11y.expanded}
      @click=${host._onActivate}
      @keydown=${host._onKeyDown}
      @mouseenter=${host._onRowPointerEnter}
      @mouseleave=${host._onRowPointerLeave}
    >
      ${renderDropdownItemRowContent(host)}
      <slot
        name="submenu"
        class="submenu-host"
        @slotchange=${host._onSubmenuSlotChange}
      ></slot>
    </div>
  `;
}
