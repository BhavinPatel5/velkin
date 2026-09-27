import { html, nothing, type TemplateResult } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { vuAnimate } from "../../internals/utils/lit-animate.js";
import type { VuBreadcrumbItem } from "../../breadcrumb-item/breadcrumb-item.js";

export type BreadcrumbOverflowRenderParams = {
  layoutAnimateHost: Element | null;
  collapsed: boolean;
  ellipsisOrder: number;
  hiddenCount: number;
  menuMode: boolean;
  menuOpen: boolean;
  expandFooterLabel: string;
  ellipsisAriaLabel: string;
  hiddenItems: VuBreadcrumbItem[];
  showExpandAction: boolean;
  ellipsisIcon: TemplateResult;
  overflowItemLabel: (item: VuBreadcrumbItem) => string;
  onEllipsisClick: () => void;
  onOverflowToggle: (event: Event) => void;
  onMenuKeydown: (event: KeyboardEvent) => void;
  onOverflowItemClick: (item: VuBreadcrumbItem) => void;
  onShowFullTrailFromMenu: () => void;
};

/** Ellipsis tile and optional overflow menu for collapsed breadcrumb trails. */
export function renderBreadcrumbOverflow(params: BreadcrumbOverflowRenderParams): TemplateResult {
  const {
    layoutAnimateHost,
    collapsed,
    ellipsisOrder,
    menuMode,
    menuOpen,
    expandFooterLabel,
    ellipsisAriaLabel,
    hiddenItems,
    showExpandAction,
    ellipsisIcon,
    overflowItemLabel,
    onEllipsisClick,
    onOverflowToggle,
    onMenuKeydown,
    onOverflowItemClick,
    onShowFullTrailFromMenu,
  } = params;

  if (!collapsed) return html``;

  return html`
    <div part="ellipsis" role="listitem" style=${`order: ${ellipsisOrder}`}>
      <span part="ellipsis-separator" aria-hidden="true"></span>
      <button
        type="button"
        part="ellipsis-button"
        aria-haspopup=${menuMode ? "menu" : nothing}
        aria-expanded=${menuMode ? String(menuOpen) : nothing}
        aria-label=${ellipsisAriaLabel}
        @click=${onEllipsisClick}
      >
        ${ellipsisIcon}
      </button>
      ${
        menuMode
          ? html`
              <div
                part="overflow-menu"
                popover="manual"
                role="menu"
                @toggle=${onOverflowToggle}
                @click=${(e: Event) => e.stopPropagation()}
                @keydown=${onMenuKeydown}
              >
                ${repeat(
                  hiddenItems,
                  (it) => it,
                  (it) => html`
                    <button
                      type="button"
                      part="overflow-item"
                      role="menuitem"
                      ${vuAnimate(layoutAnimateHost, { preset: "fade" })}
                      ?disabled=${it.disabled || !it.href}
                      @click=${() => onOverflowItemClick(it)}
                    >
                      ${overflowItemLabel(it)}
                    </button>
                  `,
                )}
                ${
                  showExpandAction && hiddenItems.length > 0
                    ? html`
                        <vu-divider part="overflow-divider" inset></vu-divider>
                        <button
                          type="button"
                          part="overflow-expand"
                          role="menuitem"
                          ${vuAnimate(layoutAnimateHost, { preset: "fade" })}
                          @click=${onShowFullTrailFromMenu}
                        >
                          ${expandFooterLabel}
                        </button>
                      `
                    : nothing
                }
              </div>
            `
          : nothing
      }
    </div>
  `;
}
