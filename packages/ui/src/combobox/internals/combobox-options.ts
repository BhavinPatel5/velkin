import type {
  VuComboboxFilteredRow,
  VuComboboxOption,
  VuComboboxValue,
} from "../combobox.types.js";

export type ComboboxOptionsHost = {
  options: VuComboboxOption[];
  searchable: boolean;
  query: string;
  multiple: boolean;
  filteredOptions: VuComboboxFilteredRow[];
  selectedItems: VuComboboxOption[];
  value: VuComboboxValue;
  requestUpdate: () => void;
};

/** Returns the committed value for an option row. */
export function getOptionValue(option: VuComboboxOption): unknown {
  if (typeof option === "string") return option;
  if (option.value != null) return option.value;
  if (option.label != null) return String(option.label);
  return option;
}

/** Returns the display label for an option row. */
export function getOptionLabel(option: VuComboboxOption): string {
  if (!option) return "";
  if (typeof option === "string") return option;
  if (option.label != null) return String(option.label);
  if (option.value != null) return String(option.value);
  return JSON.stringify(option);
}

/** Stable comparable key for an option value. */
export function optionKey(option: VuComboboxOption): string {
  const val = getOptionValue(option);
  return typeof val === "object" ? JSON.stringify(val) : String(val);
}

/** Value shown in the main field input (filter text or closed single-select label). */
export function getFieldInputValue(host: ComboboxOptionsHost): string {
  if (host.query !== "") return host.query;
  if (!host.multiple && host.selectedItems.length > 0) {
    return getOptionLabel(host.selectedItems[0]!);
  }
  return "";
}

/** Rebuilds `filteredOptions` from `options` and the current `query`. */
export function filterOptions(host: ComboboxOptionsHost): void {
  const optionsArray = Array.isArray(host.options) ? host.options : [];

  const makeRow = (option: VuComboboxOption, idx: number): VuComboboxFilteredRow => {
    const label = getOptionLabel(option);
    return { original: option, _idx: idx, label, highlighted: label };
  };

  if (!host.searchable || !host.query.trim()) {
    host.filteredOptions = optionsArray.map(makeRow);
    return;
  }

  const q = host.query.toLowerCase();
  host.filteredOptions = optionsArray
    .map(makeRow)
    .filter((row) => String(row.label).toLowerCase().includes(q));
}

/** Syncs `selectedItems` from the external `value` prop and `options`. */
export function syncSelectedItemsWithValue(host: ComboboxOptionsHost): void {
  const optionsArray = Array.isArray(host.options) ? host.options : [];
  const isEmptyMulti = host.multiple && Array.isArray(host.value) && host.value.length === 0;

  if (host.value == null || host.value === "" || isEmptyMulti) {
    host.selectedItems = [];
    host.value = host.multiple ? [] : "";
    return;
  }

  if (host.multiple && typeof host.value === "string") {
    try {
      const parsed = JSON.parse(host.value) as unknown;
      if (Array.isArray(parsed)) host.value = parsed as string[];
    } catch {}
  }

  const compareKey = (item: VuComboboxOption) => optionKey(item);

  if (host.multiple) {
    const raw = Array.isArray(host.value) ? host.value : [host.value];
    const providedKeys = new Set(raw.map((v) => String(v)));
    host.selectedItems = optionsArray.filter((opt) => providedKeys.has(compareKey(opt)));
    host.value = host.selectedItems.map((opt) => String(getOptionValue(opt))) as VuComboboxValue;
  } else {
    const targetValue = String(host.value);
    const selectedOption = optionsArray.find((opt) => compareKey(opt) === targetValue);
    host.selectedItems = selectedOption ? [selectedOption] : [];
    host.value = selectedOption ? (String(getOptionValue(selectedOption)) as VuComboboxValue) : "";
  }
}

/** Whether the user can add the current filter string as a new option. */
export function canAddOption(host: ComboboxOptionsHost & { addOption: boolean }): boolean {
  if (!host.addOption) return false;
  const q = host.query.trim();
  if (!q) return false;
  const optionsArray = Array.isArray(host.options) ? host.options : [];
  const dup = optionsArray.some((opt) => {
    const label = getOptionLabel(opt).toLowerCase();
    const val = String(getOptionValue(opt) ?? "").toLowerCase();
    return label === q.toLowerCase() || val === q.toLowerCase();
  });
  return !dup;
}
