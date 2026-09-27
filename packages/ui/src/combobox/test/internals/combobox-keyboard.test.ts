import { describe, expect, it, vi } from "vitest";
import {
  getOptionByActiveIndex,
  handleComboboxKeydown,
  handleSearchKeydown,
} from "../../internals/combobox-keyboard.js";
import type { ComboboxKeyboardHost } from "../../internals/combobox-keyboard.js";

function keydown(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
}

function createHost(
  overrides: Partial<
    ComboboxKeyboardHost & {
      dropdownPopover: { openPopover: () => void; closePopover: () => Promise<void> };
      filteredOptions: { original: string }[];
      query: string;
      emitQueryChanged: () => void;
    }
  > = {},
) {
  const host = {
    open: true,
    addOption: false,
    searchable: false,
    activeIndex: 0,
    headerRows: 0,
    rowEls: [] as unknown as NodeListOf<HTMLElement>,
    searchInputEl: undefined,
    readonly: false,
    filteredOptions: [{ original: "Red" }, { original: "Green" }, { original: "Blue" }],
    query: "",
    commitDropdownEnter: vi.fn(),
    emitQueryChanged: vi.fn(),
    dropdownPopover: {
      openPopover: vi.fn(),
      closePopover: vi.fn().mockResolvedValue(undefined),
    },
    ...overrides,
  };
  return host;
}

describe("combobox-keyboard", () => {
  it("opens the panel on ArrowDown when closed", () => {
    const host = createHost({ open: false });
    const event = keydown("ArrowDown");
    handleComboboxKeydown(host, event);
    expect(host.dropdownPopover.openPopover).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it("wraps ArrowDown highlight across options", () => {
    const host = createHost({ activeIndex: 2 });
    const event = keydown("ArrowDown");
    handleComboboxKeydown(host, event);
    expect(host.activeIndex).toBe(0);
    expect(event.defaultPrevented).toBe(true);
  });

  it("wraps ArrowUp highlight across options", () => {
    const host = createHost({ activeIndex: 0 });
    const event = keydown("ArrowUp");
    handleComboboxKeydown(host, event);
    expect(host.activeIndex).toBe(2);
    expect(event.defaultPrevented).toBe(true);
  });

  it("jumps to first and last rows with Home and End", () => {
    const host = createHost({ activeIndex: 1 });
    handleComboboxKeydown(host, keydown("Home"));
    expect(host.activeIndex).toBe(0);
    handleComboboxKeydown(host, keydown("End"));
    expect(host.activeIndex).toBe(2);
  });

  it("closes readonly dropdown on Escape", () => {
    const host = createHost({ readonly: true });
    const event = keydown("Escape");
    handleComboboxKeydown(host, event);
    expect(host.open).toBe(false);
    expect(event.defaultPrevented).toBe(true);
  });

  it("resolves select-all row when headerRows is set", () => {
    const host = createHost({ headerRows: 1, activeIndex: 0 });
    expect(getOptionByActiveIndex(host)).toEqual({ kind: "select-all" });
    host.activeIndex = 1;
    expect(getOptionByActiveIndex(host)).toEqual({ kind: "option", optionIndex: 0 });
  });

  it("handoffs ArrowDown from search input into the listbox", () => {
    const host = createHost({ activeIndex: 0 });
    const event = keydown("ArrowDown");
    handleSearchKeydown(host, event);
    expect(host.activeIndex).toBe(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("closes searchable dropdown on Escape from search input", () => {
    const host = createHost();
    const event = keydown("Escape");
    handleSearchKeydown(host, event);
    expect(host.dropdownPopover.closePopover).toHaveBeenCalledWith("escape");
    expect(event.defaultPrevented).toBe(true);
  });

  it("scrolls the virtualizer to the highlighted option", () => {
    const scrollToIndex = vi.fn();
    const host = createHost({
      activeIndex: 2,
      getListVirtualizer: () => ({ scrollToIndex }),
    });
    handleComboboxKeydown(host, keydown("Home"));
    expect(host.activeIndex).toBe(0);
    expect(scrollToIndex).toHaveBeenCalledWith(0, { align: "auto" });
  });
});
