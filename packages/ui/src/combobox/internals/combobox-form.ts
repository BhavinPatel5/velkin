import type { FormState } from "../../internals/form/form-control-base.js";
import type { VuComboboxOption, VuComboboxValue } from "../combobox.types.js";
import { getOptionValue, type ComboboxOptionsHost } from "./combobox-options.js";

export type ComboboxFormHost = ComboboxOptionsHost & {
  disabled: boolean;
  name: string;
  multiple: boolean;
  required: boolean;
  selectedItems: VuComboboxOption[];
  value: VuComboboxValue;
  options: VuComboboxOption[];
  syncSelectedItemsWithValue: () => void;
};

/** Builds the value submitted with the surrounding form. */
export function getComboboxFormValue(host: ComboboxFormHost): FormState {
  if (host.disabled || !host.name) return null;

  if (host.multiple) {
    const formData = new FormData();
    host.selectedItems.forEach((item) => {
      formData.append(host.name, String(getOptionValue(item)));
    });
    if (host.selectedItems.length === 0 && host.required) {
      formData.append(host.name, "");
    }
    return formData;
  }

  if (host.selectedItems.length === 0) return "";
  return String(getOptionValue(host.selectedItems[0]!));
}

/** Restores selection from a saved form state or reset. */
export function setValueFromFormState(host: ComboboxFormHost, state: FormState): void {
  if (state === null || state === "") {
    host.value = host.multiple ? [] : "";
    host.selectedItems = [];
    return;
  }

  if (host.multiple) {
    let values: unknown[] = [];
    if (state instanceof FormData) values = state.getAll(host.name);
    else if (Array.isArray(state)) values = state;
    else if (typeof state === "string") {
      try {
        const parsed = JSON.parse(state) as unknown;
        values = Array.isArray(parsed) ? parsed : [state];
      } catch {
        values = [state];
      }
    }
    setValueFromArray(host, values);
    return;
  }

  let stringValue = "";
  if (typeof state === "string") stringValue = state;
  else if (state instanceof FormData) stringValue = state.get(host.name)?.toString() || "";
  else if (Array.isArray(state) && state.length > 0) stringValue = String(state[0]);

  host.value = stringValue;
  host.syncSelectedItemsWithValue();
}

/** Maps submitted primitive values back onto full option objects. */
export function setValueFromArray(host: ComboboxFormHost, values: unknown[]): void {
  const optionsArray = Array.isArray(host.options) ? host.options : [];
  host.selectedItems = optionsArray.filter((option) => {
    const optionValueString = String(getOptionValue(option));
    return values.some((value) => String(value) === optionValueString);
  });
  host.value = host.selectedItems.map((item) => String(getOptionValue(item))) as VuComboboxValue;
}
