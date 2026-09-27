import type { VuStepItem } from "../../step-item/step-item.js";

type StepsPanelHost = {
  renderRoot: DocumentFragment | Element | null;
};

function panelsWrap(host: StepsPanelHost): Element | null {
  return host.renderRoot?.querySelector(".panels") ?? null;
}

/** Moves `<vu-step-item>` default-slot children into the horizontal panel stack. */
export function reparentHorizontalStepPanels(host: StepsPanelHost, members: VuStepItem[]): void {
  const wrap = panelsWrap(host);
  if (!wrap) return;

  for (let i = 0; i < members.length; i++) {
    const panelContent = wrap.querySelector(`#steps-panel-${i + 1} .panel-content`);
    const member = members[i];
    if (!panelContent || !member) continue;

    for (const child of Array.from(member.children)) {
      if (child.parentElement !== panelContent) {
        panelContent.appendChild(child);
      }
    }
  }
}

/** Returns horizontal panel children back into their `<vu-step-item>`. */
export function restorePanelsToStepItems(host: StepsPanelHost, members: VuStepItem[]): void {
  const wrap = panelsWrap(host);
  if (!wrap) return;

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const panelContent = wrap.querySelector(`#steps-panel-${i + 1} .panel-content`);
    if (!member || !panelContent) continue;

    while (panelContent.firstChild) {
      member.appendChild(panelContent.firstChild);
    }
  }
}
