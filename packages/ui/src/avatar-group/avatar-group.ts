import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { VuAvatar } from "../avatar/avatar.js";
import type { VuAvatarRadius, VuAvatarSize } from "../avatar/avatar.types.js";
import { avatarGroupStyles } from "./avatar-group.style.js";
import type { VuAvatarGroupSpacing } from "./avatar-group.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";


export type { VuAvatarGroupSpacing } from "./avatar-group.types.js";

const AVATAR_TAG = "vu-avatar";

/**
 * @element vu-avatar-group
 *
 * @summary An avatar group component that stacks overlapping avatars.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/avatar-group
 * @dependency vu-avatar
 *
 * @slot - One or more `<vu-avatar>` children.
 * @slot overflow - Custom `+N` overflow indicator.
 *
 * @property {number} max - Maximum avatars shown; `0` shows all. Default: `0`.
 * @property {number} total - Explicit total when extras are outside the slot. Default: `0`.
 * @property {VuAvatarSize} size - Uniform size forwarded to children. Default: `"md"`.
 * @property {VuAvatarRadius} radius - Uniform radius forwarded to children. Default: `"full"`.
 * @property {VuAvatarGroupSpacing} spacing - Overlap density. Default: `"md"`.
 * @property {boolean} bordered - Forwards bordered ring to children. Default: `true`.
 * @property {boolean} disabled - Disables the group and forwards to children. Default: `false`.
 *
 * @csspart group - Flex container for avatars and overflow tile.
 * @csspart overflow - Auto-rendered `+N` avatar tile.
 *
 * @cssproperty --avatar-group-overlap - Negative overlap between adjacent avatars.
 * @cssproperty --avatar-bordered-gap-color - Forwarded gap fill for bordered child rings (defaults to page background).
 */
@customElement("vu-avatar-group")
@withComponentPresets
export class VuAvatarGroup extends LitElement {
  static override styles = avatarGroupStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-avatar": VuAvatar,
  };

  /** Maximum avatars shown; `0` shows all. */
  @property({ type: Number })
  max = 0;

  /** Explicit total when extras are outside the slot. */
  @property({ type: Number })
  total = 0;

  /** Uniform size forwarded to children. */
  @property({ type: String, reflect: true })
  size: VuAvatarSize = "md";

  /** Uniform radius forwarded to children. */
  @property({ type: String, reflect: true })
  radius: VuAvatarRadius = "full";

  /** Overlap density between avatars. */
  @property({ type: String, reflect: true })
  spacing: VuAvatarGroupSpacing = "md";

  /** Forwards bordered ring to children. */
  @property({ type: Boolean, reflect: true })
  bordered = true;

  /** Disables the group and forwards to children. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** True when the consumer assigned `slot="overflow"` content. */
  @state()
  private _overflowSlotFilled = false;

  /** Live cache of slotted elements; @state so slot changes trigger a re-render and the derived getters recompute. */
  @state()
  private _slottedChildren: Element[] = [];

  override connectedCallback(): void {
    super.connectedCallback();
    this._slottedChildren = Array.from(this.children).filter((el) => !el.getAttribute("slot"));
    this._syncOverflowSlot();
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

  override updated(_changed: PropertyValues<this>): void {
    this._forwardAttributes();
  }

  /** Slotted children filtered down to actual `vu-avatar` elements. */
  private get _avatars(): HTMLElement[] {
    return this._slottedChildren.filter(
      (el): el is HTMLElement => el.tagName.toLowerCase() === AVATAR_TAG,
    );
  }

  /** Visible-avatar cap (`max` clamped against the actual child count; `0` means show all). */
  private get _limit(): number {
    const count = this._avatars.length;
    return this.max > 0 ? Math.min(this.max, count) : count;
  }

  /** Number of overflow avatars (`total - limit`); drives the `+N` indicator. */
  private get _overflow(): number {
    const totalCount = this.total > 0 ? this.total : this._avatars.length;
    return Math.max(0, totalCount - this._limit);
  }

  /** Mirrors group props onto every slotted avatar; runs post-render so overflow math is settled first. */
  private _forwardAttributes(): void {
    const avatars = this._avatars;
    const limit = this._limit;
    const visible = avatars.slice(0, limit);
    const hidden = avatars.slice(limit);

    visible.forEach((av, i) => {
      if (!(av instanceof VuAvatar)) return;
      av.size = this.size;
      av.radius = this.radius;
      av.bordered = this.bordered;
      av.disabled = this.disabled;
      av.hidden = false;
      av.style.setProperty("position", "relative");
      /* Ascending LTR: later avatars (and overflow) stack above earlier ones. */
      av.style.setProperty("z-index", String(i + 1));
    });

    const overflowZ = String(visible.length + 1);
    this.style.setProperty("--avatar-group-overflow-z", overflowZ);

    const overflowTile = this.renderRoot?.querySelector('[part="overflow"]') as HTMLElement | null;
    if (overflowTile) {
      overflowTile.style.setProperty("position", "relative");
      overflowTile.style.setProperty("z-index", overflowZ);
    }

    Array.from(this.children)
      .filter((el) => el.getAttribute("slot") === "overflow")
      .forEach((el) => {
        const node = el as HTMLElement;
        node.style.setProperty("position", "relative");
        node.style.setProperty("z-index", overflowZ);
      });

    hidden.forEach((av) => {
      if (av instanceof VuAvatar) av.hidden = true;
    });
  }

  private _refreshSlottedChildren(): void {
    const slot = this.renderRoot?.querySelector("slot:not([name])") as HTMLSlotElement | null;
    const assigned = slot?.assignedElements({ flatten: false });
    if (assigned && assigned.length > 0) {
      this._slottedChildren = assigned;
      return;
    }
    this._slottedChildren = Array.from(this.children).filter((el) => !el.getAttribute("slot"));
  }

  private _syncOverflowSlot(): void {
    this._overflowSlotFilled = Array.from(this.children).some(
      (el) => el.getAttribute("slot") === "overflow",
    );
  }

  private _onOverflowSlotChange = (): void => {
    this._syncOverflowSlot();
  };

  private _onSlotChange = (): void => {
    this._refreshSlottedChildren();
    this._forwardAttributes();
  };

  override render() {
    return html`
      <div part="group" role="group" aria-disabled=${this.disabled ? "true" : nothing}>
        <slot @slotchange=${this._onSlotChange}></slot>
        <slot name="overflow" @slotchange=${this._onOverflowSlotChange}>
          ${
            this._overflow > 0 && !this._overflowSlotFilled
              ? html`<vu-avatar
                  part="overflow"
                  size=${this.size}
                  radius=${this.radius}
                  ?bordered=${this.bordered}
                  ?disabled=${this.disabled}
                  aria-label=${`+${this._overflow} more`}
                  >+${this._overflow}</vu-avatar
                >`
              : nothing
          }
        </slot>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "vu-avatar-group": VuAvatarGroup;
  }
}
