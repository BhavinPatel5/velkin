import {
  findTriggerControl,
  MENU_HOVER_CLOSE_MS,
  MENU_HOVER_OPEN_MS,
} from "../../internals/utils/menu.js";
import { devTag, devWarnOnceForHost } from "../../internals/utils/dev-warn.js";
import type {
  VuDropdownSubmenuHoverDetail,
  VuDropdownSubmenuHoverPhase,
  VuDropdownTrigger,
} from "../dropdown.types.js";

/** Host surface for trigger resolve, hover timers, trigger a11y, and pointer/keyboard open. */
export type DropdownTriggerHost = {
  trigger: VuDropdownTrigger;
  disabled: boolean;
  open: boolean;
  readonly _isSubmenu: boolean;
  readonly _bodyId: string;
  _triggerControl: HTMLElement | null;
  readonly _triggerWrap: HTMLElement;
  readonly _triggerSlot: HTMLSlotElement;
  _hoverTrigger: boolean;
  _hoverBody: boolean;
  _openTimeout: number | null;
  _closeTimeout: number | null;
  _ready: boolean;
  readonly _popover: { refreshTargets(): void };
  _onTriggerKeydown: (e: KeyboardEvent) => void;
  _onTriggerControlClick: (e: MouseEvent) => void;
  show(): void;
  hide(): void;
  toggle(): void;
  dispatchEvent(event: Event): boolean;
};

export function syncDropdownSubmenuDismissGuard(host: DropdownTriggerHost): void {
  const el = host as DropdownTriggerHost & {
    setAttribute(name: string, value: string): void;
    removeAttribute(name: string): void;
  };
  if (host._isSubmenu) el.setAttribute("data-popover-ignore-outside", "");
  else el.removeAttribute("data-popover-ignore-outside");
}

export function clearDropdownHoverTimeouts(host: DropdownTriggerHost): void {
  if (host._openTimeout) {
    clearTimeout(host._openTimeout);
    host._openTimeout = null;
  }
  if (host._closeTimeout) {
    clearTimeout(host._closeTimeout);
    host._closeTimeout = null;
  }
}

export function resolveDropdownTriggerControl(host: DropdownTriggerHost): void {
  if (host._isSubmenu) {
    detachDropdownTriggerListeners(host);
    host._triggerControl = null;
    return;
  }
  detachDropdownTriggerListeners(host);
  host._triggerControl = findTriggerControl(host._triggerSlot, host._triggerWrap);
  const ctrl = host._triggerControl;
  if (!ctrl) {
    devWarnOnceForHost(
      host as unknown as Element,
      "missing-trigger",
      `${devTag(host as unknown as Element)} requires a slotted \`trigger\` control (typically \`<vu-button>\`).`,
    );
    return;
  }
  ctrl.addEventListener("keydown", host._onTriggerKeydown);
  if (host.trigger === "click") {
    ctrl.addEventListener("click", host._onTriggerControlClick);
  }
}

export function detachDropdownTriggerListeners(host: DropdownTriggerHost): void {
  const ctrl = host._triggerControl;
  if (!ctrl) return;
  ctrl.removeEventListener("keydown", host._onTriggerKeydown);
  ctrl.removeEventListener("click", host._onTriggerControlClick);
}

export function syncDropdownTriggerA11y(host: DropdownTriggerHost): void {
  if (host._isSubmenu) return;
  const ctrl = host._triggerControl ?? host._triggerWrap;
  if (!ctrl) return;
  ctrl.setAttribute("aria-expanded", String(host.open));
  ctrl.setAttribute("aria-haspopup", "menu");
  ctrl.setAttribute("aria-controls", host._bodyId);
  if (host.disabled) ctrl.setAttribute("aria-disabled", "true");
  else ctrl.removeAttribute("aria-disabled");
  host._triggerWrap.removeAttribute("aria-expanded");
  host._triggerWrap.removeAttribute("aria-haspopup");
  host._triggerWrap.removeAttribute("aria-controls");
  host._triggerWrap.removeAttribute("role");
  host._triggerWrap.removeAttribute("tabindex");
}

export function onDropdownTriggerSlotChange(host: DropdownTriggerHost): void {
  resolveDropdownTriggerControl(host);
  syncDropdownTriggerA11y(host);
  if (host._ready && !host.open) host._popover.refreshTargets();
}

export const onDropdownTriggerControlClick = (host: DropdownTriggerHost, e: MouseEvent): void => {
  if (host.disabled || host.trigger !== "click") return;
  e.stopPropagation();
  host.toggle();
};

export const onDropdownTriggerClick = (host: DropdownTriggerHost, e: MouseEvent): void => {
  if (host.disabled || host.trigger !== "click") return;
  if (host._triggerControl && e.target !== host._triggerWrap) return;
  e.stopPropagation();
  host.toggle();
};

export const onDropdownTriggerKeydown = (host: DropdownTriggerHost, e: KeyboardEvent): void => {
  if (host.disabled) return;
  if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
    if (!host.open) {
      e.preventDefault();
      host.show();
    }
  }
};

export const onDropdownTriggerEnter = (host: DropdownTriggerHost): void => {
  if (host.disabled || host.trigger !== "hover") return;
  host._hoverTrigger = true;
  clearDropdownHoverTimeouts(host);
  host._openTimeout = window.setTimeout(() => {
    if (!host.open) host.show();
  }, MENU_HOVER_OPEN_MS);
};

export const onDropdownTriggerLeave = (host: DropdownTriggerHost): void => {
  if (host.trigger !== "hover") return;
  host._hoverTrigger = false;
  if (!host._hoverBody) scheduleDropdownHoverClose(host);
};

export const onDropdownBodyEnter = (host: DropdownTriggerHost): void => {
  if (host._isSubmenu) {
    emitDropdownSubmenuHover(host, "enter");
    return;
  }
  if (host.trigger !== "hover") return;
  host._hoverBody = true;
  clearDropdownHoverTimeouts(host);
};

export const onDropdownBodyLeave = (host: DropdownTriggerHost): void => {
  if (host._isSubmenu) {
    emitDropdownSubmenuHover(host, "leave");
    return;
  }
  if (host.trigger !== "hover") return;
  host._hoverBody = false;
  if (!host._hoverTrigger) scheduleDropdownHoverClose(host);
};

function emitDropdownSubmenuHover(
  host: DropdownTriggerHost,
  phase: VuDropdownSubmenuHoverPhase,
): void {
  host.dispatchEvent(
    new CustomEvent<VuDropdownSubmenuHoverDetail>("vu-submenuhover", {
      detail: { phase },
      bubbles: true,
      composed: true,
    }),
  );
}

export function scheduleDropdownHoverClose(host: DropdownTriggerHost): void {
  clearDropdownHoverTimeouts(host);
  host._closeTimeout = window.setTimeout(() => {
    if (host.open && host.trigger === "hover" && !host._hoverTrigger && !host._hoverBody) {
      host.hide();
    }
  }, MENU_HOVER_CLOSE_MS);
}
