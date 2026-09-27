import { localized } from "@lit/localize";
import { html, isServer, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import {
  clamp,
} from "../internals/utils/color-conversion.js";
import {
  FormControlBase,
  type FormState,
} from "../internals/form/form-control-base.js";
import { FieldValidationController } from "../internals/form/field-validation-controller.js";
import { requiredFieldValidator } from "../internals/form/field-validation.js";
import { renderFieldErrors } from "../internals/form/field-validation-render.js";
import { applyColorAreaA11y } from "./internals/color-area-a11y.js";
import {
  colorAreaAxisDisplayValue,
  colorAreaAxisLabel,
  colorAreaNativeToPct,
  colorAreaRgbAtPlanePoint,
  effectiveColorAreaAxes,
  normalizeColorAreaChannel,
  readColorAreaIdle,
  useCssHsvColorAreaPlane,
  usesColorAreaRgbAxes,
  type ColorAreaAxisState,
} from "./internals/color-area-axes.js";
import {
  onColorAreaKeydown,
  onColorAreaPointerCancel,
  onColorAreaPointerDown,
  onColorAreaPointerMove,
  onColorAreaPointerUp,
  type ColorAreaInputHost,
} from "./internals/color-area-input.js";
import {
  buildDetail,
  ingestValue,
  resolvedCss,
  rgbFromProps,
  type ColorAreaChannelPatch,
} from "./internals/color-area-model.js";
import { paintColorAreaPlane } from "./internals/color-area-plane-paint.js";
import { colorAreaStyles } from "./color-area.style.js";
import type {
  VuColorAreaChangeDetail,
  VuColorAreaChannel,
  VuColorAreaColorSpace,
} from "./color-area.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuColorAreaChangeDetail,
  VuColorAreaChannel,
  VuColorAreaColorSpace,
} from "./color-area.types.js";
import { reflectString } from "../internals/utils/reflect-string.js";

/**
 * @element vu-color-area
 *
 * @summary A two-dimensional color picker component for saturation and brightness.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/color-area
 *
 * @slot error - Replaces default validation message list when assigned.
 *
 * @csspart base - Clickable plane (CSS gradients or canvas).
 * @csspart thumb - Picked-color thumb.
 * @csspart dots - Optional `showdots` overlay.
 * @csspart live - Live region on commit.
 * @csspart field - Column that stacks the plane and optional error.
 * @csspart error-message - Region for `slot="error"` or stacked default validation lines.
 * @csspart error-line - One default validation string when `slot="error"` is empty.
 *
 * @fires {CustomEvent<VuColorAreaChangeDetail>} vu-input - Continuous while dragging or adjusting with keys.
 * @fires {CustomEvent<VuColorAreaChangeDetail>} vu-change - Commit when the pointer releases or a discrete key moves.
 * @fires {CustomEvent} vu-invalid - When validation messages are recomputed while `validationActive`.
 *
 * @remarks Pair with `<vu-color-picker>` only for default `hsb` + saturation × brightness. `hue` / `saturation` / `brightness` store HSV in `hsb`/`rgb` and HSL H/S/L in `hsl`. `red` / `green` / `blue` mirror the resolved sRGB triplet and hold the idle channel on RGB cube faces.
 */
@localized()
@customElement("vu-color-area")
@withComponentPresets
export class VuColorArea extends FormControlBase implements ColorAreaInputHost {
  static override styles = colorAreaStyles;

  /** @internal Reflected plane backend for CSS (`css` gradients vs `canvas`). */
  @property({ type: String, reflect: true })
  planeRenderer: "css" | "canvas" = "canvas";

  @property(reflectString)
  value = "";

  @property({ type: String, reflect: true })
  colorSpace: VuColorAreaColorSpace = "hsb";

  @property({ type: String, reflect: true })
  xChannel: VuColorAreaChannel = "saturation";

  @property({ type: String, reflect: true })
  yChannel: VuColorAreaChannel = "brightness";

  @property({ type: Number, reflect: true })
  hue = 0;

  @property({ type: Number, reflect: true })
  saturation = 100;

  @property({ type: Number, reflect: true })
  brightness = 100;

  @property({ type: Number, reflect: true })
  red = 255;

  @property({ type: Number, reflect: true })
  green = 255;

  @property({ type: Number, reflect: true })
  blue = 255;

  @property({ type: Number })
  step = 1;

  @property({ type: Boolean, reflect: true })
  showDots = false;

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

  @query('[part="base"]')
  _base!: HTMLElement | null;

  @query("canvas.plane")
  private _planeCanvas!: HTMLCanvasElement | null;

  @state()
  private _announcement = "";

  @state() validationErrors: string[] = [];

  private readonly _validation = new FieldValidationController(this, "vu-ca");

  _dragPointerId: number | null = null;
  _isDragging = false;
  private _suppressIncoming = false;
  private _resizeObserver: ResizeObserver | null = null;
  private _paintPending = false;

  _axisState(): ColorAreaAxisState {
    return {
      colorSpace: this.colorSpace,
      xChannel: this.xChannel,
      yChannel: this.yChannel,
      hue: this.hue,
      saturation: this.saturation,
      brightness: this.brightness,
      red: this.red,
      green: this.green,
      blue: this.blue,
    };
  }

  private _usesRgbAxes(): boolean {
    return usesColorAreaRgbAxes(this._axisState());
  }

  private _normalizeChannel(raw: string): VuColorAreaChannel {
    return normalizeColorAreaChannel(raw);
  }

  private _effectiveAxes(): { x: VuColorAreaChannel; y: VuColorAreaChannel } {
    return effectiveColorAreaAxes(this._axisState());
  }

  private _useCssHsvPlane(): boolean {
    return useCssHsvColorAreaPlane(this._axisState());
  }

  override willUpdate(changed: PropertyValues): void {
    const skipValueIngest = this._suppressIncoming;
    if (skipValueIngest) this._suppressIncoming = false;

    const { x, y } = this._effectiveAxes();
    if (x !== this.xChannel) this.xChannel = x;
    if (y !== this.yChannel) this.yChannel = y;

    if (changed.has("colorSpace")) {
      const cs = this.colorSpace;
      if (cs !== "hsb" && cs !== "hsl" && cs !== "rgb") {
        this.colorSpace = "hsb";
      }
    }
    if (changed.has("xChannel")) {
      this.xChannel = this._normalizeChannel(this.xChannel);
    }
    if (changed.has("yChannel")) {
      this.yChannel = this._normalizeChannel(this.yChannel);
    }

    if (changed.has("value") && !skipValueIngest) {
      this._ingestValue(this.value);
    }

    if (
      (changed.has("hue") ||
        changed.has("saturation") ||
        changed.has("brightness")) &&
      !this._usesRgbAxes()
    ) {
      const rgb = rgbFromProps(this._axisState());
      this.red = rgb.r;
      this.green = rgb.g;
      this.blue = rgb.b;
    }

    const channelDirtied =
      changed.has("hue") ||
      changed.has("saturation") ||
      changed.has("brightness") ||
      changed.has("red") ||
      changed.has("green") ||
      changed.has("blue") ||
      changed.has("colorSpace") ||
      changed.has("xChannel") ||
      changed.has("yChannel") ||
      changed.has("value");
    if (channelDirtied) {
      const css = resolvedCss(this._axisState());
      if (this.value !== css) {
        this._suppressIncoming = true;
        this.value = css;
      }
    }

    const nextRenderer = this._useCssHsvPlane() ? "css" : "canvas";
    if (this.planeRenderer !== nextRenderer) {
      this.planeRenderer = nextRenderer;
    }

    super.willUpdate(changed);
  }

  override updated(changed: PropertyValues): void {
    this._syncThumbCssVars();

    const channelDirtied =
      changed.has("hue") ||
      changed.has("saturation") ||
      changed.has("brightness") ||
      changed.has("red") ||
      changed.has("green") ||
      changed.has("blue") ||
      changed.has("colorSpace") ||
      changed.has("xChannel") ||
      changed.has("yChannel") ||
      changed.has("value");

    if (channelDirtied) {
      this.style.setProperty("--color-area-hue", String(clamp(this.hue, 0, 360)));
      this.style.setProperty(
        "--color-area-saturation",
        String(clamp(this.saturation, 0, 100)),
      );
      this.style.setProperty(
        "--color-area-brightness",
        String(clamp(this.brightness, 0, 100)),
      );
      this.style.setProperty("--color-area-color", resolvedCss(this._axisState()));
    }

    if (changed.has("disabled")) {
      if (this.disabled) {
        this.removeAttribute("tabindex");
      } else if (!this.hasAttribute("tabindex")) {
        this.setAttribute("tabindex", "0");
      }
    }
    applyColorAreaA11y(this, this._axisState(), {
      label: this.label,
      disabled: this.disabled,
    });
    if (this._validation.showError) {
      this.setAttribute("aria-invalid", "true");
      this.setAttribute("aria-describedby", this._validation.errorId);
    } else {
      this.removeAttribute("aria-invalid");
      this.removeAttribute("aria-describedby");
    }
    super.updated(changed);

    if (
      changed.has("value") ||
      changed.has("hue") ||
      changed.has("saturation") ||
      changed.has("brightness") ||
      changed.has("red") ||
      changed.has("green") ||
      changed.has("blue") ||
      changed.has("name") ||
      changed.has("disabled") ||
      changed.has("colorSpace") ||
      changed.has("xChannel") ||
      changed.has("yChannel")
    ) {
      this.syncFormValue();
      this.syncValidity();
    }

    if (
      changed.has("hue") ||
      changed.has("saturation") ||
      changed.has("brightness") ||
      changed.has("red") ||
      changed.has("green") ||
      changed.has("blue") ||
      changed.has("colorSpace") ||
      changed.has("xChannel") ||
      changed.has("yChannel") ||
      changed.has("disabled")
    ) {
      this._schedulePlanePaint();
    }
  }

  private _readIdle(ch: VuColorAreaChannel): number {
    return readColorAreaIdle(this._axisState(), ch);
  }

  private _syncThumbCssVars(): void {
    const { x, y } = this._effectiveAxes();
    const xv = this._readIdle(x);
    const yv = this._readIdle(y);
    const xPct = colorAreaNativeToPct(x, xv);
    const yPct = colorAreaNativeToPct(y, yv);
    this.style.setProperty("--color-area-thumb-x-pct", String(xPct));
    this.style.setProperty("--color-area-thumb-y-pct", String(yPct));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.disabled && !this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }
    this.addEventListener("keydown", this._onKeydown);
    applyColorAreaA11y(this, this._axisState(), {
      label: this.label,
      disabled: this.disabled,
    });
    const rgb0 = rgbFromProps(this._axisState());
    this.red = rgb0.r;
    this.green = rgb0.g;
    this.blue = rgb0.b;
    if (!this.value) {
      this._suppressIncoming = true;
      this.value = resolvedCss(this._axisState());
    } else {
      this._ingestValue(this.value);
    }
    this.captureDefaultValue(this.value);

    if (isServer || typeof ResizeObserver === "undefined") return;
    this._resizeObserver = new ResizeObserver(() => this._schedulePlanePaint());
    this._resizeObserver.observe(this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._onKeydown);
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  setSV(saturation: number, brightness: number): void {
    const s = Math.round(clamp(saturation, 0, 100));
    const b = Math.round(clamp(brightness, 0, 100));
    if (s === this.saturation && b === this.brightness) return;
    this._suppressIncoming = true;
    this.saturation = s;
    this.brightness = b;
    this.value = resolvedCss(this._axisState());
  }

  getColor(): VuColorAreaChangeDetail {
    return buildDetail(this._axisState());
  }

  protected override getFormValue(): FormState {
    if (!this.name) return null;
    return this.value || null;
  }

  protected override setValueFromFormState(state: FormState): void {
    this.value = typeof state === "string" ? state : "";
  }

  protected override getValidityAnchor(): HTMLElement | undefined {
    return this.shadowRoot?.querySelector('[part="thumb"]') ?? this._base ?? undefined;
  }

  protected override isEmpty(): boolean {
    return !this.value;
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

  _applyChannelPatch(patch: ColorAreaChannelPatch): void {
    this.hue = patch.hue;
    this.saturation = patch.saturation;
    this.brightness = patch.brightness;
    this.red = patch.red;
    this.green = patch.green;
    this.blue = patch.blue;
  }

  private _ingestValue(input: string): void {
    const patch = ingestValue(this._axisState(), input);
    if (!patch) return;
    this._applyChannelPatch(patch);
  }

  private _axisLabel(ch: VuColorAreaChannel): string {
    return colorAreaAxisLabel(this.colorSpace, ch);
  }

  private _axisDisplayValue(ch: VuColorAreaChannel): string {
    return colorAreaAxisDisplayValue(this.colorSpace, ch, this._readIdle(ch));
  }

  private _schedulePlanePaint(): void {
    if (this._paintPending || this._useCssHsvPlane() || this.disabled) return;
    this._paintPending = true;
    requestAnimationFrame(() => {
      this._paintPending = false;
      if (this._useCssHsvPlane()) return;
      this._paintPlaneCanvas();
    });
  }

  private _paintPlaneCanvas(): void {
    const canvas = this._planeCanvas;
    const base = this._base;
    if (!canvas || !base || this._useCssHsvPlane()) return;
    paintColorAreaPlane(canvas, base, (xPct, yPct) =>
      colorAreaRgbAtPlanePoint(this._axisState(), xPct, yPct),
    );
  }

  private _onPointerDown = (event: PointerEvent): void => {
    onColorAreaPointerDown(this, event);
  };

  private _onPointerMove = (event: PointerEvent): void => {
    onColorAreaPointerMove(this, event);
  };

  private _onPointerUp = (event: PointerEvent): void => {
    onColorAreaPointerUp(this, event);
  };

  private _onPointerCancel = (event: PointerEvent): void => {
    onColorAreaPointerCancel(this, event);
  };

  private _onKeydown = (event: KeyboardEvent): void => {
    onColorAreaKeydown(this, event);
  };

  _emit(type: "vu-input" | "vu-change"): void {
    const detail = buildDetail(this._axisState());
    if (type === "vu-change") {
      const { x, y } = this._effectiveAxes();
      this._announcement = `${detail.css}, ${x} ${this._axisDisplayValue(x)}, ${y} ${this._axisDisplayValue(y)}`;
    }
    this.dispatchEvent(
      new CustomEvent<VuColorAreaChangeDetail>(type, {
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

  override firstUpdated(_changed: PropertyValues): void {
    super.firstUpdated(_changed);
    this._schedulePlanePaint();
  }

  override render() {
    const showCanvas = !this._useCssHsvPlane();
    return html`
      <div class="color-area-field" part="field">
        <div
          part="base"
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerCancel}
        >
          <canvas class="plane" ?hidden=${!showCanvas} aria-hidden="true"></canvas>
          ${this.showDots ? html`<div part="dots" aria-hidden="true"></div>` : ""}
          <div part="thumb"></div>
        </div>
        <div part="live" aria-live="polite" aria-atomic="true">
          ${this._announcement}
        </div>
        ${when(this._validation.showError, () =>
          renderFieldErrors({
            errorId: this._validation.errorId,
            errors: this.validationErrors,
            errorMessageClass: "error-message field-error-message",
            errorLineClass: "color-area-error-line field-error-line",
          }),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-color-area": VuColorArea;
  }
}
