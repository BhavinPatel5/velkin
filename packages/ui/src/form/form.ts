import { LitElement, html, nothing, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { isClient } from "../internals/utils/env.js";
import {
  FORM_ASSOCIATED_SELECTOR,
  FORM_FIELD_SELECTOR,
  VU_FIELD_SELECTOR,
  type FormFieldHost,
} from "./internals/form-controls.js";
import { collectFormData, formDataToJson } from "./internals/form-data.js";
import type {
  VuFormAutocomplete,
  VuFormChangeDetail,
  VuFormEnctype,
  VuFormFormDataFallbackDetail,
  VuFormInvalidDetail,
  VuFormMethod,
  VuFormMode,
  VuFormSubmitDetail,
} from "./form.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuFormAutocomplete,
  VuFormChangeDetail,
  VuFormEnctype,
  VuFormFormDataFallbackDetail,
  VuFormInvalidDetail,
  VuFormMethod,
  VuFormMode,
  VuFormSubmitDetail,
  VuFormValues,
} from "./form.types.js";

/**
 * @element vu-form
 *
 * @summary A form component for validation, FormData, and submit coordination.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/form
 *
 * @slot - Form controls and actions projected into the native `<form>`.
 *
 * @property {boolean} liveValidation - Validates and emits `vu-change` on value changes. Default: `false`.
 * @property {boolean} showErrors - Activates error display on child fields after submit/invalid. Default: `true`.
 * @property {VuFormMode} mode - Submission mode (`client` or `server`). Default: `"client"`.
 * @property {VuFormMethod | undefined} method - Native form method in server mode.
 * @property {string | undefined} action - Native form action in server mode.
 * @property {string | undefined} target - Native form target in server mode.
 * @property {VuFormEnctype | undefined} enctype - Native form encoding type.
 * @property {VuFormAutocomplete | undefined} autocomplete - Native form autocomplete behavior.
 * @property {boolean} noValidate - Disables native HTML constraint UI. Default: `false`.
 * @property {boolean} enterSubmit - Submits on Enter for non-textarea controls. Default: `false`.
 * @property {boolean} resetOnSubmit - Resets form after successful submit. Default: `false`.
 * @property {string | null} csrfToken - Optional CSRF token value for app-level submit handling.
 *
 * @fires {CustomEvent<VuFormChangeDetail>} vu-change - When form values change in live validation mode.
 * @fires {CustomEvent<VuFormInvalidDetail>} vu-invalid - When aggregated validation errors change.
 * @fires {CustomEvent<VuFormFormDataFallbackDetail> | FormDataEvent} formdata - Before client-mode submit with form data.
 * @fires {CustomEvent<VuFormSubmitDetail>} vu-submit - After successful client-mode submit handling.
 *
 * @method checkValidity - Returns native form validity without UI reporting.
 * @method reportValidity - Returns native form validity and reports native UI messages.
 * @method requestSubmit - Requests submission using optional submitter.
 * @method reset - Resets native form and values.
 * @method submit - Submits form using mode-specific client/server flow.
 *
 * @csspart form - Native `<form>` element.
 *
 * Light DOM host: copies host `id` onto the inner `<form>` and assigns `form="<id>"` to associated controls outside the native form subtree.
 */
@customElement("vu-form")
@withComponentPresets
export class VuForm extends LitElement {
  private static _idCounter = 0;

  /** Validates and emits `vu-change` on value changes. */
  @property({ type: Boolean })
  liveValidation = false;

  /** Activates error display on child fields after submit/invalid. */
  @property({ type: Boolean })
  showErrors = true;

  /** Submission mode: `client` prevents navigation; `server` uses native submit. */
  @property({ type: String })
  mode: VuFormMode = "client";

  /** Native form method in server mode. */
  @property({ type: String })
  method?: VuFormMethod;

  /** Native form action in server mode. */
  @property({ type: String })
  action?: string;

  /** Native form target in server mode. */
  @property({ type: String })
  target?: string;

  /** Native form encoding type. */
  @property({ type: String })
  enctype?: VuFormEnctype;

  /** Native form autocomplete behavior. */
  @property({ type: String })
  autocomplete?: VuFormAutocomplete;

  /** Disables native HTML constraint UI. */
  @property({ type: Boolean })
  noValidate = false;

  /** Submits on Enter for non-textarea controls. */
  @property({ type: Boolean })
  enterSubmit = false;

  /** Resets form after successful submit. */
  @property({ type: Boolean })
  resetOnSubmit = false;

  /** Optional CSRF token value injected as a hidden field. */
  @property({ type: String })
  csrfToken: string | null = null;

  private validationErrors: string[] = [];
  private _isClientHydrated = !isClient();

  @query("form")
  private _formEl!: HTMLFormElement;

  private _mo?: MutationObserver;
  private _syncQueued = false;
  private _handlingSubmit = false;
  private _submitEpoch = 0;

  /** Native `<form>` rendered inside the host. */
  get formElement(): HTMLFormElement {
    return this._formEl;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this._isClientHydrated && isClient()) {
      setTimeout(() => {
        this._isClientHydrated = true;
        this.requestUpdate();
      }, 0);
    }
    this._queueSync();
    this.addEventListener("click", this._onNativeSubmitterClick, true);
    this.addEventListener("formdata", this._onFormDataCapture, true);
    this.addEventListener("vu-change", this._handleFieldChange);
    this.addEventListener("value-changed", this._handleFieldChange);
    this.addEventListener("keydown", this._onEnterKey, true);
    this.addEventListener("invalid", this._onInvalidCapture, true);
    if (typeof MutationObserver !== "undefined") {
      this._mo = new MutationObserver(() => this._queueSync());
      this._mo.observe(this, { childList: true, subtree: true });
    }
  }

  protected override firstUpdated(_changed: PropertyValues): void {
    this._syncNow();
  }

  override disconnectedCallback(): void {
    this.removeEventListener("click", this._onNativeSubmitterClick, true);
    this.removeEventListener("formdata", this._onFormDataCapture, true);
    this.removeEventListener("vu-change", this._handleFieldChange);
    this.removeEventListener("value-changed", this._handleFieldChange);
    this.removeEventListener("keydown", this._onEnterKey, true);
    this.removeEventListener("invalid", this._onInvalidCapture, true);
    this._mo?.disconnect();
    super.disconnectedCallback();
  }

  /** Returns native form validity without UI reporting. */
  checkValidity(): boolean {
    this._queueSync();
    return this._formEl?.checkValidity?.() ?? true;
  }

  /** Returns native form validity and reports native UI messages. */
  reportValidity(): boolean {
    this._queueSync();
    return this._formEl?.reportValidity?.() ?? true;
  }

  /** Requests submission using optional submitter. */
  requestSubmit(submitter?: HTMLElement): void {
    this._syncNow();
    this._activateValidation();
    this._formEl?.requestSubmit?.(submitter);
  }

  /** Resets native form and values. */
  reset(): void {
    this._queueSync();
    this._formEl?.reset();
    this._replayReset();
    /* FACE restore can run after native reset; replay again so slotted vu-* win. */
    queueMicrotask(() => this._replayReset());
  }

  /** Submits form using mode-specific client/server flow. */
  submit(): void {
    this._activateValidation();
    if (this.mode === "client") {
      const submitEvent = new SubmitEvent("submit", {
        bubbles: true,
        cancelable: true,
      });
      this._formEl?.dispatchEvent(submitEvent);
      return;
    }
    this._formEl?.submit();
  }

  private _queueSync(): void {
    if (this._syncQueued) return;
    this._syncQueued = true;
    queueMicrotask(() => {
      this._syncQueued = false;
      this._moveHostIdToNativeForm();
      this._assignFormOwnerToChildren();
      this._refreshAggregates();
    });
  }

  private _syncNow(): void {
    this._moveHostIdToNativeForm();
    this._assignFormOwnerToChildren();
    this._refreshAggregates();
  }

  private _onEnterKey = (e: KeyboardEvent): void => {
    if (!this.enterSubmit || e.key !== "Enter") return;

    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target instanceof HTMLTextAreaElement) return;
    if (target.closest('button[type="submit"], input[type="submit"]')) return;

    e.preventDefault();
    this.requestSubmit();
  };

  private _moveHostIdToNativeForm(): void {
    const hostId = this.id?.trim();
    if (hostId && this._formEl && this._formEl.id !== hostId) {
      this._formEl.id = hostId;
      if (this.id === hostId) this.removeAttribute("id");
      return;
    }
    this._ensureFormId();
  }

  /** Slotted controls are light-DOM siblings — form needs an id for `form="…"` wiring. */
  private _ensureFormId(): string {
    if (!this._formEl) return "";
    const current = this._formEl.id.trim();
    if (current) return current;
    const generated = `vu-form-${VuForm._idCounter++}`;
    this._formEl.id = generated;
    return generated;
  }

  onChromeSlotChange = (): void => {
    this._queueSync();
  };

  private _handleFieldChange = (e: Event): void => {
    if (!this.liveValidation) return;
    if (e.target === this) return;
    const target = e.target;
    if (!(target instanceof HTMLElement) || !target.matches(FORM_FIELD_SELECTOR)) return;
    /* Field `vu-change` shares the name — stop it so `onVuChange` sees the aggregated form event. */
    e.stopImmediatePropagation();
    this._queueSync();
    this._emitFormChange();
  };

  /** Runs field `validateForForm` then consumer `validations` without toggling error UI. */
  private _customErrorMessage(field: FormFieldHost): string {
    if (typeof field.validateForForm === "function") {
      try {
        const domain = field.validateForForm();
        if (domain) return domain;
      } catch (error) {
        return error instanceof Error ? error.message : "Validation failed.";
      }
    }
    if (typeof field.runCustomValidations === "function") {
      try {
        return field.runCustomValidations() || "";
      } catch (error) {
        return error instanceof Error ? error.message : "Validation failed.";
      }
    }
    return "";
  }

  /** Quiet validity check — avoids `checkValidity()` dispatching `invalid` during live typing. */
  private _formValidQuiet(): boolean {
    const form = this._formEl;
    if (!form) return true;

    for (const el of Array.from(form.elements)) {
      const field = el as FormFieldHost;
      if (!field.validity) continue;
      if (field.willValidate === false) continue;
      if (!field.validity.valid) return false;
    }

    for (const field of this._getNuFields()) {
      if (field.willValidate === false) continue;
      if (field.invalid === true) return false;
      if (field.validity && !field.validity.valid) return false;
      if (this._customErrorMessage(field)) return false;
      const required = (field as HTMLElement & { required?: boolean }).required;
      if (!required) continue;
      const checked = (field as HTMLElement & { checked?: boolean }).checked;
      if (typeof checked === "boolean") {
        if (!checked) return false;
        continue;
      }
      const value = (field as HTMLElement & { value?: unknown }).value;
      if (value == null || String(value).trim() === "") return false;
    }
    return true;
  }

  private _emitFormChange(): void {
    if (!this._formEl) return;
    const fd = collectFormData(this._formEl, this);
    this.dispatchEvent(
      new CustomEvent<VuFormChangeDetail>("vu-change", {
        detail: {
          values: formDataToJson(fd),
          formData: fd,
          success: this._formValidQuiet(),
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _assignFormOwnerToChildren(): void {
    const formId = this._ensureFormId();
    if (!formId) return;

    const candidates = this.querySelectorAll<HTMLElement>(FORM_ASSOCIATED_SELECTOR);
    for (const el of candidates) {
      if (el.localName.startsWith("vu-")) continue;
      if (el.closest("form") === this._formEl) continue;
      const owner = (el as FormFieldHost).form;
      if (owner?.id !== formId) el.setAttribute("form", formId);
    }
  }

  private _getNuFields(): FormFieldHost[] {
    return Array.from(this.querySelectorAll<FormFieldHost>(VU_FIELD_SELECTOR));
  }

  private _emitInvalid(errors: string[]): void {
    this.dispatchEvent(
      new CustomEvent<VuFormInvalidDetail>("vu-invalid", {
        detail: { errors },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onFormDataCapture = (e: Event): void => {
    if (!(e.target instanceof HTMLFormElement)) return;
    if (e.target !== this._formEl) return;
    e.stopImmediatePropagation();
  };

  private _onInvalidCapture = (e: Event): void => {
    const target = e.target as FormFieldHost | null;
    if (target?.form && target.form !== this._formEl) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    this._activateValidation();
    this._focusFirstInvalid();
  };

  private _refreshAggregates(): void {
    const errs: string[] = [];

    for (const input of this._getNuFields()) {
      if (typeof input.validateInput === "function") {
        input.validateInput();
      }
      if (Array.isArray(input.validationErrors)) {
        errs.push(...input.validationErrors);
      }
    }

    const elements = Array.from(this._formEl?.elements ?? []) as FormFieldHost[];
    for (const el of elements) {
      if (el.willValidate === false) continue;
      const isValid = el.validity?.valid ?? true;
      if (isValid) continue;
      errs.push(el.validationMessage || `${el.name || el.id || "Field"} is invalid`);
    }

    const next = [...new Set(errs)];
    if (next.join("|") !== this.validationErrors.join("|")) {
      this.validationErrors = next;
      this._emitInvalid(next);
    }
  }

  private _focusFirstInvalid(): void {
    const firstInvalid = this._getNuFields().find((input) => input.invalid === true);
    if (firstInvalid) this._focusElement(firstInvalid);
  }

  private _focusElement(element: HTMLElement): void {
    if (typeof element.scrollIntoView === "function") {
      try {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {
        /* jsdom / SSR may not implement scrollIntoView */
      }
    }
    const focus = (): void => {
      element.focus({ preventScroll: true });
    };
    if (!isClient()) {
      focus();
      return;
    }
    window.setTimeout(focus, 100);
  }

  private _nuFieldsValid(): boolean {
    for (const field of this._getNuFields()) {
      field.validationActive = true;
      if (typeof field.validateInput === "function" && field.validateInput() === false) {
        return false;
      }
      if (field.invalid === true) return false;
      if (typeof field.checkValidity === "function" && !field.checkValidity()) {
        return false;
      }
      if (this._customErrorMessage(field)) return false;
      const required = (field as HTMLElement & { required?: boolean }).required;
      if (!required) continue;
      const checked = (field as HTMLElement & { checked?: boolean }).checked;
      if (typeof checked === "boolean") {
        if (!checked) return false;
        continue;
      }
      const selected = (field as HTMLElement & { getSelectedValue?: () => string }).getSelectedValue?.();
      if (typeof selected === "string") {
        if (!selected) return false;
        continue;
      }
      const selectedValues = (field as HTMLElement & { getSelectedValues?: () => string[] }).getSelectedValues?.();
      if (Array.isArray(selectedValues)) {
        if (selectedValues.length === 0) return false;
        continue;
      }
      const value = (field as HTMLElement & { value?: unknown }).value;
      if (value == null || String(value).trim() === "") return false;
    }
    return true;
  }

  private _onHostSubmitCapture = (e: Event): void => {
    if (!(e.target instanceof HTMLFormElement)) return;
    if (e.target !== this._formEl) return;
    if (this._handlingSubmit) {
      e.preventDefault();
      return;
    }

    this._handlingSubmit = true;
    try {
      this._syncNow();
      this._activateValidation();
      const fieldsOk = this._nuFieldsValid();
      const ok = this._formEl.checkValidity() && fieldsOk;
      if (!ok) {
        e.preventDefault();
        e.stopImmediatePropagation();
        this._focusFirstInvalid();
        return;
      }

      if (this.mode === "server") {
        if (this.resetOnSubmit) queueMicrotask(() => this.reset());
        return;
      }

      e.preventDefault();
      e.stopImmediatePropagation();

      const fd = collectFormData(this._formEl, this);
      let dispatched = false;

      if (typeof FormDataEvent !== "undefined") {
        const fde = new FormDataEvent("formdata", {
          formData: fd,
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(fde);
        dispatched = true;
      }

      if (!dispatched) {
        this.dispatchEvent(
          new CustomEvent<VuFormFormDataFallbackDetail>("formdata", {
            detail: { formData: fd },
            bubbles: true,
            composed: true,
          }),
        );
      }

      const json = formDataToJson(fd);
      this.dispatchEvent(
        new CustomEvent<VuFormSubmitDetail>("vu-submit", {
          detail: {
            values: json,
            formData: fd,
            success: this._formEl.checkValidity() && fieldsOk,
          },
          bubbles: true,
          composed: true,
        }),
      );

      if (this.resetOnSubmit) queueMicrotask(() => this.reset());
    } finally {
      const epoch = ++this._submitEpoch;
      queueMicrotask(() => {
        if (epoch === this._submitEpoch) this._handlingSubmit = false;
      });
    }
  };

  /** Native / `vu-button` submitters are not associated with the shadow `<form>`. */
  private _onNativeSubmitterClick = (e: MouseEvent): void => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const vuBtn = target.closest("vu-button") as
      | (HTMLElement & { type?: string; disabled?: boolean; loading?: boolean })
      | null;
    if (vuBtn) {
      if (vuBtn.disabled || vuBtn.loading) return;
      if (vuBtn.type === "submit") {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.requestSubmit();
      } else if (vuBtn.type === "reset") {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.reset();
      }
      return;
    }

    const submitter = target.closest("button, input");
    if (!(submitter instanceof HTMLButtonElement) && !(submitter instanceof HTMLInputElement)) {
      return;
    }
    if (submitter.form) return;

    if (submitter.type === "submit") {
      e.preventDefault();
      this.requestSubmit();
    } else if (submitter.type === "reset") {
      e.preventDefault();
      this.reset();
    }
  };

  /** FACE children are not associated with the shadow form, so replay native reset. */
  private _onNativeReset = (e: Event): void => {
    if (e.target !== this._formEl) return;
    this._replayReset();
  };

  private _replayReset(): void {
    for (const el of this.querySelectorAll<FormFieldHost>(FORM_ASSOCIATED_SELECTOR)) {
      el.formResetCallback?.();
    }
  }

  private _activateValidation(): void {
    if (!this.showErrors) return;

    for (const input of this._getNuFields()) {
      input.validationActive = true;
      input.showErrors = true;
    }

    queueMicrotask(() => this._refreshAggregates());
  }

  override render() {
    return html`
      <form
        part="form"
        method=${ifDefined(this.method)}
        action=${ifDefined(this.action)}
        enctype=${ifDefined(this.enctype)}
        autocomplete=${ifDefined(this.autocomplete)}
        ?novalidate=${this.noValidate}
        target=${ifDefined(this.target || undefined)}
        @submit=${this._onHostSubmitCapture}
        @reset=${this._onNativeReset}
      >
        ${this.csrfToken
          ? html`<input type="hidden" name="csrfmiddlewaretoken" .value=${this.csrfToken} />`
          : nothing}
        <slot @slotchange=${this.onChromeSlotChange}></slot>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-form": VuForm;
  }
}
