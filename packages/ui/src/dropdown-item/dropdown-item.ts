import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { VuIcon } from "../icon/icon.js";
import { dropdownItemStyles } from "./dropdown-item.style.js";
import {
  renderDropdownItemBase,
  type DropdownItemRenderHost,
} from "./internals/dropdown-item.render.js";
import {
  clearDropdownItemSubmenuHoverTimers,
  onDropdownItemRowPointerEnter,
  onDropdownItemRowPointerLeave,
  onDropdownItemSubmenuSlotChange,
  promoteDropdownItemSubmenuFlyouts,
  unwireDropdownItemSubmenu,
} from "./internals/dropdown-item.submenu.js";
import type {
  VuDropdownItemColor,
  VuDropdownItemKind,
  VuDropdownItemSelectDetail,
  VuDropdownItemSize,
} from "./dropdown-item.types.js";
import type {
  DropdownItemSubmenuHost,
  SubmenuFlyout,
} from "./internals/dropdown-item.submenu.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuDropdownItemColor,
  VuDropdownItemKind,
  VuDropdownItemSelectDetail,
  VuDropdownItemSize,
} from "./dropdown-item.types.js";
import { reflectString } from "../internals/utils/reflect-string.js";

/**
 * @element vu-dropdown-item
 *
 * @summary A dropdown item component with icons, shortcuts, and menu semantics.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/dropdown
 * @dependency vu-icon
 *
 * @uiVModel selected vu-select
 * @uiVModel checked vu-select detail=checked
 *
 * @slot - Primary label when the `label` prop is empty.
 * @slot start - Leading icon or markup (overrides `startIcon` when assigned).
 * @slot hint - Secondary line; overrides the `hint` prop when assigned.
 * @slot end - Trailing icon or markup (overrides `endIcon` when assigned).
 * @slot submenu - Nested `<vu-dropdown trigger="submenu">` flyout; ArrowRight opens it.
 *
 * @csspart base - Interactive row (`role="menuitem"` or checkbox/radio variant).
 * @csspart start - Leading slot / icon wrapper.
 * @csspart stack - Label + hint column.
 * @csspart label - Primary line.
 * @csspart hint - Secondary line.
 * @csspart trailing - Shortcut, badge, and end slot cluster.
 * @csspart shortcut - Keyboard shortcut pill.
 * @csspart badge - Trailing badge pill.
 * @csspart end - Trailing slot / icon wrapper.
 * @csspart check - Checkbox/radio affordance when `kind` is not `default`.
 *
 * @property {string} value - Stable token for selection (`vu-select` detail and parent `value`).
 * @property {string} label - Primary text when the default slot is empty.
 * @property {string} hint - Secondary line when the `hint` slot is empty.
 * @property {string} startIcon - Iconify id for the leading icon.
 * @property {string} endIcon - Iconify id for the trailing icon.
 * @property {string} shortcut - Shortcut hint in the trailing cluster.
 * @property {string} badge - Badge text in the trailing cluster (tone follows `color`).
 * @property {string} href - When set, renders an anchor row (`role="menuitem"`).
 * @property {string} target - Anchor target (`_blank`, `_self`, …).
 * @property {string} rel - Anchor `rel` (auto `noopener noreferrer` for `_blank`).
 * @property {VuDropdownItemKind} kind - `default`, `checkbox`, or `radio` row semantics.
 * @property {boolean} checked - Checked state for `checkbox` / `radio` rows.
 * @property {boolean} disabled - Non-interactive row (`aria-disabled`; still focusable in menus).
 * @property {boolean} selected - Selected/active visual (parent-owned state).
 * @property {VuDropdownItemColor} color - Intent for label and hover fill. Default: `default`.
 * @property {VuDropdownItemSize} size - Row density. Default: `md`.
 *
 * @method getLabel - Returns the effective label string.
 * @method hasSubmenu - True when a nested flyout is slotted in `submenu`.
 * @method openSubmenu - Opens the nested flyout.
 * @method closeSubmenu - Closes the nested flyout.
 * @method activate - Programmatically activates the row.
 * @method focus - Focuses the row for keyboard navigation.
 *
 * @fires {CustomEvent<VuDropdownItemSelectDetail>} vu-select - Row activation; toggles `checked` for checkbox rows on Space.
 */
@customElement("vu-dropdown-item")
@withComponentPresets
export class VuDropdownItem extends LitElement {
  static override styles = dropdownItemStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
  };

  /** Submit / selection token; falls back to `label` when empty. */
  @property(reflectString)
  value = "";

  /** Primary text when the default slot is empty. */
  @property({ type: String })
  label = "";

  /** Secondary line when the `hint` slot is empty. */
  @property({ type: String })
  hint = "";

  /** Iconify id for the leading icon. */
  @property({ type: String })
  startIcon = "";

  /** Iconify id for the trailing icon. */
  @property({ type: String })
  endIcon = "";

  /** Shortcut hint in the trailing cluster. */
  @property({ type: String })
  shortcut = "";

  /** Badge text in the trailing cluster. */
  @property({ type: String })
  badge = "";

  /** When set, renders an anchor row. */
  @property({ type: String })
  href = "";

  /** Anchor target. */
  @property({ type: String })
  target = "";

  /** Anchor rel; defaults to `noopener noreferrer` when `target="_blank"`. */
  @property({ type: String })
  rel = "";

  /** Row semantics for checkbox/radio menus. */
  @property({ type: String, reflect: true })
  kind: VuDropdownItemKind = "default";

  /** Checked state for checkbox/radio rows. */
  @property({ type: Boolean, reflect: true })
  checked = false;

  /** Non-interactive row. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Selected visual; parent updates after `vu-select`. */
  @property({ type: Boolean, reflect: true })
  selected = false;

  /** Intent for label and hover fill. */
  @property({ type: String, reflect: true })
  color: VuDropdownItemColor = "default";

  /** Row density. */
  @property({ type: String, reflect: true })
  size: VuDropdownItemSize = "md";

  /** @internal Roving tabindex from `<vu-dropdown>`; only one row uses `0`. */
  @property({ type: Number })
  menuTabIndex = -1;

  @query('slot[name="submenu"]')
  private _submenuSlot!: HTMLSlotElement;

  private _submenuFlyout: SubmenuFlyout | null = null;
  private _submenuChangeHandler: ((e: Event) => void) | null = null;
  private _submenuHoverHandler: ((e: Event) => void) | null = null;
  private _submenuOpenTimeout: number | null = null;
  private _submenuCloseTimeout: number | null = null;

  private get _submenuHost(): DropdownItemSubmenuHost {
    return this as unknown as DropdownItemSubmenuHost;
  }

  private get _renderHost(): DropdownItemRenderHost {
    return this as unknown as DropdownItemRenderHost;
  }

  private get _hasSubmenu(): boolean {
    return !!this._submenuFlyout;
  }

  private get _submenuOpen(): boolean {
    return this._submenuFlyout?.open ?? false;
  }

  private get _isLink(): boolean {
    return !!this.href.trim();
  }

  private get _role(): string {
    if (this.kind === "checkbox") return "menuitemcheckbox";
    if (this.kind === "radio") return "menuitemradio";
    return "menuitem";
  }

  private _effectiveLabel(): string {
    const fromProp = this.label.trim();
    if (fromProp) return fromProp;
    for (const child of this.childNodes) {
      if (child instanceof HTMLElement && child.tagName.toLowerCase() === "vu-dropdown") {
        continue;
      }
      const text = child.textContent?.trim();
      if (text) return text;
    }
    return "";
  }

  private _effectiveValue(): string {
    const v = this.value.trim();
    if (v) return v;
    return this._effectiveLabel();
  }

  private _effectiveRel(): string | undefined {
    const rel = this.rel.trim();
    if (rel) return rel;
    if (this.target === "_blank") return "noopener noreferrer";
    return undefined;
  }

  private _badgeTone(): "neutral" | "success" | "warning" | "danger" {
    if (
      this.color === "success" ||
      this.color === "warning" ||
      this.color === "danger"
    ) {
      return this.color;
    }
    return "neutral";
  }

  /** Returns the effective label string. */
  getLabel(): string {
    return this._effectiveLabel();
  }

  /** True when a nested flyout is slotted in `submenu`. */
  hasSubmenu(): boolean {
    return this._hasSubmenu;
  }

  /** Opens the nested flyout. */
  openSubmenu(): void {
    this._submenuFlyout?.show();
  }

  /** Closes the nested flyout. */
  closeSubmenu(): void {
    this._submenuFlyout?.hide();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    promoteDropdownItemSubmenuFlyouts(this._submenuHost);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearDropdownItemSubmenuHoverTimers(this._submenuHost);
    unwireDropdownItemSubmenu(this._submenuHost);
  }

  /** Programmatically activates the row. */
  activate(): void {
    if (this.disabled) return;
    if (this._hasSubmenu) {
      this.openSubmenu();
      return;
    }
    if (this.kind === "checkbox") {
      this.checked = !this.checked;
    } else if (this.kind === "radio") {
      this.checked = true;
    }
    this._emitSelect();
  }

  /** Focuses the row for keyboard navigation. */
  override focus(): void {
    this.shadowRoot?.querySelector<HTMLElement>('[part="base"]')?.focus();
  }

  private _emitSelect(): void {
    this.dispatchEvent(
      new CustomEvent<VuDropdownItemSelectDetail>("vu-select", {
        detail: {
          value: this._effectiveValue(),
          label: this._effectiveLabel(),
          color: this.color,
          selected: this.selected,
          kind: this.kind,
          checked: this.checked,
          href: this.href,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onActivate = (e: Event): void => {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (this._hasSubmenu && !this._isLink) {
      e.preventDefault();
      e.stopPropagation();
      this.openSubmenu();
      return;
    }
    if (this._isLink) {
      this._emitSelect();
      return;
    }
    if (this.kind === "checkbox") {
      e.preventDefault();
      this.checked = !this.checked;
    } else if (this.kind === "radio") {
      this.checked = true;
    }
    this._emitSelect();
  };

  private _onKeyDown = (e: KeyboardEvent): void => {
    if (this.disabled) return;
    if (this._isLink) {
      if (e.key === " ") e.preventDefault();
      return;
    }
    if (this._hasSubmenu && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      e.stopPropagation();
      this.openSubmenu();
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (this.kind === "checkbox" && e.key === " ") {
        this.checked = !this.checked;
      } else if (this.kind === "radio") {
        this.checked = true;
      }
      this._emitSelect();
    }
  };

  override firstUpdated(): void {
    onDropdownItemSubmenuSlotChange(this._submenuHost);
  }

  private _onSubmenuSlotChange = (): void =>
    onDropdownItemSubmenuSlotChange(this._submenuHost);

  private _onRowPointerEnter = (): void =>
    onDropdownItemRowPointerEnter(this._submenuHost);

  private _onRowPointerLeave = (): void =>
    onDropdownItemRowPointerLeave(this._submenuHost);

  override render() {
    const checkedAttr =
      this.kind === "checkbox" || this.kind === "radio"
        ? this.checked
          ? "true"
          : "false"
        : nothing;

    return renderDropdownItemBase(this._renderHost, checkedAttr);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-dropdown-item": VuDropdownItem;
  }
}
