import { localized } from "@lit/localize";
import { html, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { msg, str } from "../internals/utils/localize.js";
import {
  clamp,
  parseCssColor,
  rgbToCss,
  type ParsedColor,
} from "../internals/utils/color-conversion.js";
import {
  FormControlBase,
  type FormState,
} from "../internals/form/form-control-base.js";
import { FieldValidationController } from "../internals/form/field-validation-controller.js";
import { requiredFieldValidator } from "../internals/form/field-validation.js";
import { renderFieldErrors } from "../internals/form/field-validation-render.js";
import { colorSliderStyles } from "./color-slider.style.js";
import {
  buildSliderColorObject,
  effectiveSliderChannel,
  formatSliderParsed,
  nextHueMemory,
  normalizeSliderChannel,
  parseSliderColorOrFallback,
  quantizeSliderChannel,
  readSliderNative,
  resolveSliderColorSpace,
  sliderDefaultStep,
  sliderFromPercent,
  sliderNativeRange,
  sliderThumbColor,
  sliderToPercent,
  writeSliderNative,
} from "./internals/color-slider-channel.js";
import { buildSliderTrackSolid } from "./internals/color-slider-tracks.js";
import type {
  VuColorSliderChangeDetail,
  VuColorSliderChannel,
  VuColorSliderColor,
  VuColorSliderColorSpace,
  VuColorSliderOrientation,
} from "./color-slider.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuColorSliderChangeDetail,
  VuColorSliderChannel,
  VuColorSliderColor,
  VuColorSliderColorSpace,
  VuColorSliderOrientation,
} from "./color-slider.types.js";
import { reflectString } from "../internals/utils/reflect-string.js";

/**
 * @element vu-color-slider
 *
 * @summary A color slider component for adjusting individual color channels.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/color-slider
 *
 * @slot error - Replaces default validation message list when assigned.
 *
 * @csspart track - The clickable gradient strip for the active channel.
 * @csspart thumb - The position indicator.
 * @csspart live - Visually-hidden live region announcing the value on commit.
 * @csspart field - Column that stacks the track and optional error.
 * @csspart error-message - Region for `slot="error"` or stacked default validation lines.
 * @csspart error-line - One default validation string when `slot="error"` is empty.
 *
 * @cssproperty --color-slider-length - Long-axis length of the slider. Defaults to `16rem`.
 * @cssproperty --color-slider-thickness - Short-axis thickness. Defaults to `0.875rem`.
 * @cssproperty --color-slider-radius - Corner radius of the track (defaults to a full pill).
 *
 * @fires {CustomEvent<VuColorSliderChangeDetail>} vu-input - Continuous: every drag tick / key press.
 * @fires {CustomEvent<VuColorSliderChangeDetail>} vu-change - Commit: pointer release or discrete key move.
 * @fires {CustomEvent} vu-invalid - When validation messages are recomputed while `validationActive`.
 *
 * Accessibility: host carries `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`, and `aria-orientation`. Keyboard: Arrow keys move by `step` (Shift × 10), Page keys jump by 10×, Home / End jump to extremes. The thumb is decorative; the host is the focus target.
 *
 * Forms: form-associated via `FormControlBase`. Set `name` to participate in `<form>` submissions — the value is the CSS color string. `defaultvalue` controls `<form>.reset()`. Inherits `disabled`, `required`, and the standard validity surface.
 */
@localized()
@customElement("vu-color-slider")
@withComponentPresets
export class VuColorSlider extends FormControlBase {
  static override styles = colorSliderStyles;

  /** Which channel this slider edits. */
  @property({ type: String, reflect: true })
  channel: VuColorSliderChannel = "hue";

  /** Current color as a CSS string (two-way bindable). */
  @property({ type: String, reflect: true })
  value = "#808080";

  /** Color model when not inferable from `value` / `channel`. Leave blank to auto-resolve. */
  @property(reflectString)
  colorSpace: VuColorSliderColorSpace | "" = "";

  /** Layout axis. */
  @property({ type: String, reflect: true })
  orientation: VuColorSliderOrientation = "horizontal";

  /** Keyboard step in the channel's native units. NaN uses channel defaults. */
  @property({ type: Number })
  step = NaN;

  /** Opaque color the alpha track fades up to; when blank, derived from the RGB of `value`. */
  @property({ type: String })
  baseColor = "";

  /** Accessible name. Defaults to a channel-appropriate label. */
  @property({ type: String })
  label = "";

  /** Shows validation after activation. */
  @property({ type: Boolean, reflect: true })
  showErrors = false;

  /** Drives invalid styling after activation. */
  @property({ type: Boolean, reflect: true })
  validationActive = false;

  /** True when the last validation run found errors. */
  @property({ type: Boolean, reflect: true })
  invalid = false;

  @query('[part="track"]')
  private _track!: HTMLElement | null;

  @state()
  private _announcement = "";

  @state() validationErrors: string[] = [];

  private readonly _validation = new FieldValidationController(this, "vu-csl");

  private _dragPointerId: number | null = null;
  private _isDragging = false;

  /** Preserves hue on neutral grays so the thumb does not snap to 0° arbitrarily. */
  private _hueMemory = 0;

  private _suppressValueEcho = false;

  private get _channelNorm(): VuColorSliderChannel {
    return normalizeSliderChannel(this.channel);
  }

  private _effectiveChannel(
    space: VuColorSliderColorSpace,
    ch: VuColorSliderChannel,
  ): VuColorSliderChannel {
    return effectiveSliderChannel(space, ch);
  }

  private _parseOrFallback(): ParsedColor {
    return parseSliderColorOrFallback(this.value);
  }

  private _resolveSpace(parsed: ParsedColor): VuColorSliderColorSpace {
    return resolveSliderColorSpace(this.value, this.colorSpace, this._channelNorm);
  }

  private _updateHueMemory(parsed: ParsedColor): void {
    this._hueMemory = nextHueMemory(parsed, this._hueMemory);
  }

  private _readNative(
    parsed: ParsedColor,
    space: VuColorSliderColorSpace,
    ech: VuColorSliderChannel,
  ): number {
    return readSliderNative(parsed, space, ech, this._hueMemory);
  }

  private _writeNative(
    parsed: ParsedColor,
    space: VuColorSliderColorSpace,
    ech: VuColorSliderChannel,
    native: number,
  ): ParsedColor {
    return writeSliderNative(parsed, space, ech, native);
  }

  private _nativeRange(ech: VuColorSliderChannel): [number, number] {
    return sliderNativeRange(ech);
  }

  private _defaultStep(ech: VuColorSliderChannel): number {
    return sliderDefaultStep(ech);
  }

  private _resolvedStep(ech: VuColorSliderChannel): number {
    if (Number.isFinite(this.step) && this.step > 0) return this.step;
    return this._defaultStep(ech);
  }

  private _formatParsed(parsed: ParsedColor): string {
    return formatSliderParsed(parsed);
  }

  private _buildTrackSolid(
    parsed: ParsedColor,
    space: VuColorSliderColorSpace,
    ech: VuColorSliderChannel,
  ): string {
    return buildSliderTrackSolid(parsed, space, ech, this.orientation);
  }

  private _thumbColor(parsed: ParsedColor): string {
    return sliderThumbColor(parsed);
  }

  private _toPercent(parsed: ParsedColor, space: VuColorSliderColorSpace): number {
    return sliderToPercent(parsed, space, this._channelNorm, this._hueMemory);
  }

  private _fromPercent(parsed: ParsedColor, space: VuColorSliderColorSpace, pct: number): number {
    return sliderFromPercent(parsed, space, this._channelNorm, pct, this._hueMemory);
  }

  private _buildColorObject(
    parsed: ParsedColor,
    space: VuColorSliderColorSpace,
  ): VuColorSliderColor {
    return buildSliderColorObject(parsed, space);
  }

  /** Returns the current color snapshot without dispatching events. */
  getColor(): VuColorSliderChangeDetail {
    const parsed = this._parseOrFallback();
    const space = this._resolveSpace(parsed);
    const ech = this._effectiveChannel(space, this._channelNorm);
    return {
      value: this._formatParsed(parsed),
      color: this._buildColorObject(parsed, space),
      channel: this._channelNorm,
      channelValue: this._quantizeChannel(ech, this._readNative(parsed, space, ech)),
    };
  }

  /** Snap channel reads to stable keyboard / test increments. */
  private _quantizeChannel(ech: VuColorSliderChannel, raw: number): number {
    return quantizeSliderChannel(ech, raw);
  }

  /** Replaces the CSS `value` from a full color string. */
  setColor(css: string): void {
    const p = parseCssColor(css);
    if (!p) return;
    this._suppressValueEcho = true;
    this.value = this._formatParsed(p);
    this._suppressValueEcho = false;
    this._updateHueMemory(p);
    this.syncFormValue();
    this.syncValidity();
  }

  /** Sets the manipulated channel to `next` (clamped) and updates `value`. Does not emit events. */
  setChannelValue(next: number): void {
    const parsed = this._parseOrFallback();
    const space = this._resolveSpace(parsed);
    const ech = this._effectiveChannel(space, this._channelNorm);
    const [lo, hi] = this._nativeRange(ech);
    const clamped = clamp(next, lo, hi);
    const written = this._writeNative(parsed, space, ech, clamped);
    this._suppressValueEcho = true;
    this.value = this._formatParsed(written);
    this._suppressValueEcho = false;
    this._updateHueMemory(written);
    this.syncFormValue();
    this.syncValidity();
    this.requestUpdate();
  }

  override updated(changed: PropertyValues): void {
    if (changed.has("value") && !this._suppressValueEcho) {
      const p = this._parseOrFallback();
      this._updateHueMemory(p);
    }
    const parsed = this._parseOrFallback();
    const space = this._resolveSpace(parsed);
    const ech = this._effectiveChannel(space, this._channelNorm);

    this.style.setProperty(
      "--color-slider-position",
      String(this._toPercent(parsed, space)),
    );

    if (ech === "alpha") {
      const opaque =
        this.baseColor.trim() !== ""
          ? this.baseColor.trim()
          : rgbToCss(parsed.rgb, 1);
      this.style.setProperty("--color-slider-base", opaque);
      this.style.removeProperty("--color-slider-track-solid");
    } else {
      this.style.setProperty(
        "--color-slider-track-solid",
        this._buildTrackSolid(parsed, space, ech),
      );
    }

    this.style.setProperty("--color-slider-thumb-color", this._thumbColor(parsed));

    if (changed.has("disabled")) {
      if (this.disabled) {
        this.removeAttribute("tabindex");
      } else if (!this.hasAttribute("tabindex")) {
        this.setAttribute("tabindex", "0");
      }
    }
    this._applyA11y(parsed, space, ech);
    super.updated(changed);
    if (
      changed.has("value") ||
      changed.has("name") ||
      changed.has("disabled") ||
      changed.has("channel") ||
      changed.has("colorSpace")
    ) {
      this.syncFormValue();
      this.syncValidity();
    }
  }

  protected override getFormValue(): FormState {
    if (!this.name) return null;
    const t = this.value.trim();
    if (!t) return null;
    return parseCssColor(t) ? t : null;
  }

  protected override setValueFromFormState(state: FormState): void {
    if (typeof state !== "string") return;
    this._suppressValueEcho = true;
    this.value = state;
    this._suppressValueEcho = false;
    const p = this._parseOrFallback();
    this._updateHueMemory(p);
    this.requestUpdate();
  }

  protected override getValidityAnchor(): HTMLElement | undefined {
    return this.shadowRoot?.querySelector('[part="thumb"]') ?? undefined;
  }

  protected override isEmpty(): boolean {
    const t = this.value.trim();
    if (!t) return true;
    return parseCssColor(t) === null;
  }

  private _fieldValidators() {
    return [
      requiredFieldValidator(this.required, () => this.isEmpty(), this.requiredMessage),
    ];
  }

  /** Runs validators; `vu-form` aggregates `validationErrors`. */
  validateInput(): boolean {
    return this._validation.validate(this._fieldValidators(), {
      syncValidity: () => this.syncValidity(),
    });
  }

  protected override onFormReset(): void {
    super.onFormReset();
    this._validation.clear();
  }

  protected override getNativeControl(): HTMLElement | null {
    return null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.disabled && !this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }
    this.addEventListener("keydown", this._onKeydown);
    const p0 = this._parseOrFallback();
    const s0 = this._resolveSpace(p0);
    this._applyA11y(p0, s0, this._effectiveChannel(s0, this._channelNorm));
    this.captureDefaultValue(this.value);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._onKeydown);
  }

  private _applyA11y(
    parsed: ParsedColor,
    space: VuColorSliderColorSpace,
    ech: VuColorSliderChannel,
  ): void {
    if (!this.hasAttribute("role")) this.setAttribute("role", "slider");
    const [lo, hi] = this._nativeRange(ech);
    const now = this._readNative(parsed, space, ech);
    this.setAttribute("aria-valuemin", String(lo));
    this.setAttribute("aria-valuemax", String(hi));
    this.setAttribute("aria-valuenow", String(this._roundForAria(ech, now)));
    this.setAttribute("aria-valuetext", this._valueText(ech, now));
    this.setAttribute("aria-orientation", this.orientation);
    this.setAttribute("aria-label", this.label || this._defaultLabel(ech));
    if (this._validation.showError) {
      this.setAttribute("aria-invalid", "true");
      this.setAttribute("aria-describedby", this._validation.errorId);
    } else {
      this.removeAttribute("aria-invalid");
      this.removeAttribute("aria-describedby");
    }
    if (this.disabled) {
      this.setAttribute("aria-disabled", "true");
    } else {
      this.removeAttribute("aria-disabled");
    }
  }

  private _defaultLabel(ech: VuColorSliderChannel): string {
    switch (ech) {
      case "hue":
        return String(msg("Hue", { desc: "Accessible name for the hue slider." }));
      case "saturation":
        return String(msg("Saturation", { desc: "Accessible name for the saturation slider." }));
      case "brightness":
        return String(msg("Brightness", { desc: "Accessible name for the brightness slider." }));
      case "lightness":
        return String(msg("Lightness", { desc: "Accessible name for the lightness slider." }));
      case "alpha":
        return String(msg("Alpha", { desc: "Accessible name for the alpha slider." }));
      case "red":
        return String(msg("Red", { desc: "Accessible name for the red channel slider." }));
      case "green":
        return String(msg("Green", { desc: "Accessible name for the green channel slider." }));
      case "blue":
        return String(msg("Blue", { desc: "Accessible name for the blue channel slider." }));
      default:
        return String(msg("Color", { desc: "Accessible name for a color control." }));
    }
  }

  private _valueText(ech: VuColorSliderChannel, now: number): string {
    if (ech === "hue") {
      return String(
        msg(str`${Math.round(now)} degrees`, { desc: "Hue slider value text for assistive tech." }),
      );
    }
    if (ech === "alpha") {
      return String(
        msg(str`${Math.round(now * 100)}%`, {
          id: "slider.alphaValue",
          desc: "Slider value text for assistive tech.",
        }),
      );
    }
    if (ech === "red" || ech === "green" || ech === "blue") {
      return String(Math.round(now));
    }
    return String(
      msg(str`${Math.round(now)}%`, {
        id: "slider.percentValue",
        desc: "Slider value text for assistive tech.",
      }),
    );
  }

  private _roundForAria(ech: VuColorSliderChannel, now: number): number {
    if (ech === "alpha") return Math.round(now * 100) / 100;
    if (ech === "hue" || ech === "red" || ech === "green" || ech === "blue") {
      return Math.round(now);
    }
    return Math.round(now);
  }

  private _onPointerDown = (event: PointerEvent): void => {
    if (this.disabled || this.readonly) return;
    if (event.button !== 0) return;
    this._dragPointerId = event.pointerId;
    this._isDragging = true;
    this._track?.setPointerCapture?.(event.pointerId);
    this.focus();
    this._updateFromPointer(event);
    this._emit("vu-input");
  };

  private _onPointerMove = (event: PointerEvent): void => {
    if (!this._isDragging || event.pointerId !== this._dragPointerId) return;
    this._updateFromPointer(event);
    this._emit("vu-input");
  };

  private _onPointerUp = (event: PointerEvent): void => {
    if (!this._isDragging || event.pointerId !== this._dragPointerId) return;
    this._isDragging = false;
    this._dragPointerId = null;
    this._track?.releasePointerCapture?.(event.pointerId);
    this._emit("vu-change");
  };

  private _onPointerCancel = (event: PointerEvent): void => {
    if (event.pointerId !== this._dragPointerId) return;
    this._isDragging = false;
    this._dragPointerId = null;
  };

  private _updateFromPointer(event: PointerEvent): void {
    const track = this._track;
    if (!track) return;
    const parsed = this._parseOrFallback();
    const space = this._resolveSpace(parsed);
    const rect = track.getBoundingClientRect();
    let percent: number;
    if (this.orientation === "horizontal") {
      if (rect.width === 0) return;
      percent = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    } else {
      if (rect.height === 0) return;
      percent = clamp((1 - (event.clientY - rect.top) / rect.height) * 100, 0, 100);
    }
    const native = this._fromPercent(parsed, space, percent);
    const ech = this._effectiveChannel(space, this._channelNorm);
    const written = this._writeNative(parsed, space, ech, native);
    this._suppressValueEcho = true;
    this.value = this._formatParsed(written);
    this._suppressValueEcho = false;
    this._updateHueMemory(written);
  }

  private _onKeydown = (event: KeyboardEvent): void => {
    if (this.disabled || this.readonly) return;
    const parsed = this._parseOrFallback();
    const space = this._resolveSpace(parsed);
    const ech = this._effectiveChannel(space, this._channelNorm);
    const step = this._resolvedStep(ech);
    const fineStep = event.shiftKey ? step * 10 : step;
    const [lo, hi] = this._nativeRange(ech);
    let next = this._readNative(parsed, space, ech);
    let handled = true;
    const isHorizontal = this.orientation === "horizontal";
    const incKey = isHorizontal ? "ArrowRight" : "ArrowUp";
    const decKey = isHorizontal ? "ArrowLeft" : "ArrowDown";
    switch (event.key) {
      case incKey:
        next += fineStep;
        break;
      case decKey:
        next -= fineStep;
        break;
      case "ArrowUp":
      case "ArrowRight":
        next += fineStep;
        break;
      case "ArrowDown":
      case "ArrowLeft":
        next -= fineStep;
        break;
      case "PageUp":
        next += step * 10;
        break;
      case "PageDown":
        next -= step * 10;
        break;
      case "Home":
        next = lo;
        break;
      case "End":
        next = hi;
        break;
      default:
        handled = false;
    }
    if (!handled) return;
    event.preventDefault();
    if (ech === "hue") next = Math.round(next);
    else if (ech !== "alpha") next = Math.round(next * 100) / 100;
    const written = this._writeNative(parsed, space, ech, clamp(next, lo, hi));
    const before = this.value;
    this._suppressValueEcho = true;
    this.value = this._formatParsed(written);
    this._suppressValueEcho = false;
    this._updateHueMemory(written);
    if (this.value !== before) {
      this._emit("vu-input");
      this._emit("vu-change");
    }
  };

  private _emit(type: "vu-input" | "vu-change"): void {
    const detail = this.getColor();
    if (type === "vu-change") {
      const ech = this._effectiveChannel(
        this._resolveSpace(this._parseOrFallback()),
        this._channelNorm,
      );
      this._announcement = `${this._defaultLabel(ech)} ${this._valueText(
        ech,
        detail.channelValue,
      )}`;
    }
    this.dispatchEvent(
      new CustomEvent<VuColorSliderChangeDetail>(type, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
    if (type === "vu-change") {
      this._validation.validateNow(this._fieldValidators(), {
        syncValidity: () => this.syncValidity(),
      });
    }
  }

  override render() {
    return html`
      <div class="color-slider-field" part="field">
        <div
          part="track"
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerCancel}
        >
          <div part="thumb"></div>
        </div>
        <div part="live" aria-live="polite" aria-atomic="true">${this._announcement}</div>
        ${when(this._validation.showError, () =>
          renderFieldErrors({
            errorId: this._validation.errorId,
            errors: this.validationErrors,
            errorMessageClass: "error-message field-error-message",
            errorLineClass: "color-slider-error-line field-error-line",
          }),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-color-slider": VuColorSlider;
  }
}
