import { html, LitElement, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { VuAvatar } from "../avatar/avatar.js";
import type { VuAvatarSize } from "../avatar/avatar.types.js";
import type { VuListSelectionMode } from "../list/list.types.js";
import { renderListItemRow } from "./internals/list-item.render.js";
import { listItemStyles } from "./list-item.style.js";
import type { VuListitemActivateDetail, VuListitemSize } from "./list-item.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";
import { reflectString } from "../internals/utils/reflect-string.js";


export type { VuListitemActivateDetail, VuListitemSize } from "./list-item.types.js";

/**
 * @element vu-listitem
 *
 * @summary A list item component for use inside `<vu-list>`.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/list
 * @dependency vu-avatar
 *
 * @slot - Primary label when the `label` prop is empty.
 * @slot hint - Secondary line; overrides string `hint` when assigned.
 * @slot start - Leading markup; overrides `avatar` when assigned.
 * @slot actions - Trailing controls (clicks do not activate the row).
 *
 * @property {string} label - Primary text when the default slot is empty.
 * @property {string} hint - Secondary line when the `hint` slot is empty.
 * @property {string} avatar - Leading image URL for `vu-avatar` when `start` is empty.
 * @property {string} name - Accessible name for the avatar image (falls back to `label`).
 * @property {string} value - Stable id for list selection (`vu-list` `selectedValues`). Default: `""`.
 * @property {string} subheader - When set, renders a sticky section header (non-interactive).
 * @property {string} href - When set, renders an anchor row.
 * @property {string} target - Anchor target (`_blank`, `_self`, …).
 * @property {string} rel - Anchor `rel` (auto `noopener noreferrer` for `_blank`).
 * @property {VuListitemSize} size - Row density; inherits from `<vu-list size>` when unset.
 * @property {boolean} selected - Selected visual for listbox selection modes.
 * @property {boolean} dense - Compact row padding; inherits `<vu-list dense>` via `:host-context`.
 * @property {boolean} disabled - Disables activation; remains discoverable in listbox modes.
 *
 * @method focus - Focuses the interactive row (`part="base"`).
 * @method activate - Dispatches `vu-activate` when not disabled or a subheader.
 *
 * @fires {CustomEvent<VuListitemActivateDetail>} vu-activate - Row activation (click, Enter, or parent list keyboard).
 *
 * @csspart subheader - Sticky section heading row.
 * @csspart base - Interactive row surface (`role="option"` or `listitem`, or anchor).
 * @csspart start - Leading cluster (avatar slot or `vu-avatar`).
 * @csspart avatar - `vu-avatar` when `avatar` is set.
 * @csspart stack - Label + hint column.
 * @csspart label - Primary line.
 * @csspart hint - Secondary line.
 * @csspart actions - Trailing actions slot wrapper.
 */
@customElement("vu-listitem")
@withComponentPresets
export class VuListitem extends LitElement {
  static override styles = listItemStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-avatar": VuAvatar,
  };

  /** Primary text when the default slot is empty. */
  @property({ type: String })
  label = "";

  /** Secondary line when the `hint` slot is empty. */
  @property({ type: String })
  hint = "";

  /** Leading image URL for `vu-avatar` when the `start` slot is empty. */
  @property({ type: String })
  avatar = "";

  /** Accessible name for the avatar image (falls back to `label`). */
  @property({ type: String })
  name = "";

  /** Stable selection token consumed by `<vu-list>`. */
  @property(reflectString)
  value = "";

  /** When non-empty, renders a sticky section header instead of an interactive row. */
  @property({ type: String })
  subheader = "";

  /** When set, renders an anchor row. */
  @property({ type: String })
  href = "";

  /** Anchor target. */
  @property({ type: String })
  target = "";

  /** Anchor rel; defaults to `noopener noreferrer` when `target="_blank"`. */
  @property({ type: String })
  rel = "";

  /** Row density; omit to inherit `<vu-list size>`. */
  @property({ type: String, reflect: true })
  size?: VuListitemSize;

  /** Selected state for listbox modes (parent may assign). */
  @property({ type: Boolean, reflect: true })
  selected = false;

  /** Compact vertical padding. */
  @property({ type: Boolean, reflect: true })
  dense = false;

  /** Disables activation while keeping the row discoverable. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** @internal Roving tabindex from `<vu-list>`. */
  @property({ type: Number, attribute: false })
  itemTabIndex = -1;

  /** @internal Selection mode relayed from `<vu-list>` (SSR + first paint). */
  @property({ type: String, attribute: false })
  listSelectionMode: VuListSelectionMode | "" = "";

  @query('[part="base"]')
  private _base?: HTMLElement;

  private get _subheaderText(): string {
    return String(this.subheader ?? "").trim();
  }

  private get _isSubheader(): boolean {
    return this._subheaderText.length > 0;
  }

  get _isLink(): boolean {
    return !!this.href.trim();
  }

  get _rowRole(): "listitem" | "option" | "group" {
    const mode = this._listContextSelection();
    if (mode === undefined) return "group";
    return mode === "none" ? "listitem" : "option";
  }

  get _avatarSize(): VuAvatarSize {
    const size =
      this.size ??
      (typeof this.closest === "function"
        ? (this.closest("vu-list")?.getAttribute("size") as VuListitemSize | null)
        : null) ??
      "md";
    if (size === "sm") return "sm";
    if (size === "lg") return "lg";
    return "md";
  }

  private _listContextSelection(): VuListSelectionMode | undefined {
    if (this.listSelectionMode) return this.listSelectionMode;
    if (typeof this.closest !== "function") return undefined;
    const list = this.closest("vu-list") as import("../list/list.js").VuList | null;
    if (!list) return undefined;
    return list.selection;
  }

  get _effectiveName(): string {
    return this.name.trim() || this.label.trim();
  }

  _effectiveRel(): string | undefined {
    const rel = this.rel.trim();
    if (rel) return rel;
    if (this.target === "_blank") return "noopener noreferrer";
    return undefined;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.toggleAttribute("data-subheader", this._isSubheader);
  }

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("disabled")) {
      if (this.disabled) {
        this.setAttribute("aria-disabled", "true");
      } else {
        this.removeAttribute("aria-disabled");
      }
    }
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("subheader")) {
      this.toggleAttribute("data-subheader", this._isSubheader);
    }
  }

  /** Focuses the interactive row. */
  override focus(options?: FocusOptions): void {
    this._base?.focus(options);
  }

  /** Dispatches `vu-activate` for parent list selection handling. */
  activate(): void {
    if (this.disabled || this._isSubheader) return;
    this.dispatchEvent(
      new CustomEvent<VuListitemActivateDetail>("vu-activate", {
        detail: { item: this },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onActivate(event: Event): void {
    if (this.disabled) return;
    const path = event.composedPath();
    const actions = this.renderRoot?.querySelector('[part="actions"]');
    if (actions && path.includes(actions)) return;
    if (this._isLink) return;
    event.preventDefault();
    this.activate();
  }

  _stopActionsActivate(event: Event): void {
    event.stopPropagation();
  }

  _onKeydown(event: KeyboardEvent): void {
    if (typeof this.closest === "function") {
      const list = this.closest("vu-list") as import("../list/list.js").VuList | null;
      if (list?.handleRowKeydown(this, event)) return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.activate();
    }
  }

  override render() {
    if (this._isSubheader) {
      return html` <div part="subheader" role="presentation">${this._subheaderText}</div> `;
    }

    return renderListItemRow(this);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-listitem": VuListitem;
  }
}
