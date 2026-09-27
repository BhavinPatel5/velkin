import { html, nothing, type TemplateResult } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { when } from "lit/directives/when.js";
import { ICONS } from "../../internals/icon.js";
import { msg, str } from "../../internals/utils/localize.js";
import type { PopoverController } from "../../internals/controllers/popover-controller.js";
import type { PaginationPageToken } from "../pagination.types.js";
import type { VuPagination } from "../pagination.js";

const JUMP_INPUT_ID = "vu-pagination-jump-input";
const PICKER_MENU_ID = "vu-pagination-picker-menu";

/** Host surface for pagination shadow markup. */
export type PaginationRenderHost = Pick<
  VuPagination,
  | "totalPages"
  | "currentPage"
  | "disabledPages"
  | "loading"
  | "progress"
  | "layout"
  | "maxVisiblePages"
  | "jump"
  | "label"
  | "prevLabel"
  | "nextLabel"
  | "jumpLabel"
  | "jumpGoLabel"
> & {
  readonly _dropdownOpen: boolean;
  readonly _jumpInputValue: string;
  readonly _progressPercent: number;
  readonly _pageNumbers: number[];
  readonly _pages: PaginationPageToken[];
  readonly _prevDisabled: boolean;
  readonly _nextDisabled: boolean;
  readonly _showJump: boolean;
  _isPageDisabled(page: number): boolean;
  _onArrowClick(direction: number, event?: Event): void;
  _onPageClick(page: number, event?: Event): void;
  _onJumpInput(event: InputEvent): void;
  _onJumpKeydown(event: KeyboardEvent): void;
  _onJumpGo(event: Event): void;
  _toggleDropdown(event: Event): void;
  readonly _dropdownPop: PopoverController;
};

function navLabel(host: PaginationRenderHost): string {
  return (
    host.label.trim() ||
    String(msg("Pagination", { desc: "Accessible name for pagination navigation." }))
  );
}

function prevLabel(host: PaginationRenderHost): string {
  return (
    host.prevLabel.trim() ||
    String(msg("Previous page", { desc: "Accessible name for the previous-page control." }))
  );
}

function nextLabel(host: PaginationRenderHost): string {
  return (
    host.nextLabel.trim() ||
    String(msg("Next page", { desc: "Accessible name for the next-page control." }))
  );
}

function jumpFieldLabel(host: PaginationRenderHost): string {
  return (
    host.jumpLabel.trim() ||
    String(msg("Page", { desc: "Visible label for the jump-to-page field." }))
  );
}

function jumpGoLabel(host: PaginationRenderHost): string {
  return (
    host.jumpGoLabel.trim() ||
    String(msg("Go", { desc: "Label for the jump-to-page submit control." }))
  );
}

function pickerLabel(host: PaginationRenderHost): string {
  return String(
    msg(str`Page ${host.currentPage} of ${host.totalPages}`, {
      desc: "Accessible name for the page-picker trigger.",
    }),
  );
}

function pageLabel(page: number): string {
  return String(msg(str`Page ${page}`, { desc: "Accessible name for a page control." }));
}

function renderPageToken(host: PaginationRenderHost, page: PaginationPageToken) {
  if (page === "ellipsis") {
    return html`
      <span part="ellipsis" aria-hidden="true">
        <vu-icon .icon=${ICONS.ellipsis} aria-hidden="true"></vu-icon>
      </span>
    `;
  }

  const pageNumber = page;
  const active = host.currentPage === pageNumber;
  const disabled = host._isPageDisabled(pageNumber);
  return html`
    <button
      type="button"
      part="page"
      aria-current=${active ? "page" : nothing}
      aria-label=${pageLabel(pageNumber)}
      @click=${() => host._onPageClick(pageNumber)}
      ?disabled=${disabled}
    >
      ${pageNumber}
    </button>
  `;
}

function renderJumpField(host: PaginationRenderHost): TemplateResult {
  return html`
    <div part="jump">
      <label part="jump-label" for=${JUMP_INPUT_ID}> ${jumpFieldLabel(host)} </label>
      <input
        id=${JUMP_INPUT_ID}
        type="number"
        part="jump-input"
        min="1"
        max=${host.totalPages}
        inputmode="numeric"
        .value=${host._jumpInputValue}
        @input=${host._onJumpInput}
        @keydown=${host._onJumpKeydown}
        ?disabled=${host.loading}
      />
      <button type="button" part="jump-go" @click=${host._onJumpGo} ?disabled=${host.loading}>
        ${jumpGoLabel(host)}
      </button>
    </div>
  `;
}

function renderBarLayout(host: PaginationRenderHost): TemplateResult {
  return html`
    <div
      part="bar"
      aria-busy=${host.loading ? "true" : nothing}
      aria-disabled=${host.loading ? "true" : nothing}
    >
      <button
        type="button"
        part="prev"
        aria-label=${prevLabel(host)}
        @click=${(event: Event) => host._onArrowClick(-1, event)}
        ?disabled=${host._prevDisabled}
      >
        <vu-icon .icon=${ICONS.chevronLeft} aria-hidden="true"></vu-icon>
      </button>

      <div part="pages">
        ${repeat(
          host._pages,
          (page, index) => `${index}-${String(page)}`,
          (page) => renderPageToken(host, page),
        )}
      </div>

      <button
        type="button"
        part="next"
        aria-label=${nextLabel(host)}
        @click=${(event: Event) => host._onArrowClick(1, event)}
        ?disabled=${host._nextDisabled}
      >
        <vu-icon .icon=${ICONS.chevronRight} aria-hidden="true"></vu-icon>
      </button>

      ${when(host._showJump, () => renderJumpField(host))}
    </div>
  `;
}

function renderMenuLayout(host: PaginationRenderHost): TemplateResult {
  return html`
    <div
      part="picker"
      aria-busy=${host.loading ? "true" : nothing}
      aria-disabled=${host.loading ? "true" : nothing}
    >
      <button
        type="button"
        part="prev"
        aria-label=${prevLabel(host)}
        @click=${() => host._onArrowClick(-1)}
        ?disabled=${host._prevDisabled}
      >
        <vu-icon .icon=${ICONS.chevronLeft} aria-hidden="true"></vu-icon>
      </button>

      <button
        type="button"
        part="trigger"
        @click=${host._toggleDropdown}
        ?disabled=${host.loading}
        aria-expanded=${host._dropdownOpen ? "true" : "false"}
        aria-haspopup="listbox"
        aria-controls=${PICKER_MENU_ID}
        aria-label=${pickerLabel(host)}
      >
        ${host.currentPage}
      </button>

      <div
        part="menu"
        id=${PICKER_MENU_ID}
        popover="manual"
        role="listbox"
        aria-label=${navLabel(host)}
        @toggle=${host._dropdownPop.onToggle}
        @click=${(event: Event) => event.stopPropagation()}
        @keydown=${(event: KeyboardEvent) => event.stopPropagation()}
      >
        ${repeat(
          host._pageNumbers,
          (page) => String(page),
          (page) => {
            const active = host.currentPage === page;
            const disabled = host._isPageDisabled(page);
            return html`
              <button
                type="button"
                part="page"
                role="option"
                aria-selected=${active ? "true" : "false"}
                aria-disabled=${disabled ? "true" : nothing}
                aria-label=${pageLabel(page)}
                @click=${(event: Event) => host._onPageClick(page, event)}
                ?disabled=${disabled}
              >
                ${page}
              </button>
            `;
          },
        )}
      </div>

      <button
        type="button"
        part="next"
        aria-label=${nextLabel(host)}
        @click=${() => host._onArrowClick(1)}
        ?disabled=${host._nextDisabled}
      >
        <vu-icon .icon=${ICONS.chevronRight} aria-hidden="true"></vu-icon>
      </button>

      ${when(host._showJump, () => renderJumpField(host))}
    </div>
  `;
}

/** Full shadow tree for `<vu-pagination>`. */
export function renderPagination(host: PaginationRenderHost): TemplateResult {
  return html`
    <div part="base" role="navigation" aria-label=${navLabel(host)}>
      ${when(
        host.loading,
        () => html`
          <div part="overlay" aria-hidden="false">
            <vu-spinner part="spinner" .size=${"sm"}></vu-spinner>
          </div>
        `,
      )}

      <div part="block">
        ${host.layout === "menu" ? renderMenuLayout(host) : renderBarLayout(host)}
      </div>

      ${when(
        host.progress,
        () => html`
          <div part="progress" aria-hidden="true">
            <div part="fill" style=${`inline-size: ${host._progressPercent.toFixed(2)}%;`}></div>
          </div>
        `,
      )}
    </div>
  `;
}
