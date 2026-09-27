import type { VuListitem } from "../../list-item/list-item.js";
import { findListTypeaheadMatch } from "./list-typeahead.js";

export type ListRowKeyboardHost = {
  focusableItems: () => VuListitem[];
  focusItemAt: (index: number) => void;
  activateFocused: () => void;
  getFocusedIndex: () => number;
  setFocusedIndex: (index: number) => void;
  selection: "none" | "single" | "multiple";
  appendTypeahead: (char: string) => number | null;
};

const NAV_KEYS = new Set(["ArrowDown", "ArrowUp", "Home", "End", " ", "Enter"]);

/** Row-level keyboard handler; returns true when the event was consumed. */
export function handleListRowKeydown(
  host: ListRowKeyboardHost,
  row: VuListitem,
  event: KeyboardEvent,
): boolean {
  const items = host.focusableItems();
  if (!items.length || row.disabled) return false;

  let index = items.indexOf(row);
  if (index < 0) index = host.getFocusedIndex();

  if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    if (event.key !== " ") {
      event.preventDefault();
      const match = host.appendTypeahead(event.key);
      if (match !== null) {
        host.setFocusedIndex(match);
        host.focusItemAt(match);
      }
      return true;
    }
  }

  if (!NAV_KEYS.has(event.key)) return false;

  const max = items.length - 1;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      index = Math.min(index + 1, max);
      host.setFocusedIndex(index);
      host.focusItemAt(index);
      return true;
    case "ArrowUp":
      event.preventDefault();
      index = Math.max(index - 1, 0);
      host.setFocusedIndex(index);
      host.focusItemAt(index);
      return true;
    case "Home":
      event.preventDefault();
      host.setFocusedIndex(0);
      host.focusItemAt(0);
      return true;
    case "End":
      event.preventDefault();
      host.setFocusedIndex(max);
      host.focusItemAt(max);
      return true;
    case " ":
    case "Enter":
      event.preventDefault();
      if (host.selection !== "none") {
        host.setFocusedIndex(index);
        row.activate();
      } else if (event.key === "Enter" || event.key === " ") {
        row.activate();
      }
      return true;
    default:
      return false;
  }
}

export { findListTypeaheadMatch };
