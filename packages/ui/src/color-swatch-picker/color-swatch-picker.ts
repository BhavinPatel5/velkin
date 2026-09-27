import { localized } from "@lit/localize";
import { html, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { msg, str } from "../internals/utils/localize.js";
import { repeat } from "lit/directives/repeat.js";
import { VuColorSwatch } from "../color-swatch/color-swatch.js";
import type { VuColorSwatchSelectDetail } from "../color-swatch/color-swatch.types.js";
import {
  parseCssColor,
  rgbToHex,
  rgbToHexA,
  rgbToHsl,
  rgbToHsv,
} from "../internals/utils/color-conversion.js";
import {
  FormControlBase,
  type FormState,
} from "../internals/form/form-control-base.js";
import { FieldValidationController } from "../internals/form/field-validation-controller.js";
import { requiredFieldValidator } from "../internals/form/field-validation.js";
import { renderFieldErrors } from "../internals/form/field-validation-render.js";
import { colorSwatchPickerStyles } from "./color-swatch-picker.style.js";
import type {
  VuColorSwatchPickerChangeDetail,
  VuColorSwatchPickerColor,
  VuColorSwatchPickerLayout,
  VuColorSwatchPickerVariant,
  VuColorSwatchSize,
} from "./color-swatch-picker.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuColorSwatchPickerChangeDetail,
  VuColorSwatchPickerColor,
  VuColorSwatchPickerLayout,
  VuColorSwatchPickerVariant,
  VuColorSwatchSize,
} from "./color-swatch-picker.types.js";
import { reflectString } from "../internals/utils/reflect-string.js";

const LAYOUTS = new Set<VuColorSwatchPickerLayout>(["grid", "stack"]);
const VARIANTS = new Set<VuColorSwatchPickerVariant>(["circle", "square"]);

/**
 * @element vu-color-swatch-picker
 *
 * @summary A color swatch picker component with preset or custom palettes.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/color-swatch-picker
 * @dependency vu-color-swatch
 *
 * @slot - Optional `<vu-color-swatch>` children (composition mode). When non-empty, `colors` is ignored.
 * @slot error - Replaces default validation message list when assigned.
 *
 * @csspart base - Swatch container (grid or stack).
 * @csspart field - Column that stacks the palette and optional error.
 * @csspart error-message - Region for `slot="error"` or stacked default validation lines.
 * @csspart error-line - One default validation string when `slot="error"` is empty.
 *
 * @cssproperty --color-swatch-picker-columns - Fixed column count for grid; `0` = auto-fill.
 * @cssproperty --color-swatch-picker-gap - Gap between swatches.
 * @cssproperty --color-swatch-picker-width - Container width (`auto` by default).
 *
 * @fires {CustomEvent<VuColorSwatchPickerChangeDetail>} vu-change - Selection changed.
 * @fires {CustomEvent} vu-invalid - When validation messages are recomputed while `validationActive`.
 *
 * Forms: `name` + `value`; `defaultvalue` seeds `<form>.reset()`. Inherits `disabled`, `required`, validity.
 */
@localized()
@customElement("vu-color-swatch-picker")
@withComponentPresets
export class VuColorSwatchPicker extends FormControlBase {
  static override styles = colorSwatchPickerStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-color-swatch": VuColorSwatch,
  };

  /** Current selection (`swatch.value` or `swatch.color` when value is empty). */
  @property(reflectString)
  value = "";

  /** Auto-mode palette (CSS strings); ignored when slotted swatches exist. */
  @property({ type: Array })
  colors: string[] = [];

  /** Grid column count; `0` = auto-fill (grid layout only). */
  @property({ type: Number, reflect: true })
  columns = 0;

  /** Swatch size forwarded to each chip. */
  @property({ type: String, reflect: true })
  size: VuColorSwatchSize = "md";

  /** Swatch outline: `circle` (default) or `square`. */
  @property({ type: String, reflect: true })
  variant: VuColorSwatchPickerVariant = "circle";

  /** `grid` (default) or vertical `stack`. */
  @property({ type: String, reflect: true })
  layout: VuColorSwatchPickerLayout = "grid";

  @property({ type: Boolean, reflect: true })
  checkerboard = false;

  /** Accessible name for the radiogroup; empty uses the locale catalog. */
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

  /** True after the initial form-reset snapshot was captured. */
  private _formDefaultCaptured = false;

  @state()
  private _slotCount = 0;

  @state() validationErrors: string[] = [];

  private readonly _validation = new FieldValidationController(this, "vu-csp");

  @query("slot:not([name])")
  private _slot!: HTMLSlotElement | null;

  @query('[part="base"]')
  private _base!: HTMLElement | null;

  override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (!LAYOUTS.has(this.layout)) this.layout = "grid";
    if (!VARIANTS.has(this.variant)) this.variant = "circle";
  }

  override updated(changed: PropertyValues): void {
    if (changed.has("columns") || changed.has("size") || changed.has("layout")) {
      if (this.layout === "grid") {
        this.style.setProperty(
          "--color-swatch-picker-template",
          this.columns > 0
            ? `repeat(${this.columns}, minmax(0, max-content))`
            : "repeat(auto-fill, minmax(min-content, max-content))",
        );
      }
    }
    if (
      changed.has("value") ||
      changed.has("colors") ||
      changed.has("disabled") ||
      changed.has("readonly") ||
      changed.has("size") ||
      changed.has("variant") ||
      changed.has("checkerboard") ||
      changed.has("layout")
    ) {
      this._syncChildren();
    }
    this._applyA11y();
    super.updated(changed);
    if (changed.has("defaultValue")) {
      this._seedFormDefault();
    }
    if (
      changed.has("value") ||
      changed.has("name") ||
      changed.has("disabled")
    ) {
      this.syncFormValue();
      this.syncValidity();
    }
  }

  protected override getFormValue(): FormState {
    if (!this.name) return null;
    return this.value || null;
  }

  protected override setValueFromFormState(state: FormState): void {
    this.value = typeof state === "string" ? state : "";
  }

  protected override getValidityAnchor(): HTMLElement | undefined {
    return this._base ?? undefined;
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

  private _seedFormDefault(): void {
    const explicit = this.defaultValue.trim();
    this.captureDefaultValue(explicit || this.value);
    this._formDefaultCaptured = true;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("keydown", this._onKeydown);
    this._applyA11y();
    this._seedFormDefault();
  }

  override firstUpdated(): void {
    queueMicrotask(() => this._refreshFromSlot());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._onKeydown);
  }

  getSwatches(): VuColorSwatch[] {
    if (this._slotCount > 0) {
      return (
        (this._slot?.assignedElements({ flatten: true }) as VuColorSwatch[]) ?? []
      );
    }
    return Array.from(
      this._base?.querySelectorAll("vu-color-swatch") ?? [],
    ) as VuColorSwatch[];
  }

  private _onSlotChange = (): void => {
    this._refreshFromSlot();
  };

  private _refreshFromSlot(): void {
    const slotted = (this._slot?.assignedElements({ flatten: true }) ?? []).filter(
      (n) => n.tagName?.toLowerCase() === "vu-color-swatch",
    );
    this._slotCount = slotted.length;
    this._syncChildren();
  }

  private _parsedColor(css: string): VuColorSwatchPickerColor | null {
    const p = parseCssColor(css);
    if (!p) return null;
    const hsv = rgbToHsv(p.rgb);
    const hsl = rgbToHsl(p.rgb);
    const hex = p.alpha < 1 ? rgbToHexA(p.rgb, p.alpha) : rgbToHex(p.rgb);
    return { css, rgb: p.rgb, alpha: p.alpha, hsv, hsl, hex };
  }

  private _changeDetail(swatch: VuColorSwatch, index: number): VuColorSwatchPickerChangeDetail {
    const color = swatch.color;
    const value = swatch.value || swatch.color;
    return {
      value,
      color,
      index,
      parsed: this._parsedColor(color),
    };
  }

  private _syncChildren(): void {
    const swatches = this.getSwatches();
    if (!swatches.length) return;
    let activeIndex = swatches.findIndex((s) => this._matches(s));
    if (activeIndex < 0) activeIndex = 0;
    swatches.forEach((swatch, i) => {
      swatch.selectable = true;
      swatch.disabled = this.disabled;
      swatch.readonly = this.readonly;
      if (!swatch.hasAttribute("size")) swatch.size = this.size;
      if (!swatch.hasAttribute("shape")) swatch.shape = this.variant;
      if (this.checkerboard && !swatch.hasAttribute("checkerboard")) {
        swatch.checkerboard = true;
      }
      swatch.selected = this._matches(swatch);
      swatch.setAttribute("role", "radio");
      swatch.setAttribute("aria-checked", this._matches(swatch) ? "true" : "false");
      if (!swatch.getAttribute("aria-label")) {
        const name = swatch.colorName.trim();
        swatch.setAttribute(
          "aria-label",
          name ||
            String(
              msg(str`Color ${swatch.color}`, {
                desc: "Fallback accessible name for a color swatch chip.",
              }),
            ),
        );
      }
      swatch.tabIndex = i === activeIndex && !this.disabled ? 0 : -1;
    });
  }

  private _matches(swatch: VuColorSwatch): boolean {
    if (!this.value) return false;
    const candidate = swatch.value || swatch.color;
    return candidate === this.value;
  }

  private _resolvedLabel(): string {
    return (
      this.label.trim() ||
      String(msg("Color palette", { desc: "Default label for the color swatch picker." }))
    );
  }

  private _applyA11y(): void {
    if (!this.hasAttribute("role")) this.setAttribute("role", "radiogroup");
    this.setAttribute("aria-label", this._resolvedLabel());
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

  private _onSelect = (event: Event): void => {
    event.stopPropagation();
    if (this.disabled || this.readonly) return;
    const detail = (event as CustomEvent<VuColorSwatchSelectDetail>).detail;
    const swatches = this.getSwatches();
    const target = swatches.find(
      (s) => (s.value || s.color) === detail.value || s.color === detail.color,
    );
    if (!target) return;
    this._select(swatches.indexOf(target), { focus: false });
  };

  private _select(index: number, { focus }: { focus: boolean }): void {
    const swatches = this.getSwatches();
    if (index < 0 || index >= swatches.length) return;
    const swatch = swatches[index];
    if (swatch.disabled || this.readonly) return;
    const candidate = swatch.value || swatch.color;
    const previous = this.value;
    this.value = candidate;
    this._syncChildren();
    if (focus) swatch.focus();
    if (candidate !== previous) {
      this.dispatchEvent(
        new CustomEvent<VuColorSwatchPickerChangeDetail>("vu-change", {
          detail: this._changeDetail(swatch, index),
          bubbles: true,
          composed: true,
        }),
      );
      this._validation.validateNow(this._fieldValidators(), {
        syncValidity: () => this.syncValidity(),
      });
    }
  }

  private _onKeydown = (event: KeyboardEvent): void => {
    if (this.disabled || this.readonly) return;
    const swatches = this.getSwatches();
    if (!swatches.length) return;
    const currentIndex = Math.max(
      0,
      swatches.findIndex((s) => s.tabIndex === 0),
    );
    let nextIndex = currentIndex;
    let handled = true;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (currentIndex + 1) % swatches.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (currentIndex - 1 + swatches.length) % swatches.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = swatches.length - 1;
        break;
      case " ":
      case "Enter":
        this._select(currentIndex, { focus: true });
        break;
      default:
        handled = false;
    }
    if (!handled) return;
    event.preventDefault();
    if (nextIndex !== currentIndex) {
      this._select(nextIndex, { focus: true });
    }
  };

  override render() {
    return html`
      <div class="color-swatch-picker-field" part="field">
        <div part="base" @vu-select=${this._onSelect}>
          ${repeat(
            this._slotCount === 0 ? this.colors : [],
            (c) => c,
            (c) => html`
              <vu-color-swatch color=${c}></vu-color-swatch>
            `,
          )}
          <slot @slotchange=${this._onSlotChange}></slot>
        </div>
        ${when(this._validation.showError, () =>
          renderFieldErrors({
            errorId: this._validation.errorId,
            errors: this.validationErrors,
            errorMessageClass: "error-message field-error-message",
            errorLineClass: "color-swatch-picker-error-line field-error-line",
          }),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-color-swatch-picker": VuColorSwatchPicker;
  }
}
