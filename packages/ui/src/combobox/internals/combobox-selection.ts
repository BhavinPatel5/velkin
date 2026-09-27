import type { CloseReason } from "../../internals/controllers/popover-controller.js";
import type {
  VuComboboxFilteredRow,
  VuComboboxOption,
  VuComboboxValue,
} from "../combobox.types.js";
import { emitComboboxChange } from "./combobox-events.js";
import { getOptionValue, optionKey, type ComboboxOptionsHost } from "./combobox-options.js";

export type ComboboxSelectionHost = ComboboxOptionsHost & {
  disabled: boolean;
  readonly: boolean;
  multiple: boolean;
  visibleChips: number;
  query: string;
  open: boolean;
  filteredOptions: VuComboboxFilteredRow[];
  runSyncFormValue: () => void;
  runSyncValidity: () => void;
  validateInput: () => boolean;
  dropdownPopover: { closePopover: (reason?: CloseReason) => Promise<void> };
  hiddenPopover: { closePopover: (reason?: CloseReason) => Promise<void> };
  emitQueryChanged: () => void;
  requestUpdate: () => void;
  dispatchEvent: (event: Event) => boolean;
};

/** Clears the current selection when allowed. */
export function clearSelection(host: ComboboxSelectionHost): void {
  if (host.disabled || host.readonly) return;

  host.value = host.multiple ? [] : "";
  host.selectedItems = [];
  host.query = "";
  host.emitQueryChanged();
  host.open = false;

  emitComboboxChange(host, {
    value: host.value,
    selectedItems: [],
  });
  host.runSyncFormValue();
  host.runSyncValidity();
}

/** Toggles or commits a single option row. */
export function selectOption(host: ComboboxSelectionHost, option: VuComboboxOption): void {
  if (host.disabled || host.readonly) return;

  const keyOf = (o: VuComboboxOption) => optionKey(o);

  if (!host.multiple) {
    const alreadySelected =
      host.selectedItems.length > 0 && keyOf(host.selectedItems[0]!) === keyOf(option);
    if (alreadySelected) {
      host.selectedItems = [];
      host.value = "";
    } else {
      host.selectedItems = [option];
      host.value = String(getOptionValue(option)) as VuComboboxValue;
    }
    host.validateInput();
    emitComboboxChange(host, {
      value: host.value,
      selectedItems: host.selectedItems,
    });
    host.query = "";
    host.emitQueryChanged();
    host.dropdownPopover.closePopover("api");
    host.runSyncFormValue();
    host.runSyncValidity();
    host.requestUpdate();
    return;
  }

  const index = host.selectedItems.findIndex((item) => keyOf(item) === keyOf(option));
  const nextSelected =
    index > -1
      ? [...host.selectedItems.slice(0, index), ...host.selectedItems.slice(index + 1)]
      : [...host.selectedItems, option];

  host.selectedItems = nextSelected;
  host.value = nextSelected.map((item) => String(getOptionValue(item))) as VuComboboxValue;
  host.validateInput();
  emitComboboxChange(host, {
    value: host.value,
    selectedItems: host.selectedItems,
  });
  host.runSyncFormValue();
  host.runSyncValidity();
  host.open = true;
  host.requestUpdate();
}

/** Removes one chip from a multi-select value. */
export function removeChip(host: ComboboxSelectionHost, option: VuComboboxOption): void {
  if (host.disabled || host.readonly) return;
  const keyOf = (o: VuComboboxOption) => optionKey(o);
  const next = host.selectedItems.filter((item) => keyOf(item) !== keyOf(option));

  host.selectedItems = next;
  if (host.selectedItems.length <= host.visibleChips) {
    host.hiddenPopover.closePopover("api");
  }

  if (host.multiple) {
    const valuesArray = host.selectedItems.map((opt) =>
      String(getOptionValue(opt)),
    ) as VuComboboxValue;
    host.value = valuesArray;
    emitComboboxChange(host, {
      value: valuesArray,
      selectedItems: [...host.selectedItems],
    });
  } else {
    host.value = "";
    emitComboboxChange(host, {
      value: host.value,
      selectedItems: [],
    });
  }
  host.runSyncFormValue();
  host.runSyncValidity();
  host.validateInput();
  host.requestUpdate();
}

/** Whether every filtered row is currently selected. */
export function isAllFilteredSelected(host: ComboboxSelectionHost): boolean {
  if (host.filteredOptions.length === 0) return false;
  return host.filteredOptions.every(({ original }) =>
    host.selectedItems.some((item) => optionKey(item) === optionKey(original)),
  );
}

/** Selects or deselects all rows in the current filter. */
export function toggleSelectAll(host: ComboboxSelectionHost): void {
  if (host.disabled || host.readonly) return;
  const keyOf = (o: VuComboboxOption) => optionKey(o);

  if (isAllFilteredSelected(host)) {
    const filteredKeys = new Set(host.filteredOptions.map(({ original }) => keyOf(original)));
    host.selectedItems = host.selectedItems.filter((item) => !filteredKeys.has(keyOf(item)));
  } else {
    const selectedKeys = new Set(host.selectedItems.map((item) => keyOf(item)));
    const additions = host.filteredOptions
      .map(({ original }) => original)
      .filter((opt) => !selectedKeys.has(keyOf(opt)));
    host.selectedItems = [...host.selectedItems, ...additions];
  }

  const valuesArray = host.selectedItems.map((opt) =>
    String(getOptionValue(opt)),
  ) as VuComboboxValue;
  host.value = valuesArray;
  emitComboboxChange(host, {
    value: valuesArray,
    selectedItems: [...host.selectedItems],
  });
  host.runSyncFormValue();
  host.runSyncValidity();
  host.requestUpdate();
}
