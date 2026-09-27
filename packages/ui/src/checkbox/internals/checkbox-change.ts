import type { VuCheckboxChangeDetail } from "../checkbox.types.js";

/** Checkbox surface the change handler reads and mutates. */
export type CheckboxChangeHost = {
  disabled: boolean;
  readonly: boolean;
  checked: boolean;
  indeterminate: boolean;
  indeterminateClick: "check" | "uncheck";
  value: string;
  _inputElement?: HTMLInputElement | null;
  validateInput(): boolean;
  dispatchEvent(event: Event): boolean;
};

/** Handles native `change` on the checkbox input, including indeterminate → unchecked. */
export function handleCheckboxChange(host: CheckboxChangeHost, event: Event): void {
  const target = event.target as HTMLInputElement;

  if (host.disabled || host.readonly) {
    if (host._inputElement) {
      host._inputElement.checked = host.checked;
      host._inputElement.indeterminate = host.indeterminate;
    }
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (host.indeterminate && host.indeterminateClick === "uncheck") {
    host.indeterminate = false;
    host.checked = false;
    if (host._inputElement) {
      host._inputElement.checked = false;
      host._inputElement.indeterminate = false;
    }
    host.validateInput();
    const emittedValue = host.value && host.value.trim() !== "" ? undefined : false;
    host.dispatchEvent(
      new CustomEvent<VuCheckboxChangeDetail>("vu-change", {
        detail: { checked: false, value: emittedValue },
        bubbles: true,
        composed: true,
      }),
    );
    return;
  }

  host.checked = target.checked;

  host.validateInput();

  const emittedValue =
    host.value && host.value.trim() !== "" ? (host.checked ? host.value : undefined) : host.checked;

  const detail: VuCheckboxChangeDetail = {
    checked: host.checked,
    value: emittedValue,
  };
  host.dispatchEvent(
    new CustomEvent<VuCheckboxChangeDetail>("vu-change", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}

/** Syncs `.cbx` classList with checked / indeterminate props. */
export function updateCheckboxVisualState(host: {
  checked: boolean;
  indeterminate: boolean;
  shadowRoot: ShadowRoot | null;
}): void {
  const cbx = host.shadowRoot?.querySelector(".cbx");
  if (!cbx) return;

  if (host.checked) {
    cbx.classList.add("checked");
    cbx.classList.remove("indeterminate");
  } else if (host.indeterminate) {
    cbx.classList.add("indeterminate");
    cbx.classList.remove("checked");
  } else {
    cbx.classList.remove("checked", "indeterminate");
  }
}
