import { html, nothing, type TemplateResult } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { repeat } from "lit/directives/repeat.js";
import { styleMap } from "lit/directives/style-map.js";
import { when } from "lit/directives/when.js";
import {
  buildNavPanelGroups,
  flattenNavPanelItems,
  isNavPanelCheckable,
  isNavPanelDivider,
  isNavPanelHeader,
  isNavPanelRailVisible,
  navPanelRowRel,
  type NavPanelGroup,
} from "./nav-panel-groups.js";
import type { VuNavPanelItem } from "../nav-panel.types.js";
import type { VuNavPanel } from "../nav-panel.js";

/** Host surface for nav-panel shadow markup. */
export type NavPanelRenderHost = Pick<
  VuNavPanel,
  | "items"
  | "value"
  | "collapsedGroups"
  | "collapsed"
  | "label"
  | "collapsedHints"
  | "collapsedHintPlacement"
  | "size"
> & {
  readonly _isRail: boolean;
  readonly _groupHeights: Record<string, number>;
  readonly _rovingKey: string;
  _itemValue(item: VuNavPanelItem, index: number): string;
  _rowAriaLabel(item: VuNavPanelItem): string;
  _rowDomId(itemValue: string): string;
  _onItemActivate(event: Event, item: VuNavPanelItem, index: number): void;
  _onFocusIn: (event: FocusEvent) => void;
  _onKeyDown: (event: KeyboardEvent) => void;
  toggleGroup(groupKey: string, force?: boolean): void;
};

function nativeHintTitle(host: NavPanelRenderHost, hint: string): string | typeof nothing {
  if (!host._isRail || host.collapsedHints !== "native" || !hint.trim()) return nothing;
  return hint;
}

function wrapRailTooltip(
  host: NavPanelRenderHost,
  hint: string,
  row: TemplateResult,
): TemplateResult {
  if (!host._isRail || host.collapsedHints !== "tooltip" || !hint.trim()) {
    return row;
  }
  return html`
    <vu-tooltip
      exportparts="surface: collapsed-hint, content: collapsed-hint"
      .label=${hint}
      .placement=${host.collapsedHintPlacement}
      .size=${host.size}
      .trigger=${"hover"}
      .delay=${0}
      .closeDelay=${0}
    >
      ${row}
    </vu-tooltip>
  `;
}

function renderStateControl(host: NavPanelRenderHost, item: VuNavPanelItem): TemplateResult {
  if (item.kind === "checkbox") {
    return html`<vu-checkbox
      tone="normal"
      .size=${host.size}
      .checked=${!!item.checked}
      readonly
    ></vu-checkbox>`;
  }
  return html`<vu-radio
    tone="normal"
    .size=${host.size}
    .checked=${!!item.checked}
    readonly
  ></vu-radio>`;
}

function renderRowContent(host: NavPanelRenderHost, item: VuNavPanelItem): TemplateResult {
  if (isNavPanelCheckable(item)) {
    if (host._isRail) {
      return html`<span part="state">${renderStateControl(host, item)}</span>`;
    }
    const hasDescription = !!item.description?.trim();
    const hasBadge = !!item.badge?.trim();
    return html`
      <span part="state">${renderStateControl(host, item)}</span>
      <span part="stack">
        <span part="label">${item.label}</span>
        ${when(hasDescription, () => html`<span part="description">${item.description}</span>`)}
      </span>
      ${when(hasBadge, () => html`<span part="badge">${item.badge}</span>`)}
    `;
  }

  const iconStart = !host._isRail && item.icon && item.iconPosition !== "end";
  const iconEnd = !host._isRail && item.icon && item.iconPosition === "end";
  const hasDescription = !!item.description?.trim();
  const hasBadge = !!item.badge?.trim();

  if (host._isRail) {
    return html`<vu-icon part="icon" .icon=${item.icon!}></vu-icon>`;
  }

  return html`
    ${when(iconStart, () => html`<vu-icon part="icon" .icon=${item.icon!}></vu-icon>`)}
    <span part="stack">
      <span part="label">${item.label}</span>
      ${when(hasDescription, () => html`<span part="description">${item.description}</span>`)}
    </span>
    ${when(hasBadge, () => html`<span part="badge">${item.badge}</span>`)}
    ${when(
      iconEnd,
      () => html`<vu-icon part="icon" data-position="end" .icon=${item.icon!}></vu-icon>`,
    )}
  `;
}

function renderHeader(item: VuNavPanelItem): TemplateResult {
  return html`<div part="header" role="presentation">${item.label}</div>`;
}

function renderDivider(): TemplateResult {
  return html`<div part="divider" role="presentation"><vu-divider></vu-divider></div>`;
}

function renderPanelShell(
  host: NavPanelRenderHost,
  content: unknown,
  listbox: boolean,
): TemplateResult {
  return html`
    <section part="panel" @focusin=${host._onFocusIn}>
      <div
        part="body"
        role=${listbox ? "listbox" : nothing}
        aria-label=${host.label}
        @keydown=${host._onKeyDown}
      >
        <div part="prepend">
          <slot name="prepend"></slot>
        </div>
        ${content}
        <div part="append">
          <slot name="append"></slot>
        </div>
      </div>
    </section>
  `;
}

function renderRow(
  host: NavPanelRenderHost,
  item: VuNavPanelItem,
  index: number,
  listbox: boolean,
): TemplateResult | typeof nothing {
  if (isNavPanelHeader(item)) {
    return host._isRail ? nothing : renderHeader(item);
  }
  if (isNavPanelDivider(item)) {
    return host._isRail ? nothing : renderDivider();
  }
  if (host._isRail && !isNavPanelRailVisible(item)) {
    return nothing;
  }

  const itemValue = host._itemValue(item, index);
  const checkable = isNavPanelCheckable(item);
  const isActive = checkable ? !!item.checked : host.value === itemValue;
  const hint = host._rowAriaLabel(item);
  const rowId = host._rowDomId(itemValue);
  const ariaLabel = host._isRail || item.description?.trim() ? hint : nothing;
  const tabindex = host._rovingKey === itemValue ? "0" : "-1";
  const ariaChecked = checkable ? String(!!item.checked) : nothing;
  const rowRole = listbox
    ? "option"
    : item.kind === "checkbox"
      ? "menuitemcheckbox"
      : item.kind === "radio"
        ? "menuitemradio"
        : nothing;

  if (item.href && !host._isRail && !checkable) {
    return html`
      <a
        part="row"
        id=${rowId}
        data-item-value=${itemValue}
        ?data-active=${isActive}
        ?data-disabled=${!!item.disabled}
        aria-selected=${listbox ? String(isActive) : nothing}
        aria-disabled=${item.disabled ? "true" : "false"}
        role=${rowRole}
        tabindex=${tabindex}
        aria-label=${ariaLabel}
        href=${item.href}
        target=${ifDefined(item.target)}
        rel=${ifDefined(navPanelRowRel(item))}
        aria-current=${isActive ? "page" : nothing}
        @click=${(event: Event) => host._onItemActivate(event, item, index)}
      >
        ${renderRowContent(host, item)}
      </a>
    `;
  }

  const row = html`
    <button
      type="button"
      part="row"
      id=${rowId}
      data-item-value=${itemValue}
      ?data-active=${isActive}
      ?data-disabled=${!!item.disabled}
      aria-selected=${listbox ? String(isActive) : nothing}
      aria-checked=${ariaChecked}
      aria-disabled=${item.disabled ? "true" : "false"}
      role=${rowRole}
      tabindex=${tabindex}
      aria-label=${ariaLabel}
      title=${nativeHintTitle(host, hint)}
      @click=${(event: Event) => host._onItemActivate(event, item, index)}
    >
      ${renderRowContent(host, item)}
    </button>
  `;

  return wrapRailTooltip(host, hint, row);
}

function renderListEntry(
  host: NavPanelRenderHost,
  item: VuNavPanelItem,
  index: number,
  listbox: boolean,
): TemplateResult | typeof nothing {
  const row = renderRow(host, item, index, listbox);
  if (row === nothing) return nothing;
  return html`<li role="presentation">${row}</li>`;
}

function renderFlatList(
  host: NavPanelRenderHost,
  items: VuNavPanelItem[],
  listbox: boolean,
): TemplateResult {
  return html`
    <ul part="list" role="presentation">
      ${repeat(
        items,
        (item, index) =>
          isNavPanelHeader(item)
            ? `header:${item.label}:${index}`
            : host._itemValue(item, index),
        (item, index) => renderListEntry(host, item, index, listbox),
      )}
    </ul>
  `;
}

function renderGroupedList(host: NavPanelRenderHost, groups: NavPanelGroup[]): TemplateResult {
  return html`
    ${repeat(
      groups,
      (group) => group.key,
      (group, groupIndex) => {
        /* Icon rail: hide text collapse triggers and keep every icon row visible. */
        const isCollapsed = host._isRail ? false : (host.collapsedGroups[group.key] ?? false);
        const maxH = host._groupHeights[group.key] ?? 0;
        const contentId = `nav-panel-group-${groupIndex}`;
        const headingKey = `heading:${group.key}`;

        return html`
          <section part="group" data-key=${group.key}>
            ${when(
              !host._isRail,
              () => html`
                <button
                  type="button"
                  part="heading"
                  aria-controls=${contentId}
                  aria-expanded=${String(!isCollapsed)}
                  tabindex=${host._rovingKey === headingKey ? "0" : "-1"}
                  @click=${() => host.toggleGroup(group.key)}
                >
                  <span>${group.label}</span>
                  <vu-icon part="chevron" .icon=${"ion:chevron-down"}></vu-icon>
                </button>
              `,
            )}

            <div
              id=${contentId}
              part="group-content"
              aria-label="${group.label} items"
              ?data-collapsed=${isCollapsed}
              style=${styleMap(
                host._isRail
                  ? {}
                  : {
                      maxHeight: isCollapsed ? "var(--vu-space-0)" : `${maxH}px`,
                    },
              )}
            >
              ${repeat(
                group.items,
                (item, index) =>
                  isNavPanelHeader(item)
                    ? `header:${group.key}:${item.label}:${index}`
                    : host._itemValue(item, index),
                (item, index) => renderRow(host, item, index, false),
              )}
            </div>
          </section>
        `;
      },
    )}
  `;
}

/** Renders the nav panel list, groups, and optional icon-rail tooltips. */
export function renderNavPanel(host: NavPanelRenderHost): TemplateResult {
  const groups = buildNavPanelGroups(host.items);
  const flat = flattenNavPanelItems(host.items, groups);
  const listbox = !groups;
  /* Always emit both list modes so SSR/client template digests match when `items` arrive after hydrate. */
  const content = html`
    <div part="groups" ?hidden=${!groups}>${renderGroupedList(host, groups ?? [])}</div>
    <div part="flat" ?hidden=${!!groups}>${renderFlatList(host, groups ? [] : flat, listbox)}</div>
  `;
  return renderPanelShell(host, content, listbox);
}
