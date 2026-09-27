import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, queryAssignedElements } from "lit/decorators.js";
import { VuButton } from "../button/button.js";
import { buttonGroupStyles } from "./button-group.style.js";
import type {
  VuButtonAttached,
  VuButtonGroupChangeDetail,
  VuButtonGroupColor,
  VuButtonGroupOrientation,
  VuButtonGroupSelectionMode,
  VuButtonGroupSize,
  VuButtonGroupVariant,
  VuButtonGroupRadius
} from "./button-group.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuButtonAttached,
  VuButtonGroupChangeDetail,
  VuButtonGroupColor,
  VuButtonGroupOrientation,
  VuButtonGroupSelectionMode,
  VuButtonGroupSize,
  VuButtonGroupVariant,
  VuButtonGroupRadius
} from "./button-group.types.js";

/** Tag names this group recognizes as cluster members. Anything else in the slot is ignored. */
const MEMBER_TAGS = ["vu-button", "vu-dropdown"] as const;
const MEMBER_SELECTOR = MEMBER_TAGS.join(",");

/** Attributes the group fills in on each child when the child hasn't set them itself. */
const FORWARDABLE_ATTRS = ["variant", "color", "size", "radius"] as const;
type ForwardableAttr = (typeof FORWARDABLE_ATTRS)[number];

/**
 * @element vu-button-group
 *
 * @summary A button group component with shared styling and optional selection.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/button-group
 * @dependency vu-button
 *
 * @slot - Two or more cluster members. Supported: `<vu-button>` and `<vu-dropdown>` (the dropdown's `[slot="trigger"]` `<vu-button>` is the visual surface that gets the cluster's variant / color / size / radius forwarded to it). Other tags are ignored — wrap raw `<button>` / `<a>` in `<vu-button>` first. `<vu-dropdown>` members are skipped from selection (`value` / `values`) — they remain trigger-only.
 *
 * @property {VuButtonGroupVariant} variant - Visual treatment forwarded to children. Default: `"solid"`.
 * @property {VuButtonGroupColor} color - Token intent forwarded to children. Default: `"default"`.
 * @property {VuButtonGroupSize} size - Discrete size forwarded to children. Default: `"md"`.
 * @property {VuButtonGroupRadius} radius - Corner preset (`none`/`sm`/`md`/`lg`/`full`). Default: `md`.
 * @property {VuButtonGroupOrientation} orientation - Layout axis. Default: `"horizontal"`.
 * @property {boolean} disabled - Disables every child while set. Default: `false`.
 * @property {string} label - Accessible name for the group container.
 * @property {VuButtonGroupSelectionMode} selectionMode - Selection model; HTML attribute is `selectionmode`. Default: `"none"`.
 * @property {string} value - Selected value when `selectionMode === "single"`.
 * @property {string[]} values - Selected values when `selectionMode === "multiple"`.
 *
 * @fires {CustomEvent<VuButtonGroupChangeDetail>} vu-change - User toggled selection (not programmatic `value` / `values` writes).
 *
 * @csspart base - The inner `[role="group"]` (or `[role="radiogroup"]`) container that wraps the slot.
 *
 * @cssproperty --vu-border-width-emphasis - Used for the seam-collapse negative margin on the `outline` variant; recolor by overriding on the host.
 */
@customElement("vu-button-group")
@withComponentPresets
export class VuButtonGroup extends LitElement {
  static override styles = buttonGroupStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-button": VuButton,
  };

  /** Visual treatment forwarded to children that haven't set their own. */
  @property({ type: String, reflect: true })
  variant: VuButtonGroupVariant = "solid";

  /** Token intent forwarded to children that haven't set their own. */
  @property({ type: String, reflect: true })
  color: VuButtonGroupColor = "default";

  /** Discrete size forwarded to children that haven't set their own. */
  @property({ type: String, reflect: true })
  size: VuButtonGroupSize = "md";

  /** Explicit corner preset; `full` is capsule ends, `none` is square. */
  @property({ type: String, reflect: true })
  radius: VuButtonGroupRadius = "md";

  /** Layout axis. */
  @property({ type: String, reflect: true })
  orientation: VuButtonGroupOrientation = "horizontal";

  /** Disables every child while set. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Accessible name for the group container. */
  @property({ type: String })
  label = "";

  /** Selection model; HTML attribute is `selectionmode`. */
  @property({ type: String, reflect: true })
  selectionMode: VuButtonGroupSelectionMode = "none";

  /** Selected value when `selectionMode === "single"`. */
  @property({ type: String })
  value = "";

  /** Selected values when `selectionMode === "multiple"`. */
  @property({ attribute: false })
  values: string[] = [];

  @queryAssignedElements({ flatten: true, selector: MEMBER_SELECTOR })
  private _members!: Element[];

  /** Per-element set of attribute names this group owns (filled in on demand). Used to release attrs the consumer never set themselves. WeakMap so detached elements don't leak. */
  private _ownedAttrs = new WeakMap<Element, Set<string>>();

  override connectedCallback(): void {
    super.connectedCallback();
    /* Initial sync runs before the slotchange-triggered sync so first paint
       is correct even when light children were already attached at parse time. */
    queueMicrotask(() => this._syncChildren());
  }

  override updated(changed: PropertyValues<this>): void {
    if (
      changed.has("variant") ||
      changed.has("color") ||
      changed.has("size") ||
      changed.has("radius") ||
      changed.has("orientation") ||
      changed.has("disabled") ||
      changed.has("selectionMode") ||
      changed.has("value") ||
      changed.has("values")
    ) {
      this._syncChildren();
    }
  }

  private _onSlotChange = (): void => {
    this._syncChildren();
  };

  /** Forwards group props onto each cluster member (and its inner trigger button when the member is `<vu-dropdown>`), marks the cluster position, propagates disabled, and reconciles selection state when `selectionMode !== "none"`. */
  private _syncChildren(): void {
    const members = this._members ?? [];
    const total = members.length;
    if (total === 0) return;

    const wantDisabled = this.disabled;
    const mode = this.selectionMode;
    const valueSet = mode === "multiple" ? new Set(this.values) : null;

    for (let i = 0; i < total; i++) {
      const member = members[i];
      const attached: VuButtonAttached =
        total === 1 ? "only" : i === 0 ? "first" : i === total - 1 ? "last" : "middle";

      /* Outer member always carries attached/axis — the seam-collapse + z-index lift in button-group.style.ts targets the slotted host directly. */
      this._relayAttachedAxis(member, attached);

      /* The visual surface (where corners flatten + paint forwarding lands) is the member itself for vu-button, or the inner [slot='trigger'] vu-button for vu-dropdown. */
      const surface = this._surfaceOf(member);
      if (surface && surface !== member) {
        this._relayAttachedAxis(surface, attached);
      }

      const target = surface ?? member;
      for (const attr of FORWARDABLE_ATTRS) {
        this._claimAttribute(target, attr, this[attr] as string);
      }

      /* Disabled propagates to BOTH the surface (so the button's own disabled UI engages) and the member (cosmetic only on vu-dropdown today, but future-proof). */
      if (wantDisabled) {
        if (surface) this._claimBooleanAttribute(surface, "disabled", true);
        if (member !== surface) this._claimBooleanAttribute(member, "disabled", true);
      } else {
        if (surface) this._releaseAttribute(surface, "disabled");
        if (member !== surface) this._releaseAttribute(member, "disabled");
      }

      /* Selection: only vu-button members participate. Dropdowns stay trigger-only — selecting a dropdown trigger isn't a defensible UX (its "selected" state is "open", which the dropdown owns). */
      const isSelectableMember =
        mode !== "none" && member.tagName.toLowerCase() === "vu-button" && surface !== null;
      if (isSelectableMember) {
        const button = surface as VuButton;
        const wantRadio = mode === "single";
        let wantPressed = false;
        if (mode === "single") wantPressed = !!button.value && button.value === this.value;
        else if (mode === "multiple") wantPressed = !!button.value && !!valueSet?.has(button.value);
        this._claimBooleanAttribute(button, "radio", wantRadio);
        this._claimBooleanAttribute(button, "pressed", wantPressed);
      } else if (surface) {
        /* selectionMode flipped back to "none" or this member is a dropdown — release the attrs we may have claimed earlier so consumers' explicit `pressed` (e.g. a stand-alone toggle button) survives. */
        this._releaseAttribute(surface, "radio");
        this._releaseAttribute(surface, "pressed");
      }
    }
  }

  /** Returns the `<vu-button>` that paints the cluster member's visual surface — the member itself, or its first `[slot='trigger']` `<vu-button>` child when the member is a `<vu-dropdown>`. Returns `null` for unrecognized members. */
  private _surfaceOf(member: Element): VuButton | null {
    const tag = member.tagName.toLowerCase();
    if (tag === "vu-button") return member as VuButton;
    if (tag !== "vu-dropdown") return null;
    for (const child of Array.from(member.children)) {
      if (child.getAttribute("slot") !== "trigger") continue;
      if (child.tagName.toLowerCase() === "vu-button") return child as VuButton;
    }
    return null;
  }

  /** Selectable surfaces in DOM order — the inner-button surfaces of `<vu-button>` members only (dropdowns excluded). Used by click + keyboard handlers. */
  private _selectableSurfaces(): VuButton[] {
    const out: VuButton[] = [];
    for (const member of this._members ?? []) {
      if (member.tagName.toLowerCase() !== "vu-button") continue;
      const surface = this._surfaceOf(member);
      if (surface) out.push(surface);
    }
    return out;
  }

  private _onClick = (event: MouseEvent): void => {
    if (this.selectionMode === "none" || this.disabled) return;
    const path = event.composedPath();
    /* Walk the composed path and pick the first VuButton that's a direct
       member of this group (skips inner spans, slots, and the host itself). */
    const button = path.find(
      (n): n is VuButton =>
        n instanceof VuButton && n.parentElement === this && !n.disabled,
    );
    if (!button || !button.value) return;
    if (this.selectionMode === "single") {
      if (this.value === button.value) return;
      this.value = button.value;
      this._emitChange(button);
    } else {
      const set = new Set(this.values);
      if (set.has(button.value)) set.delete(button.value);
      else set.add(button.value);
      this.values = Array.from(set);
      this._emitChange(button);
    }
  };

  private _onKeydown = (event: KeyboardEvent): void => {
    if (this.selectionMode !== "single" || this.disabled) return;
    const isHorizontal = this.orientation === "horizontal";
    const fwd = isHorizontal ? "ArrowRight" : "ArrowDown";
    const back = isHorizontal ? "ArrowLeft" : "ArrowUp";

    let delta: 1 | -1 | "first" | "last" | null = null;
    if (event.key === fwd) delta = 1;
    else if (event.key === back) delta = -1;
    else if (event.key === "Home") delta = "first";
    else if (event.key === "End") delta = "last";
    else return;

    const surfaces = this._selectableSurfaces().filter((b) => !b.disabled && b.value);
    if (surfaces.length === 0) return;
    event.preventDefault();

    const currentIdx = surfaces.findIndex((b) => b.value === this.value);
    let nextIdx: number;
    if (delta === "first") nextIdx = 0;
    else if (delta === "last") nextIdx = surfaces.length - 1;
    else if (currentIdx < 0) nextIdx = delta > 0 ? 0 : surfaces.length - 1;
    else nextIdx = (currentIdx + delta + surfaces.length) % surfaces.length;

    const next = surfaces[nextIdx];
    if (this.value !== next.value) {
      this.value = next.value;
      this._emitChange(next);
    }
    /* Focus immediately — programmatic focus works regardless of the inner
       button's transient tabindex; the next _syncChildren tick flips
       tabindex to keep the roving pattern consistent. */
    next.focus();
  };

  private _emitChange(source: HTMLElement | null): void {
    const detail: VuButtonGroupChangeDetail =
      this.selectionMode === "single"
        ? { value: this.value, values: this.value ? [this.value] : [], source }
        : this.selectionMode === "multiple"
          ? { value: "", values: [...this.values], source }
          : { value: "", values: [], source };
    this.dispatchEvent(
      new CustomEvent<VuButtonGroupChangeDetail>("vu-change", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Forwards `attached` / `axis` via Lit properties on `<vu-button>`, attributes elsewhere. */
  private _relayAttachedAxis(el: Element, attached: VuButtonAttached): void {
    if (el instanceof VuButton) {
      if (this._owns(el, "attached") || !el.hasAttribute("attached")) {
        el.attached = attached;
        this._setOwnership(el, "attached", true);
      }
      if (this._owns(el, "axis") || !el.hasAttribute("axis")) {
        el.axis = this.orientation;
        this._setOwnership(el, "axis", true);
      }
      return;
    }
    if (this._owns(el, "attached") || !el.hasAttribute("attached")) {
      el.setAttribute("attached", attached);
      this._setOwnership(el, "attached", true);
    }
    if (this._owns(el, "axis") || !el.hasAttribute("axis")) {
      el.setAttribute("axis", this.orientation);
      this._setOwnership(el, "axis", true);
    }
  }

  /** Sets a forwarded prop on a child only when the child doesn't have it (consumer-set), or when this group previously claimed it. */
  private _claimAttribute(el: Element, attr: ForwardableAttr | "disabled", value: string): void {
    const owned = this._owns(el, attr);
    if (!(owned || !el.hasAttribute(attr))) return;
    if (el instanceof VuButton && attr === "variant") {
      el.variant = value as VuButton["variant"];
    } else if (el instanceof VuButton && attr === "color") {
      el.color = value as VuButton["color"];
    } else if (el instanceof VuButton && attr === "size") {
      el.size = value as VuButton["size"];
    } else if (el instanceof VuButton && attr === "radius") {
      el.radius = value as VuButton["radius"];
    } else if (el instanceof VuButton && attr === "disabled") {
      el.disabled = true;
    } else {
      el.setAttribute(attr, value);
    }
    this._setOwnership(el, attr, true);
  }

  /** Boolean variant of `_claimAttribute` (presence == true). */
  private _claimBooleanAttribute(el: Element, attr: string, value: boolean): void {
    if (value) {
      const owned = this._owns(el, attr);
      if (!(owned || !el.hasAttribute(attr))) return;
      if (el instanceof VuButton) {
        if (attr === "disabled") el.disabled = true;
        else if (attr === "radio") el.radio = true;
        else if (attr === "pressed") el.pressed = true;
        else el.setAttribute(attr, "");
      } else {
        el.setAttribute(attr, "");
      }
      this._setOwnership(el, attr, true);
    } else {
      this._releaseAttribute(el, attr);
    }
  }

  /** Removes a forwarded prop only if this group claimed it; consumer-set values stay. */
  private _releaseAttribute(el: Element, attr: string): void {
    if (!this._owns(el, attr)) return;
    if (el instanceof VuButton) {
      if (attr === "disabled") el.disabled = false;
      else if (attr === "radio") el.radio = false;
      else if (attr === "pressed") el.pressed = false;
      else if (attr === "variant" || attr === "color" || attr === "size" || attr === "radius") {
        el.removeAttribute(attr);
      } else {
        el.removeAttribute(attr);
      }
    } else {
      el.removeAttribute(attr);
    }
    this._setOwnership(el, attr, false);
  }

  private _owns(el: Element, attr: string): boolean {
    return this._ownedAttrs.get(el)?.has(attr) ?? false;
  }

  private _setOwnership(el: Element, attr: string, owned: boolean): void {
    let set = this._ownedAttrs.get(el);
    if (!set) {
      if (!owned) return;
      set = new Set();
      this._ownedAttrs.set(el, set);
    }
    if (owned) set.add(attr);
    else set.delete(attr);
  }

  override render() {
    const role = this.selectionMode === "single" ? "radiogroup" : "group";
    return html`
      <div
        part="base"
        role=${role}
        aria-label=${this.label || nothing}
        aria-orientation=${role === "radiogroup" ? this.orientation : nothing}
        aria-disabled=${this.disabled ? "true" : nothing}
        @click=${this._onClick}
        @keydown=${this._onKeydown}
      >
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "vu-button-group": VuButtonGroup;
  }
}
