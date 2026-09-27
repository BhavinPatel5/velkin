import { html, LitElement, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { PopoverController } from "../internals/controllers/popover-controller.js";
import { isClient } from "../internals/utils/env.js";
import {
  createMenuTypeaheadState,
  handleMenuKeydown,
  menuOrientationFromPlacement,
  menuRowLabel,
  type MenuTypeaheadState,
} from "../internals/utils/menu.js";
import { VuIcon } from "../icon/icon.js";
import {
  activeSpeeddialMenuRow,
  collectSpeeddialMenuRows,
  focusSpeeddialRowAt,
  syncSpeeddialMenuRows,
} from "./internals/speeddial-actions.js";
import { speeddialPopoverOptions } from "./internals/speeddial.popover.js";
import { speeddialStyles } from "./speeddial.style.js";
import type {
  VuSpeeddialOpenChangeDetail,
  VuSpeeddialColor,
  VuSpeeddialDirection,
  VuSpeeddialSize,
} from "./speeddial.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuSpeeddialOpenChangeDetail,
  VuSpeeddialColor,
  VuSpeeddialDirection,
  VuSpeeddialSize,
} from "./speeddial.types.js";

const VIEWPORT_PAD = 100;

/**
 * @element vu-speeddial
 *
 * @summary A speed dial component that expands into contextual quick actions.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/speeddial
 * @dependency vu-icon
 *
 * @uiVModel open vu-open-change detail=open
 *
 * @slot - Action buttons (`<button>` or `<vu-button>`) shown when open.
 *
 * @csspart root - Positioning wrapper around the FAB and action cluster.
 * @csspart fab - Native toggle button for the speed dial.
 * @csspart actions - Container for slotted action buttons.
 *
 * @cssproperty --speeddial-fab-size - FAB diameter.
 * @cssproperty --speeddial-action-size - Slotted action button diameter.
 * @cssproperty --speeddial-gap - Gap between action buttons.
 * @cssproperty --speeddial-offset - Offset between FAB and the action cluster.
 * @cssproperty --speeddial-fab-bg - FAB background.
 * @cssproperty --speeddial-fab-fg - FAB foreground.
 *
 * @property {boolean} open - Whether the action cluster is open.
 * @property {VuSpeeddialDirection} direction - Preferred expansion side before viewport flip.
 * @property {VuSpeeddialColor} color - FAB intent color; defaults to `"primary"`.
 * @property {VuSpeeddialSize} size - FAB and action hit-target scale.
 * @property {string} icon - Iconify name for the FAB icon when closed.
 * @property {string} iconOpen - Iconify name when open (defaults to `ion:close`).
 * @property {string} label - Accessible name for the FAB (required when icon-only).
 * @property {boolean} closeOnEsc - Whether Escape closes the open cluster.
 * @property {boolean} closeOnOutside - Whether pointer-down outside closes the open cluster.
 *
 * @method show - Opens the speed dial when actions are slotted.
 * @method hide - Closes the speed dial.
 * @method toggle - Toggles the speed dial.
 *
 * @fires {CustomEvent<void>} vu-open - When the cluster begins opening.
 * @fires {CustomEvent<void>} vu-close - When the cluster begins closing.
 * @fires {CustomEvent<VuSpeeddialOpenChangeDetail>} vu-open-change - When `open` changes.
 */
@customElement("vu-speeddial")
@withComponentPresets
export class VuSpeeddial extends LitElement {
  static override styles = speeddialStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
  };

  /** Whether the action cluster is open. */
  @property({ type: Boolean, reflect: true }) open = false;
  /** Preferred expansion side before viewport flip. */
  @property({ type: String, reflect: true }) direction: VuSpeeddialDirection = "top";
  /** FAB intent color; defaults to `"primary"`. */
  @property({ type: String, reflect: true }) color: VuSpeeddialColor = "primary";
  /** FAB and action hit-target scale. */
  @property({ type: String, reflect: true }) size: VuSpeeddialSize = "md";
  /** Iconify name for the FAB icon when closed. */
  @property({ type: String }) icon = "ion:add";
  /** Iconify name when open (defaults to `ion:close`). */
  @property({ type: String }) iconOpen = "ion:close";
  /** Accessible name for the FAB (required when icon-only). */
  @property({ type: String }) label = "";
  /** Whether Escape closes the open cluster. */
  @property({ type: Boolean, reflect: true }) closeOnEsc = true;
  /** Whether pointer-down outside closes the open cluster. */
  @property({ type: Boolean, reflect: true }) closeOnOutside = true;

  private _expand: VuSpeeddialDirection = "top";

  @query('[part="fab"]')
  private _fabEl?: HTMLButtonElement;

  @query('[part="actions"]')
  private _actionsEl?: HTMLElement;

  private readonly _actionsPopover = new PopoverController(this, speeddialPopoverOptions(this));

  private static _idSeq = 0;
  private readonly _actionsId = `vu-speeddial-actions-${++VuSpeeddial._idSeq}`;
  private readonly _typeahead: MenuTypeaheadState = createMenuTypeaheadState();
  private _ready = false;
  private _syncingOpen = false;

  /** Resolved expansion side after viewport clamping (read-only). */
  get expand(): VuSpeeddialDirection {
    return this._expand;
  }

  /** @internal FAB anchor for the action menu popover. */
  get fabAnchorEl(): HTMLButtonElement | null {
    return this._fabEl ?? null;
  }

  /** @internal `popover="manual"` action menu surface. */
  get actionsPopoverEl(): HTMLElement | null {
    return this._actionsEl ?? null;
  }

  /** @internal Syncs PopoverController open state to the reflected `open` prop. */
  onActionsPopoverOpenChange(open: boolean): void {
    if (this._syncingOpen) return;
    const wasOpen = this.open;
    this.open = open;
    if (!open) {
      this._expand = this.direction;
      this._syncExpandAttr();
    }
    if (this._ready && wasOpen !== open) {
      this._emitOpenChange(open);
    }
    this._syncSlottedActions();
  }

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("direction") && !this.open) {
      this._expand = this.direction;
      this._syncExpandAttr();
    }
    if (changed.has("open") && this._ready) {
      const wasOpen = Boolean(changed.get("open"));
      if (this.open && !this._actionsPopover.open) {
        this._resolveExpandDirection();
        this._syncingOpen = true;
        this._actionsPopover.openPopover();
        this._syncingOpen = false;
      } else if (!this.open && (wasOpen || this._actionsPopover.open)) {
        this._syncingOpen = true;
        void this._actionsPopover.closePopover("api");
        this._syncingOpen = false;
      }
    }
    if (changed.has("direction") && this.open) {
      this._resolveExpandDirection();
      this._actionsPopover.position?.();
    }
  }

  override firstUpdated(): void {
    this._ready = true;
    this._syncExpandAttr();
    this._actionsPopover.refreshTargets();
    if (this.open) {
      this._resolveExpandDirection();
      this._actionsPopover.openPopover();
    }
    this._syncSlottedActions();
  }

  /** Opens the speed dial when actions are slotted. */
  show(): void {
    if (!this._hasActions || this.open) return;
    this._resolveExpandDirection();
    this._actionsPopover.openPopover();
  }

  /** Closes the speed dial. */
  hide(): void {
    if (!this.open) return;
    void this._actionsPopover.closePopover("api");
  }

  /** Toggles the speed dial. */
  toggle(): void {
    if (!this.open && !this._hasActions) return;
    if (!this.open) this._resolveExpandDirection();
    this._actionsPopover.toggle();
  }

  private get _hasActions(): boolean {
    return this._menuRows().length > 0;
  }

  private _menuRows(): HTMLElement[] {
    const slot = this.shadowRoot?.querySelector("slot:not([name])") as HTMLSlotElement | null;
    if (!slot) return [];
    return collectSpeeddialMenuRows(slot.assignedElements({ flatten: true }));
  }

  private _fabLabel(): string {
    const explicit = this.label.trim();
    return explicit || "Speed dial";
  }

  private _fabIcon(): string {
    return this.open && this.iconOpen ? this.iconOpen : this.icon;
  }

  private _syncExpandAttr(): void {
    const next = this._expand;
    if (this.getAttribute("data-expand") !== next) {
      this.setAttribute("data-expand", next);
    }
  }

  private _resolveExpandDirection(): void {
    if (!isClient()) {
      this._expand = this.direction;
      return;
    }

    const rect = this.getBoundingClientRect();
    const { innerWidth, innerHeight } = window;
    let next = this.direction;

    if (next === "top" && rect.top < VIEWPORT_PAD) {
      next = "bottom";
    } else if (next === "bottom" && rect.bottom + VIEWPORT_PAD > innerHeight) {
      next = "top";
    } else if (next === "left" && rect.left < VIEWPORT_PAD) {
      next = "right";
    } else if (next === "right" && rect.right + VIEWPORT_PAD > innerWidth) {
      next = "left";
    }

    if (this._expand !== next) {
      this._expand = next;
    }
    this._syncExpandAttr();
  }

  private _onFabClick = (): void => {
    this.toggle();
  };

  private _onFabKeydown = (event: KeyboardEvent): void => {
    if (!this.open) return;
    const rows = this._menuRows();
    if (rows.length === 0) return;
    const orientation = menuOrientationFromPlacement(this._expand);
    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    if (event.key === nextKey) {
      event.preventDefault();
      focusSpeeddialRowAt(rows, 0);
    }
  };

  private _onActionsKeydown = (event: KeyboardEvent): void => {
    if (!this.open) return;
    const rows = this._menuRows();
    handleMenuKeydown(
      event,
      rows,
      activeSpeeddialMenuRow(rows),
      this._typeahead,
      (index) => focusSpeeddialRowAt(rows, index),
      menuRowLabel,
      menuOrientationFromPlacement(this._expand),
    );
  };

  private _onActionsClick = (event: Event): void => {
    if (!this.open) return;
    const rows = this._menuRows();
    const path = event.composedPath();
    for (const row of rows) {
      if (
        path.includes(row) ||
        (row.shadowRoot && path.some((node) => row.shadowRoot?.contains(node as Node)))
      ) {
        this.hide();
        return;
      }
    }
  };

  private _onSlotChange = (): void => {
    this._syncSlottedActions();
  };

  private _syncSlottedActions(): void {
    syncSpeeddialMenuRows(this._menuRows(), this.open);
  }

  private _emitOpenChange(open: boolean): void {
    this.dispatchEvent(
      new CustomEvent(open ? "vu-open" : "vu-close", {
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent<VuSpeeddialOpenChangeDetail>("vu-open-change", {
        detail: { open, direction: this._expand },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    return html`
      <div part="root">
        <button
          part="fab"
          type="button"
          aria-label=${this._fabLabel()}
          aria-expanded=${this.open ? "true" : "false"}
          aria-haspopup="menu"
          aria-controls=${ifDefined(this.open ? this._actionsId : undefined)}
          @click=${this._onFabClick}
          @keydown=${this._onFabKeydown}
        >
          <vu-icon .icon=${this._fabIcon()}></vu-icon>
        </button>
        <div
          part="actions"
          id=${this._actionsId}
          role="menu"
          popover="manual"
          @toggle=${this._actionsPopover.onToggle}
          aria-hidden=${this.open ? "false" : "true"}
          @keydown=${this._onActionsKeydown}
          @click=${this._onActionsClick}
        >
          <slot @slotchange=${this._onSlotChange}></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-speeddial": VuSpeeddial;
  }
}
