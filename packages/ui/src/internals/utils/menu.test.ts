import { describe, it, expect } from "vitest";
import {
  createMenuTypeaheadState,
  focusMenuRowAt,
  focusMenuRowByPrefix,
  handleMenuKeydown,
  menuOrientationFromPlacement,
} from "./menu.js";

describe("menu utils", () => {
  it("focusMenuRowAt wraps indices", () => {
    const order: number[] = [];
    const items = [
      { focus: () => order.push(0) },
      { focus: () => order.push(1) },
      { focus: () => order.push(2) },
    ];
    focusMenuRowAt(items, 4);
    expect(order).toEqual([1]);
  });

  it("focusMenuRowByPrefix finds a matching label", () => {
    const focused: string[] = [];
    const items = [
      { focus: () => focused.push("edit"), label: "Edit" },
      { focus: () => focused.push("archive"), label: "Archive" },
    ];
    const matched = focusMenuRowByPrefix(items, "ar", 0, (row) => row.label);
    expect(matched).toBe(1);
    expect(focused).toEqual(["archive"]);
  });

  it("handleMenuKeydown requests the next index on ArrowDown", () => {
    const rows = [document.createElement("button"), document.createElement("button")];
    let target = 0;
    handleMenuKeydown(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      rows,
      rows[0],
      createMenuTypeaheadState(),
      (index) => {
        target = index;
      },
    );
    expect(target).toBe(1);
  });

  it("menuOrientationFromPlacement returns horizontal for left/right", () => {
    expect(menuOrientationFromPlacement("left")).toBe("horizontal");
    expect(menuOrientationFromPlacement("bottom")).toBe("vertical");
    expect(menuOrientationFromPlacement("auto")).toBe("vertical");
    expect(menuOrientationFromPlacement("auto", "right")).toBe("horizontal");
  });
});
