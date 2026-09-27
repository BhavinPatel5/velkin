import { html } from "lit";
import { describe, expect, it } from "vitest";
import {
  createNotificationItem,
  notificationMatchesDuplicate,
  resolveNotificationDuration,
} from "../../internals/notification-store.js";

describe("notificationMatchesDuplicate", () => {
  it("matches title, message, and color", () => {
    const item = createNotificationItem(
      1,
      { title: "Saved", message: "Done", color: "success" },
      { removable: true, variant: "flat" },
    );
    expect(
      notificationMatchesDuplicate(item, { title: "Saved", message: "Done", color: "success" }),
    ).toBe(true);
    expect(
      notificationMatchesDuplicate(item, { title: "Saved", message: "Done", color: "danger" }),
    ).toBe(false);
  });

  it("skips custom toasts", () => {
    const item = createNotificationItem(
      2,
      { title: "Saved", content: () => html`` },
      { removable: true, variant: "flat" },
    );
    expect(notificationMatchesDuplicate(item, { title: "Saved" })).toBe(false);
  });
});

describe("createNotificationItem", () => {
  it("fills defaults for optional fields", () => {
    const item = createNotificationItem(3, { title: "Hi" }, { removable: true, variant: "flat" });
    expect(item.id).toBe(3);
    expect(item.title).toBe("Hi");
    expect(item.message).toBe("");
    expect(item.color).toBe("default");
    expect(item.variant).toBe("flat");
    expect(item.state).toBe("idle");
    expect(item.count).toBe(1);
    expect(item.removing).toBe(false);
    expect(item.removable).toBe(true);
    expect(item.custom).toBe(false);
  });

  it("marks custom toasts", () => {
    const item = createNotificationItem(
      4,
      { content: () => html`` },
      { removable: true, variant: "bordered" },
    );
    expect(item.custom).toBe(true);
    expect(item.variant).toBe("bordered");
  });
});

describe("resolveNotificationDuration", () => {
  it("uses provider default when duration is omitted", () => {
    expect(resolveNotificationDuration(undefined, 4000)).toBe(4000);
  });

  it("treats zero and null as persistent", () => {
    expect(resolveNotificationDuration(0, 4000)).toBeNull();
    expect(resolveNotificationDuration(null, 4000)).toBeNull();
  });
});
