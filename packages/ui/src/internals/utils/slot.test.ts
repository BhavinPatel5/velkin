import { describe, expect, it } from "vitest";
import {
  hasAssignedContent,
  hasLightChildrenInSlot,
  slotOrPropVisible,
} from "./slot.js";

describe("slot utilities", () => {
  it("slotOrPropVisible is true for non-empty prop", () => {
    const host = document.createElement("div");
    expect(slotOrPropVisible(host, "hint", "Help")).toBe(true);
  });

  it("slotOrPropVisible is true for slotted child without prop", () => {
    const host = document.createElement("div");
    const span = document.createElement("span");
    span.slot = "hint";
    host.appendChild(span);
    expect(slotOrPropVisible(host, "hint", "")).toBe(true);
  });

  it("slotOrPropVisible is false when prop and slot are empty", () => {
    const host = document.createElement("div");
    expect(slotOrPropVisible(host, "hint", "  ")).toBe(false);
  });

  it("hasLightChildrenInSlot ignores other slot names", () => {
    const host = document.createElement("div");
    const label = document.createElement("span");
    label.slot = "label";
    host.appendChild(label);
    expect(hasLightChildrenInSlot(host, "hint")).toBe(false);
    expect(hasLightChildrenInSlot(host, "label")).toBe(true);
  });

  it("hasAssignedContent ignores empty relay slots when relayAware", () => {
    const host = document.createElement("div");
    host.attachShadow({ mode: "open" });
    host.shadowRoot!.innerHTML = `<slot name="actions"></slot>`;
    const relay = document.createElement("slot");
    relay.name = "actions";
    relay.slot = "actions";
    host.appendChild(relay);
    const target = host.shadowRoot!.querySelector('slot[name="actions"]') as HTMLSlotElement;
    expect(hasAssignedContent(target)).toBe(true);
    expect(hasAssignedContent(target, { relayAware: true })).toBe(false);
  });
});
