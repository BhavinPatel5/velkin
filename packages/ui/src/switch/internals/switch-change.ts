import type { VuSwitchChangeDetail } from "../switch.types.js";

/** Switch surface the change handler reads and mutates. */
export type SwitchChangeHost = {
  disabled: boolean;
  readonly: boolean;
  checked: boolean;
  value: string;
  _inputElement?: HTMLInputElement | null;
  validateInput(): boolean;
  dispatchEvent(event: Event): boolean;
};

function emittedValue(host: SwitchChangeHost): string | boolean | undefined {
  if (host.value.trim() !== "") {
    return host.checked ? host.value : undefined;
  }
  return host.checked;
}

/** Handles native `change` on the switch input. */
export function handleSwitchChange(host: SwitchChangeHost, event: Event): void {
  const target = event.target as HTMLInputElement;

  if (host.disabled || host.readonly) {
    if (host._inputElement) host._inputElement.checked = host.checked;
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  host.checked = target.checked;
  host.validateInput();

  const detail: VuSwitchChangeDetail = {
    checked: host.checked,
    value: emittedValue(host),
  };
  host.dispatchEvent(
    new CustomEvent<VuSwitchChangeDetail>("vu-change", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}

/** Syncs `.swx` classList with checked prop. */
export function updateSwitchVisualState(host: {
  checked: boolean;
  shadowRoot: ShadowRoot | null;
}): void {
  const swx = host.shadowRoot?.querySelector(".swx");
  if (!swx) return;
  swx.classList.toggle("checked", host.checked);
}
