import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";
import { closestVuFormElement, formById } from "../internals/form/vu-form-owner.js";
import { hasLightChildrenInSlot, lightChildElements, lightChildNodes } from "../internals/utils/slot.js";
import { VuIcon } from "../icon/icon.js";
import { buttonStyles } from "./button.style.js";
import type {
  VuButtonColor,
  VuButtonRadius,
  VuButtonSize,
  VuButtonType,
  VuButtonVariant,
} from "./button.types.js";
import { reflectString } from "../internals/utils/reflect-string.js";

export type {
  VuButtonColor,
  VuButtonRadius,
  VuButtonSize,
  VuButtonType,
  VuButtonVariant,
} from "./button.types.js";

/**
 * @element vu-button
 *
 * @summary A clickable button component with multiple variants and states.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/button
 * @dependency vu-icon
 *
 * @slot - Button label (text or markup).
 * @slot start - Optional leading icon, rendered before the label.
 * @slot end - Optional trailing icon, rendered after the label.
 *
 * @property {VuButtonVariant} variant - Visual treatment. Default: `"solid"`.
 * @property {VuButtonColor} color - Token intent. Default: `"default"`.
 * @property {VuButtonSize} size - Discrete size. Default: `"md"`.
 * @property {VuButtonRadius} radius - Corner preset (`none`/`sm`/`md`/`lg`/`full`). Default: `"md"`.
 * @property {VuButtonType} type - Native button type. Default: `"button"`.
 * @property {string} name - Form-control name submitted with `type="submit"`.
 * @property {string} value - Form-control value submitted with `name`.
 * @property {string} form - ID of an external `<form>` to submit or reset.
 * @property {boolean} disabled - Non-interactive; drops out of tab order. Default: `false`.
 * @property {boolean} loading - Shows a spinner and blocks clicks. Default: `false`.
 * @property {boolean} block - Stretches the button to fill its container. Default: `false`.
 * @property {boolean} iconOnly - Square 1:1 hit target; `label` is `aria-label` only. Default: `false`.
 * @property {string} label - Plain-text fallback for the default slot; icon-only buttons use it as `aria-label`.
 * @property {boolean} pressed - Toggle or selected state; exposes `aria-pressed`. Default: `false`.
 * @property {string} preset - Named bag from nearest `vu-config-provider`; omitted from the DOM while empty.
 *
 * @csspart base - The native `<button>` element (most styling lives here).
 * @csspart start - Wrapper around the leading icon slot.
 * @csspart end - Wrapper around the trailing icon slot.
 * @csspart label - Wrapper around the default text slot.
 * @csspart spinner - The loading spinner shown when `loading` is true.
 *
 * @cssproperty --btn-strong - Saturated background channel used by `solid` (auto-pinned per intent).
 * @cssproperty --btn-soft - Tinted background channel used by `soft` and as the hover bg for `outline` / `ghost`.
 * @cssproperty --btn-edge - Border color used by `outline`.
 * @cssproperty --btn-radius - Corner radius applied to the base button.
 * @cssproperty --btn-py - Block padding (overridden per `[size]`).
 * @cssproperty --btn-px - Inline padding (overridden per `[size]`).
 *
 * @fires {MouseEvent} click - Bubbles natively from the inner `<button>`. Suppressed when `disabled` or `loading`.
 */
@customElement("vu-button")
@withComponentPresets
export class VuButton extends LitElement {
  static override styles = buttonStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
  };

  static formAssociated = true;

  /** @internal Coordinator knobs owned by `<vu-button-group>`; never apply from presets. */
  static presetSkipKeys = ["attached", "axis", "radio"];

  /** Visual treatment. */
  @property({ type: String, reflect: true })
  variant: VuButtonVariant = "solid";

  /** Token intent. */
  @property({ type: String, reflect: true })
  color: VuButtonColor = "default";

  /** Discrete size. */
  @property({ type: String, reflect: true })
  size: VuButtonSize = "md";

  /** Explicit corner preset; `full` is capsule ends, `none` is square. */
  @property({ type: String, reflect: true })
  radius: VuButtonRadius = "md";

  /** Native button type. `submit` / `reset` trigger the associated form. */
  @property({ type: String, reflect: true })
  type: VuButtonType = "button";

  /** Form-control name; submitted as the button's value when this button submits the form. */
  @property(reflectString)
  name = "";

  /** Form-control value; paired with `name` on submit. */
  @property({ type: String })
  value = "";

  /** ID of an external `<form>` to submit / reset; falls back to the closest ancestor form. */
  @property(reflectString)
  form = "";

  /** Non-interactive, dimmed, drops out of tab order. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Replaces the label with a spinner and sets `aria-busy="true"`; blocks clicks. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  /** Stretches the button to fill its container. */
  @property({ type: Boolean, reflect: true })
  block = false;

  /** Square 1:1 hit target; `label` is `aria-label` only. */
  @property({ type: Boolean, reflect: true })
  iconOnly = false;

  /** Plain-text fallback for the default slot; on icon-only buttons it becomes `aria-label` only. */
  @property({ type: String })
  label = "";

  /** Toggle or selected state; exposes `aria-pressed`. */
  @property({ type: Boolean, reflect: true })
  pressed = false;

  /** @internal Set by `<vu-button-group>` on slotted children so this button's CSS can flatten the right corners. Do not set manually. */
  @property({ type: String, reflect: true })
  attached?: "first" | "middle" | "last" | "only";

  /** @internal Set by `<vu-button-group>` to indicate the cluster's layout direction; controls which corners the `[attached]` rules flatten. Do not set manually. */
  @property({ type: String, reflect: true })
  axis?: "horizontal" | "vertical";

  /** @internal Set by `<vu-button-group>` when its `selectionMode === "single"`, so this button renders its inner element as `role="radio"` with `aria-checked` and yields its tab stop (the group's roving-tabindex pattern keeps only the pressed radio focusable). Do not set manually. */
  @property({ type: Boolean, reflect: true })
  radio = false;

  @query('[part="base"]')
  private _button!: HTMLButtonElement | null;

  private internals: ElementInternals = this.attachInternals();

  private get _hasStart(): boolean {
    return hasLightChildrenInSlot(this, "start");
  }

  private get _hasEnd(): boolean {
    return hasLightChildrenInSlot(this, "end");
  }

  /** True when the default slot carries visible label content (text or non-icon markup). */
  private get _hasDefaultLabelContent(): boolean {
    for (const child of lightChildElements(this)) {
      const slot = child.getAttribute("slot") ?? "";
      if (slot !== "") continue;
      if (child.tagName.toLowerCase() === "vu-icon") continue;
      return true;
    }
    for (const node of lightChildNodes(this)) {
      if (node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim().length > 0) {
        return true;
      }
    }
    return false;
  }

  /** True when the default slot contains only `vu-icon` (no start/end required). */
  private get _hasDefaultIcon(): boolean {
    for (const child of lightChildElements(this)) {
      if ((child.getAttribute("slot") ?? "") !== "") continue;
      if (child.tagName.toLowerCase() === "vu-icon") return true;
    }
    return false;
  }

  /** Icon-only: explicit prop, or start/end/default icon with no visible label text. */
  private get _iconOnly(): boolean {
    if (this.iconOnly) return true;
    const hasIcons = this._hasStart || this._hasEnd || this._hasDefaultIcon;
    return hasIcons && !this._hasDefaultLabelContent;
  }

  /** Whether the label region should render (hidden when icon-only unless the icon lives there). */
  private get _showLabelPart(): boolean {
    if (this._hasDefaultLabelContent || this._hasDefaultIcon) return true;
    if (this._iconOnly) return false;
    return this.label.trim().length > 0;
  }

  /** Slot fallback text — only when the default slot is empty and not icon-only. */
  private get _labelFallback(): string {
    if (this._iconOnly || this._hasDefaultLabelContent) return "";
    return this.label;
  }

  /** Accessible name for icon-only: `label`, else slotted `vu-icon` aria-label/title. */
  private _ariaLabel(): string | typeof nothing {
    if (!this._iconOnly) return nothing;
    const fromProp = this.label.trim();
    if (fromProp) return fromProp;
    for (const child of lightChildElements(this)) {
      const slot = child.getAttribute("slot") ?? "";
      if (slot !== "" && slot !== "start" && slot !== "end") continue;
      if (child.tagName.toLowerCase() !== "vu-icon") continue;
      const fromIcon =
        child.getAttribute("aria-label")?.trim() || child.getAttribute("title")?.trim() || "";
      if (fromIcon) return fromIcon;
    }
    return nothing;
  }

  /** Reflect inferred icon-only for square CSS without flipping the `iconOnly` prop. */
  override updated(_changed: PropertyValues<this>): void {
    this.toggleAttribute("data-icononly", this._iconOnly);
  }

  /** Resolves the form this button submits / resets — `[form]` ID wins, otherwise `internals.form`. */
  private get _ownerForm(): HTMLFormElement | null {
    if (this.form) {
      const byId = formById(this, this.form);
      if (byId) return byId;
    }
    return this.internals.form ?? this.closest("form") ?? closestVuFormElement(this);
  }

  /** `vu-form.requestSubmit()` when the native owner is missing (shadow form). */
  private _submitOwner(): void {
    const form = this._ownerForm;
    if (form) {
      form.requestSubmit();
      return;
    }
    const host = this.closest("vu-form") as { requestSubmit?: () => void } | null;
    host?.requestSubmit?.();
  }

  /** `vu-form.reset()` when the native owner is missing (shadow form). */
  private _resetOwner(): void {
    const form = this._ownerForm;
    if (form) {
      form.reset();
      return;
    }
    const host = this.closest("vu-form") as { reset?: () => void } | null;
    host?.reset?.();
  }

  /** True when the button is non-interactive (either explicitly disabled or busy). */
  private get _isInert(): boolean {
    return this.disabled || this.loading;
  }

  /** Form-association callback: mirror the form's disabled state. */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  /** Form-association callback: nothing to reset on a button itself. */
  formResetCallback(): void {
    /* Buttons hold no value beyond `name`/`value`; no per-instance reset needed. */
  }

  /** Native `focus()` delegates to the inner `<button>` so consumers don't need to reach into shadow DOM. */
  override focus(options?: FocusOptions): void {
    this._button?.focus(options);
  }

  /** Native `click()` activates the inner `<button>` (which honors `disabled` / `loading` via `_onClick`). */
  override click(): void {
    this._button?.click();
  }

  private _onClick = (event: MouseEvent): void => {
    if (this._isInert) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.type === "submit") {
      /* Mirror the name/value contribution of a native submit button. */
      this.internals.setFormValue(this.value, this.value);
      this._submitOwner();
    } else if (this.type === "reset") {
      this._resetOwner();
    }
  };

  private _onSlotChange = (): void => {
    this.requestUpdate();
  };

  override render() {
    const ariaLabel = this._ariaLabel();

    /* Radio mode (set by <vu-button-group selectionMode='single'>): the inner
       element becomes role='radio' + aria-checked, and tabindex follows the
       roving pattern (only the pressed child is in the tab order).
       Toggle mode (manual `pressed` outside radio mode): aria-pressed.
       Plain button: no aria for state. */
    const role = this.radio ? "radio" : nothing;
    const ariaChecked = this.radio ? (this.pressed ? "true" : "false") : nothing;
    const ariaPressed = !this.radio && this.pressed ? "true" : nothing;
    const tabIndex = this.radio ? (this.pressed ? 0 : -1) : nothing;

    return html`
      <button
        part="base"
        type=${this.type}
        role=${role}
        name=${this.name || nothing}
        value=${this.value || nothing}
        ?disabled=${this.disabled}
        aria-busy=${this.loading ? "true" : nothing}
        aria-label=${ariaLabel}
        aria-pressed=${ariaPressed}
        aria-checked=${ariaChecked}
        tabindex=${tabIndex}
        @click=${this._onClick}
      >
        <span part="start">
          <slot name="start" @slotchange=${this._onSlotChange}></slot>
        </span>
        <span part="label">
          <slot @slotchange=${this._onSlotChange}>${this._labelFallback}</slot>
        </span>
        <span part="end">
          <slot name="end" @slotchange=${this._onSlotChange}></slot>
        </span>
        ${this.loading
          ? html`<span part="spinner" aria-hidden="true"></span>`
          : nothing}
      </button>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "vu-button": VuButton;
  }
}
