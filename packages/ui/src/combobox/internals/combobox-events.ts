import type {
  VuComboboxAddDetail,
  VuComboboxChangeDetail,
  VuComboboxInputDetail,
  VuComboboxInvalidDetail,
} from "../combobox.types.js";

type EventHost = { dispatchEvent: (event: Event) => boolean };

/** Dispatches `vu-change` with the current selection snapshot. */
export function emitComboboxChange(host: EventHost, detail: VuComboboxChangeDetail): void {
  host.dispatchEvent(
    new CustomEvent<VuComboboxChangeDetail>("vu-change", {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}

/** Dispatches `vu-input` when the field filter query updates. */
export function emitComboboxInput(host: EventHost, query: string): void {
  host.dispatchEvent(
    new CustomEvent<VuComboboxInputDetail>("vu-input", {
      detail: { query },
      bubbles: true,
      composed: true,
    }),
  );
}

/** Dispatches `vu-invalid` when validation messages are recomputed. */
export function emitComboboxInvalid(host: EventHost, errors: string[]): void {
  host.dispatchEvent(
    new CustomEvent<VuComboboxInvalidDetail>("vu-invalid", {
      detail: { errors },
      bubbles: true,
      composed: true,
    }),
  );
}

/** Dispatches `vu-add` when the user confirms a new ad-hoc option. */
export function emitComboboxAdd(host: EventHost, value: string): void {
  host.dispatchEvent(
    new CustomEvent<VuComboboxAddDetail>("vu-add", {
      detail: { value },
      bubbles: true,
      composed: true,
    }),
  );
}
