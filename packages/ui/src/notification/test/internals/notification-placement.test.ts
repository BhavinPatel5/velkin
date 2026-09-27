import { expect, describe, it } from "vitest";
import {
  NOTIFICATION_POSITIONS,
  normalizeNotificationPosition,
  resolveNotificationPosition,
  toPopoverAlign,
  toPopoverPlacement,
} from "../../internals/notification-placement.js";

describe("notification placement", () => {
  it("exposes six screen positions", () => {
    expect(NOTIFICATION_POSITIONS).toEqual([
      "top-start",
      "top-center",
      "top-end",
      "bottom-start",
      "bottom-center",
      "bottom-end",
    ]);
  });

  it("resolves edge and align from a screen position", () => {
    expect(resolveNotificationPosition("top-center")).toEqual({
      edge: "top",
      align: "center",
    });
    expect(resolveNotificationPosition("bottom-end")).toEqual({
      edge: "bottom",
      align: "end",
    });
  });

  it("maps screen positions to inward popover sides", () => {
    expect(toPopoverPlacement("top-start")).toBe("bottom");
    expect(toPopoverPlacement("bottom-end")).toBe("top");
  });

  it("maps screen positions to popover align", () => {
    expect(toPopoverAlign("top-start")).toBe("start");
    expect(toPopoverAlign("bottom-center")).toBe("center");
    expect(toPopoverAlign("bottom-end")).toBe("end");
  });

  it("falls back to bottom-end for unknown values", () => {
    expect(normalizeNotificationPosition("left")).toBe("bottom-end");
  });
});
