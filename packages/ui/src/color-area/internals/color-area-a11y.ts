import { msg } from "../../internals/utils/localize.js";
import type { VuColorAreaChannel } from "../color-area.types.js";
import {
  capChannelLabel,
  colorAreaAxisDisplayValue,
  colorAreaAxisLabel,
  effectiveColorAreaAxes,
  readColorAreaIdle,
  type ColorAreaAxisState,
} from "./color-area-axes.js";

export function axisLabel(
  colorSpace: ColorAreaAxisState["colorSpace"],
  ch: VuColorAreaChannel,
): string {
  return colorAreaAxisLabel(colorSpace, ch);
}

export function axisDisplayValue(
  colorSpace: ColorAreaAxisState["colorSpace"],
  ch: VuColorAreaChannel,
  value: number,
): string {
  return colorAreaAxisDisplayValue(colorSpace, ch, value);
}

export function resolvedLabel(label: string): string {
  return (
    label.trim() ||
    String(msg("Saturation and brightness", { desc: "Default label for the color area plane." }))
  );
}

export function applyColorAreaA11y(
  host: HTMLElement,
  state: ColorAreaAxisState,
  options: { label: string; disabled: boolean },
): void {
  if (!host.hasAttribute("role")) host.setAttribute("role", "application");
  if (!host.hasAttribute("aria-roledescription")) {
    host.setAttribute(
      "aria-roledescription",
      String(msg("color picker", { desc: "ARIA role description for the color area." })),
    );
  }
  const { x, y } = effectiveColorAreaAxes(state);
  const valueText = `${capChannelLabel(axisLabel(state.colorSpace, x))} ${axisDisplayValue(state.colorSpace, x, readColorAreaIdle(state, x))}, ${capChannelLabel(axisLabel(state.colorSpace, y))} ${axisDisplayValue(state.colorSpace, y, readColorAreaIdle(state, y))}`;
  host.setAttribute("aria-label", `${resolvedLabel(options.label)}: ${valueText}`);
  host.removeAttribute("aria-valuemin");
  host.removeAttribute("aria-valuemax");
  host.removeAttribute("aria-valuenow");
  host.removeAttribute("aria-valuetext");
  if (options.disabled) {
    host.setAttribute("aria-disabled", "true");
  } else {
    host.removeAttribute("aria-disabled");
  }
}
