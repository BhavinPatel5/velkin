import { html, nothing, type TemplateResult } from "lit";
import type { VuAvatarSize } from "../../avatar/avatar.types.js";
import type { VuListitem } from "../list-item.js";

export type ListItemRenderHost = Pick<
  VuListitem,
  | "avatar"
  | "label"
  | "hint"
  | "href"
  | "target"
  | "disabled"
  | "selected"
  | "itemTabIndex"
  | "size"
> & {
  readonly _isLink: boolean;
  readonly _rowRole: "listitem" | "option" | "group";
  readonly _avatarSize: VuAvatarSize;
  readonly _effectiveRel: () => string | undefined;
  readonly _effectiveName: string;
  _onActivate: (event: Event) => void;
  _onKeydown: (event: KeyboardEvent) => void;
  _stopActionsActivate: (event: Event) => void;
};

function rowA11y(host: ListItemRenderHost) {
  const isOption = host._rowRole === "option";
  return {
    role: host._rowRole,
    tabindex: host.disabled ? nothing : String(host.itemTabIndex),
    ariaSelected: isOption ? (host.selected ? "true" : "false") : nothing,
    ariaDisabled: host.disabled ? "true" : "false",
  };
}

function renderStart(host: ListItemRenderHost): TemplateResult {
  const showFallback = !!host.avatar.trim();
  return html`
    <div part="start" class=${showFallback ? "has-fallback" : nothing}>
      <slot name="start">
        ${
          showFallback
            ? html`
                <vu-avatar
                  part="avatar"
                  .src=${host.avatar}
                  .name=${host._effectiveName}
                  .size=${host._avatarSize}
                  .alt=${""}
                ></vu-avatar>
              `
            : nothing
        }
      </slot>
    </div>
  `;
}

function renderStack(host: ListItemRenderHost): TemplateResult {
  return html`
    <div part="stack">
      <div part="label">
        <slot>${host.label}</slot>
      </div>
      <div
        part="hint"
        class=${host.hint.trim() ? "has-text" : nothing}
      >
        <slot name="hint">${host.hint}</slot>
      </div>
    </div>
  `;
}

function renderActions(host: ListItemRenderHost): TemplateResult {
  return html`
    <div
      part="actions"
      @click=${host._stopActionsActivate}
      @keydown=${host._stopActionsActivate}
    >
      <slot name="actions"></slot>
    </div>
  `;
}

export function renderListItemRow(host: ListItemRenderHost): TemplateResult {
  const a11y = rowA11y(host);
  const content = html` ${renderStart(host)} ${renderStack(host)} ${renderActions(host)} `;

  if (host._isLink) {
    return html`
      <a
        part="base"
        role=${a11y.role}
        href=${host.href}
        target=${host.target || nothing}
        rel=${host._effectiveRel() ?? nothing}
        tabindex=${a11y.tabindex}
        aria-selected=${a11y.ariaSelected}
        aria-disabled=${a11y.ariaDisabled}
        @click=${host._onActivate}
        @keydown=${host._onKeydown}
      >
        ${content}
      </a>
    `;
  }

  return html`
    <div
      part="base"
      role=${a11y.role}
      tabindex=${a11y.tabindex}
      aria-selected=${a11y.ariaSelected}
      aria-disabled=${a11y.ariaDisabled}
      @click=${host._onActivate}
      @keydown=${host._onKeydown}
    >
      ${content}
    </div>
  `;
}
