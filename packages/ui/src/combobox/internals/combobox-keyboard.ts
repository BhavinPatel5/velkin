import type { CloseReason } from "../../internals/controllers/popover-controller.js";
import type { VuComboboxOption } from "../combobox.types.js";
import { emitComboboxAdd } from "./combobox-events.js";
import {
  canAddOption,
  filterOptions,
  getOptionValue,
  type ComboboxOptionsHost,
} from "./combobox-options.js";
import { selectOption, toggleSelectAll, type ComboboxSelectionHost } from "./combobox-selection.js";

export type ComboboxListVirtualizer = {
  scrollToIndex: (index: number, options?: { align?: "start" | "center" | "end" | "auto" }) => void;
};

export type ComboboxKeyboardHost = ComboboxSelectionHost & {
  addOption: boolean;
  searchable: boolean;
  activeIndex: number;
  headerRows: number;
  rowEls: NodeListOf<HTMLElement>;
  searchInputEl: HTMLInputElement | undefined;
  readonly: boolean;
  commitDropdownEnter: () => void;
  getListVirtualizer?: () => ComboboxListVirtualizer | undefined;
};

/** Resolves keyboard highlight to select-all / option semantics. */
export function getOptionByActiveIndex(
  host: ComboboxKeyboardHost,
): { kind: "select-all" | "option"; optionIndex?: number } | null {
  if (!host.open) return null;
  const idx = host.activeIndex;
  if (idx < 0) return null;

  if (host.headerRows > 0 && idx === 0) {
    return { kind: "select-all" };
  }

  const optionIndex = idx - host.headerRows;
  if (optionIndex >= 0 && optionIndex < host.filteredOptions.length) {
    return { kind: "option", optionIndex };
  }
  return null;
}

/** Commits keyboard highlight on Enter. */
export function commitDropdownEnter(host: ComboboxKeyboardHost): void {
  const target = getOptionByActiveIndex(host);
  if (!target) return;

  if (target.kind === "select-all") {
    toggleSelectAll(host);
    return;
  }
  if (target.kind === "option" && typeof target.optionIndex === "number") {
    selectOption(host, host.filteredOptions[target.optionIndex]!.original);
    host.query = "";
    host.emitQueryChanged();
  }
}

/** Scrolls the highlighted row into view in the listbox scroller. */
export function scrollActiveItemIntoView(host: ComboboxKeyboardHost): void {
  const optionIndex = host.activeIndex - host.headerRows;
  const engine = host.getListVirtualizer?.();
  if (engine && optionIndex >= 0) {
    engine.scrollToIndex(optionIndex, { align: "auto" });
    return;
  }
  const rows = Array.from(host.rowEls);
  const active = rows.find((r) => Number(r.dataset.rowIndex) === host.activeIndex);
  active?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
}

/** Moves roving highlight on Arrow/Tab/Home/End from the input wrapper. */
export function handleComboboxKeydown(
  host: ComboboxKeyboardHost & {
    dropdownPopover: {
      openPopover: () => void;
      closePopover: (reason?: CloseReason) => Promise<void>;
    };
  },
  event: KeyboardEvent,
): void {
  const { key, shiftKey } = event;

  if (!host.open && (key === "ArrowDown" || key === "ArrowUp" || key === "Enter")) {
    host.dropdownPopover.openPopover();
    event.preventDefault();
    return;
  }
  if (!host.open) return;

  const minIndex = 0;
  const maxIndex = host.headerRows + Math.max(0, host.filteredOptions.length) - 1;
  if (host.activeIndex < minIndex) host.activeIndex = minIndex;

  if (key === "ArrowDown") {
    const was = host.activeIndex < minIndex ? minIndex : host.activeIndex;
    host.activeIndex = was >= maxIndex ? minIndex : was + 1;
    scrollActiveItemIntoView(host);
    event.preventDefault();
    return;
  }
  if (key === "ArrowUp") {
    const was = host.activeIndex < minIndex ? minIndex : host.activeIndex;
    host.activeIndex = was <= minIndex ? maxIndex : was - 1;
    scrollActiveItemIntoView(host);
    event.preventDefault();
    return;
  }
  if (key === "Tab") {
    const was = host.activeIndex < minIndex ? minIndex : host.activeIndex;
    host.activeIndex = shiftKey
      ? was <= minIndex
        ? maxIndex
        : was - 1
      : was >= maxIndex
        ? minIndex
        : was + 1;
    scrollActiveItemIntoView(host);
    event.preventDefault();
    return;
  }
  if (key === "Enter") {
    event.preventDefault();
    event.stopPropagation();
    commitDropdownEnter(host);
    return;
  }
  if (host.readonly) {
    if (key === "Escape") {
      host.open = false;
      event.preventDefault();
    }
    return;
  }
  if (key === "Home") {
    host.activeIndex = minIndex;
    scrollActiveItemIntoView(host);
    event.preventDefault();
    return;
  }
  if (key === "End") {
    host.activeIndex = Math.max(minIndex, maxIndex);
    scrollActiveItemIntoView(host);
    event.preventDefault();
  }
}

/** Field-input key handler (Enter + arrow handoff into the listbox). */
export function handleSearchKeydown(host: ComboboxKeyboardHost, e: KeyboardEvent): void {
  const { key } = e;
  if (key === "Enter") {
    e.preventDefault();
    e.stopPropagation();
    if (host.addOption && canAddOption(host)) {
      emitComboboxAdd(host, host.query.trim());
      host.query = "";
      host.emitQueryChanged();
      filterOptions(host);
      return;
    }
    commitDropdownEnter(host);
    return;
  }
  if (key === "ArrowDown" || key === "ArrowUp" || key === "Tab") {
    e.preventDefault();
    e.stopPropagation();
    const minIndex = 0;
    const maxIndex = host.headerRows + Math.max(0, host.filteredOptions.length) - 1;
    const dir = key === "ArrowUp" || (key === "Tab" && e.shiftKey) ? -1 : 1;
    if (host.activeIndex < minIndex) host.activeIndex = minIndex;
    else {
      host.activeIndex =
        host.activeIndex + dir < minIndex
          ? maxIndex
          : host.activeIndex + dir > maxIndex
            ? minIndex
            : host.activeIndex + dir;
    }
    scrollActiveItemIntoView(host);
  }
  if (key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    host.dropdownPopover.closePopover("escape");
  }
}

/** Focuses search or the first selected option when the panel opens. */
export function focusOnOpen(
  host: ComboboxKeyboardHost & ComboboxOptionsHost & { selectedItems: VuComboboxOption[] },
): void {
  const search = host.searchInputEl;
  if (search) {
    if (document.activeElement !== search) requestAnimationFrame(() => search.focus());
    host.activeIndex = host.headerRows > 0 ? 0 : host.headerRows;
    scrollActiveItemIntoView(host);
    return;
  }

  let optionIdx = 0;
  if (host.selectedItems.length > 0) {
    const firstSelVal = getOptionValue(host.selectedItems[0]!);
    const idxInFiltered = host.filteredOptions.findIndex(
      ({ original }) => getOptionValue(original) === firstSelVal,
    );
    if (idxInFiltered >= 0) optionIdx = idxInFiltered;
  }
  host.activeIndex = host.headerRows + optionIdx;
  scrollActiveItemIntoView(host);
}
