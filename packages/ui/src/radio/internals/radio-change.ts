import type { VuRadioChangeDetail } from "../radio.types.js";

/** Radio surface the change handler reads and mutates. */
export type RadioChangeHost = {
  disabled: boolean;
  readonly: boolean;
  checked: boolean;
  value: string;
  name: string;
  _inputElement?: HTMLInputElement | null;
  uncheckPeers(): void;
  validateInput(): boolean;
  dispatchEvent(event: Event): boolean;
};

/** Unchecks other radios with the same name in the group or document scope. */
export function uncheckRadioPeers(host: HTMLElement & { name: string; checked: boolean }): void {
  const group = host.closest("vu-radio-group");
  if (group) {
    for (const el of group.querySelectorAll("vu-radio")) {
      if (el === host) continue;
      (el as { checked: boolean }).checked = false;
    }
    return;
  }

  const root = host.getRootNode();
  const scope = root instanceof Document || root instanceof ShadowRoot ? root : document;
  for (const el of scope.querySelectorAll("vu-radio")) {
    if (el === host) continue;
    const r = el as { name: string; checked: boolean };
    if (host.name && r.name === host.name) r.checked = false;
  }
}

/** Syncs `.rdx` classList with checked prop. */
export function updateRadioVisualState(host: {
  checked: boolean;
  shadowRoot: ShadowRoot | null;
}): void {
  const rdx = host.shadowRoot?.querySelector(".rdx");
  if (!rdx) return;
  rdx.classList.toggle("checked", host.checked);
}

/** Handles native `change` on the radio input. */
export function handleRadioChange(host: RadioChangeHost, event: Event): void {
  const target = event.target as HTMLInputElement;

  if (host.disabled || host.readonly) {
    if (host._inputElement) host._inputElement.checked = host.checked;
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (!target.checked) return;

  host.uncheckPeers();
  host.checked = true;
  host.validateInput();

  const detail: VuRadioChangeDetail = {
    checked: true,
    value: host.value || undefined,
  };
  host.dispatchEvent(
    new CustomEvent<VuRadioChangeDetail>("vu-change", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}
