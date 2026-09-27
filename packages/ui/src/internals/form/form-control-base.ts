import { LitElement, type PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import { closestVuFormElement } from "./vu-form-owner.js";
import { unshadowFormControlFields } from "./unshadow-fields.js";
import { reflectString } from "../utils/reflect-string.js";

export type FormState = string | File | FormData | null | string;

/** Consumer validator: return `true` when valid, otherwise an error string. */
export type VuFormValidation = (value: string | File[]) => true | string;

export abstract class FormControlBase extends LitElement {
  /** Enables form-associated custom element behavior */
  static formAssociated = true;

  protected internals: ElementInternals;

  /** Native form attributes shared by all form-associated controls. */
  @property(reflectString) name = "";
  @property(reflectString) defaultValue = "";
  @property(reflectString) formId: string | null = null;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: String }) requiredMessage = "This field is required.";
  /** Custom validators returning `true` or an error string. */
  @property({ type: Array }) validations: VuFormValidation[] = [];

  /** Queued by `captureDefaultValue`; applied in `willUpdate` (not `firstUpdated`). */
  private _pendingDefaultValue: string | null = null;

  /** Snapshot used by `formResetCallback` (may differ from live `defaultValue`). */
  private _formResetValue = "";

  constructor() {
    super();

    if (typeof (this as any).attachInternals === "function") {
      this.internals = this.attachInternals();
    } else {
      throw new Error(
        "ElementInternals / form-associated custom elements not supported in this browser.",
      );
    }

    /* One call here fixes Lit class-field shadowing for every subclass (see unshadow-fields.ts). */
    unshadowFormControlFields(this);
  }

  protected override willUpdate(_changed: PropertyValues): void {
    if (this._pendingDefaultValue === null) return;
    const next = this._pendingDefaultValue;
    this._pendingDefaultValue = null;
    if (!this.defaultValue.trim() && this.defaultValue !== next) {
      this.defaultValue = next;
    }
  }

  // ---- Native form APIs (pass-through)
  get form() {
    if (this.internals.form) return this.internals.form;
    const light = this.closest("form") as HTMLFormElement | null;
    if (light) return light;
    return closestVuFormElement(this);
  }
  get validity() {
    return this.internals.validity;
  }
  get validationMessage() {
    return this.internals.validationMessage;
  }
  get willValidate() {
    return this.internals.willValidate;
  }
  checkValidity() {
    return this.internals.checkValidity();
  }
  reportValidity() {
    return this.internals.reportValidity();
  }

  // ---- Form callbacks
  formResetCallback() {
    this.onFormReset();
    this.syncFormValue();
    this.syncValidity();
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
    this.onFormDisabled(disabled);
    this.syncValidity();
  }

  formStateRestoreCallback(formState: FormState) {
    this.onFormStateRestore(formState);
    this.syncFormValue();
    this.syncValidity();
  }

  // ============================================================
  // ✅ Hooks for subclasses
  // ============================================================

  /** Must return current “submission value” (string/file/formdata) */
  protected abstract getFormValue(): FormState;

  /** Must set the component state from restored state (usually string) */
  protected abstract setValueFromFormState(formState: FormState): void;

  /** Must return the internal focusable control to anchor validity bubbles */
  protected abstract getValidityAnchor(): HTMLElement | undefined;

  /** Must return true if empty (for required) */
  protected abstract isEmpty(): boolean;

  /** ✅ Must return the native control you want to proxy to (input/textarea/select/...) */
  protected abstract getNativeControl(): HTMLElement | null;

  /** Optional: return first custom error message (or empty string) */
  protected getCustomErrorMessage(): string {
    return "";
  }

  protected validateForForm(): string {
    return "";
  }

  /** Value passed to `validations` (override for file lists or non-string state). */
  protected getValidationValue(): string | File[] {
    const host = this as FormControlBase & { value?: unknown; files?: File[] };
    if (Array.isArray(host.files) && host.files[0] instanceof File) return host.files;
    const current = host.value;
    if (current instanceof File) return [current];
    if (Array.isArray(current) && current[0] instanceof File) return current as File[];
    return current == null ? "" : String(current);
  }

  /** Runs `validations`; empty string means valid. */
  runCustomValidations(): string {
    const payload = this.getValidationValue();
    for (const [index, rule] of this.validations.entries()) {
      if (typeof rule !== "function") continue;
      try {
        const result = rule(payload);
        if (result === true) continue;
        return typeof result === "string" ? result : `Validation ${index} failed.`;
      } catch (error) {
        return error instanceof Error ? error.message : "Validation failed.";
      }
    }
    return "";
  }

  /** Optional: reset component to default */
  protected onFormReset() {
    this.setValueFromFormState(this.defaultValue.trim() || this._formResetValue);
  }

  /** Optional: react to fieldset disabled */
  protected onFormDisabled(_disabled: boolean) {}

  /** Optional: handle BFCache restore */
  protected onFormStateRestore(formState: FormState) {
    this.setValueFromFormState(formState);
  }

  /**
   * ✅ Called by base after a proxy method mutates the native control.
   * Subclasses should pull native.value into their state and optionally validate.
   */
  protected onNativeValueMutated(_native: any): void {}

  // ============================================================
  // ✅ Shared utilities (form value + validity)
  // ============================================================

  protected syncFormValue() {
    if (!this.name || this.disabled) {
      this.internals.setFormValue(null);
      return;
    }

    const v = this.getFormValue();

    if (v === null) {
      this.internals.setFormValue(null);
      return;
    }

    this.internals.setFormValue(v);
  }

  /** Anchor must be a shadow descendant; passing the host throws in Chromium. */
  private _validityAnchor(): HTMLElement | undefined {
    const anchor = this.getValidityAnchor();
    if (!anchor || anchor === this) return undefined;
    if (this.shadowRoot?.contains(anchor) || this.contains(anchor)) return anchor;
    return undefined;
  }

  private _setValidity(flags: ValidityStateFlags, message?: string): void {
    const anchor = message ? this._validityAnchor() : undefined;
    try {
      if (anchor && message) this.internals.setValidity(flags, message, anchor);
      else if (message) this.internals.setValidity(flags, message);
      else this.internals.setValidity(flags);
    } catch {
      this.internals.setValidity(flags, message ?? "");
    }
  }

  protected syncValidity() {
    if (this.disabled) {
      this._setValidity({});
      return;
    }

    if (this.required && this.isEmpty()) {
      this._setValidity(
        { valueMissing: true },
        this.requiredMessage || "This field is required.",
      );
      return;
    }

    const msg = this.validateForForm() || this.runCustomValidations();
    if (msg) {
      this._setValidity({ customError: true }, msg);
      return;
    }

    this._setValidity({});
  }

  protected reemitNativeEvent(
    type: string,
    originalEvent: Event,
    init?: Partial<EventInit> & { detail?: any },
  ) {
    const cancelable = ["submit"].includes(type) ? true : false;
    const common: EventInit = { bubbles: true, composed: true, cancelable };

    const ev =
      init?.detail !== undefined
        ? new CustomEvent(type, { ...common, ...init })
        : new Event(type, { ...common, ...init });

    (ev as any).__originalEvent = originalEvent;

    this.dispatchEvent(ev);
  }

  /** Snapshot for `formResetCallback`; call from `connectedCallback` (or constructor), not `firstUpdated`. */
  protected captureDefaultValue(initial: string): void {
    const next = initial ?? "";
    this._formResetValue = next;
    if (!this.defaultValue.trim()) {
      this._pendingDefaultValue = next;
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncFormValue();
    this.syncValidity();
  }

  // ============================================================
  // ✅ Native proxy helpers (shared across all controls)
  // ============================================================

  protected get nativeControl(): any | null {
    return this.getNativeControl() as any;
  }

  protected get nativeInput(): HTMLInputElement | null {
    const el = this.getNativeControl();
    return el instanceof HTMLInputElement ? el : null;
  }

  protected get nativeTextarea(): HTMLTextAreaElement | null {
    const el = this.getNativeControl();
    return el instanceof HTMLTextAreaElement ? el : null;
  }

  /** Central sync after proxy calls */
  protected syncFromNative(runValidity = true) {
    const native = this.nativeControl;
    if (!native) return;

    this.onNativeValueMutated(native);
    this.syncFormValue();
    if (runValidity) this.syncValidity();
  }

  // ---- focus/blur/click/showPicker
  override focus(options?: FocusOptions) {
    this.nativeControl?.focus?.(options);
  }

  override blur() {
    this.nativeControl?.blur?.();
  }

  override click() {
    this.nativeControl?.click?.();
  }

  showPicker(): boolean {
    const input = this.nativeInput as any;
    if (!input || typeof input.showPicker !== "function") return false;

    try {
      input.showPicker();
      return true;
    } catch (_err) {
      // Chromium throws NotAllowedError if not called from a user gesture
      // We intentionally swallow it because this is often used programmatically.
      return false;
    }
  }

  protected getSelectionTarget(): HTMLInputElement | HTMLTextAreaElement | null {
    const el = this.getNativeControl();
    if (!el) return null;

    // textarea always supports selection
    if (el instanceof HTMLTextAreaElement) return el;

    if (el instanceof HTMLInputElement) {
      const t = (el.type || "").toLowerCase();

      // types that don't support selection APIs
      if (
        t === "date" ||
        t === "time" ||
        t === "week" ||
        t === "month" ||
        t === "datetime-local" ||
        t === "number" ||
        t === "file"
      ) {
        return null;
      }

      return el;
    }

    return null;
  }

  get selectionStart(): number | null {
    return this.getSelectionTarget()?.selectionStart ?? null;
  }
  set selectionStart(v: number | null) {
    const t = this.getSelectionTarget();
    if (!t) return;
    t.selectionStart = v;
  }

  get selectionEnd(): number | null {
    return this.getSelectionTarget()?.selectionEnd ?? null;
  }
  set selectionEnd(v: number | null) {
    const t = this.getSelectionTarget();
    if (!t) return;
    t.selectionEnd = v;
  }

  get selectionDirection(): "forward" | "backward" | "none" | null {
    return this.getSelectionTarget()?.selectionDirection ?? null;
  }

  select() {
    this.getSelectionTarget()?.select?.();
  }

  setSelectionRange(start: number, end: number, direction?: "forward" | "backward" | "none") {
    this.getSelectionTarget()?.setSelectionRange?.(start, end, direction);
  }

  setRangeText(
    replacement: string,
    start?: number,
    end?: number,
    selectionMode?: "select" | "start" | "end" | "preserve",
  ) {
    const el = this.getSelectionTarget();
    if (!el || this.disabled || this.readonly) return;

    if (start !== undefined && end !== undefined) {
      el.setRangeText(replacement, start, end, selectionMode);
    } else {
      el.setRangeText(replacement);
    }

    this.syncFromNative(true);
  }

  // ---- valueAsNumber/valueAsDate (input only)
  get valueAsNumber(): number {
    return this.nativeInput?.valueAsNumber ?? Number.NaN;
  }
  set valueAsNumber(v: number) {
    const input = this.nativeInput;
    if (!input || this.disabled || this.readonly) return;
    input.valueAsNumber = v;
    this.syncFromNative(true);
  }

  get valueAsDate(): Date | null {
    return this.nativeInput?.valueAsDate ?? null;
  }
  set valueAsDate(v: Date | null) {
    const input = this.nativeInput;
    if (!input || this.disabled || this.readonly) return;
    input.valueAsDate = v;
    this.syncFromNative(true);
  }

  // ---- stepping (input only)
  stepUp(n?: number) {
    const input = this.nativeInput;
    if (!input || this.disabled || this.readonly) return;
    input.stepUp(n);
    this.syncFromNative(true);
  }

  stepDown(n?: number) {
    const input = this.nativeInput;
    if (!input || this.disabled || this.readonly) return;
    input.stepDown(n);
    this.syncFromNative(true);
  }

  // ---- native-ish validity API
  setCustomValidity(message: string) {
    if (this.disabled) return;

    if (message) {
      this._setValidity({ customError: true }, message);
    } else {
      this._setValidity({});
      this.syncValidity();
    }
  }
}
