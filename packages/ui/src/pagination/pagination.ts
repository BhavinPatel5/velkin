import { localized } from "@lit/localize";
import { LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { PopoverController } from "../internals/controllers/popover-controller.js";
import { VuIcon } from "../icon/icon.js";
import { VuSpinner } from "../spinner/spinner.js";
import { buildPaginationPages } from "./internals/pagination-pages.js";
import {
  paginationCanActivatePage,
  paginationNextAvailablePage,
} from "./internals/pagination-navigation.js";
import { renderPagination, type PaginationRenderHost } from "./internals/pagination.render.js";
import { paginationStyles } from "./pagination.style.js";
import type {
  VuPaginationChangeDetail,
  VuPaginationLayout,
  VuPaginationSize,
  PaginationPageToken,
  VuPaginationRadius,
} from "./pagination.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuPaginationChangeDetail,
  VuPaginationLayout,
  VuPaginationSize,
  PaginationPageToken,
  VuPaginationRadius,
} from "./pagination.types.js";

/**
 * @element vu-pagination
 *
 * @summary A pagination component with page numbers and optional jump field.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/pagination
 * @dependency vu-icon
 * @dependency vu-spinner
 *
 * @uiVModel currentPage vu-change
 *
 * @csspart base - Outer wrapper.
 * @csspart overlay - Loading scrim over the controls.
 * @csspart spinner - Spinner centered in the overlay.
 * @csspart block - Interactive region dimmed while loading.
 * @csspart bar - Numbered bar layout container.
 * @csspart pages - Row of page buttons and decorative ellipsis markers.
 * @csspart ellipsis - Decorative truncated-range marker (`aria-hidden`).
 * @csspart prev - Previous-page control.
 * @csspart next - Next-page control.
 * @csspart page - Numbered page control.
 * @csspart jump - Jump-to-page field group.
 * @csspart jump-label - Visible label for the jump field.
 * @csspart jump-input - Jump-to-page number input.
 * @csspart jump-go - Jump submit control.
 * @csspart picker - Menu layout container.
 * @csspart trigger - Current-page trigger for the picker menu.
 * @csspart menu - Popover menu listing all pages.
 * @csspart progress - Optional progress track under the controls.
 * @csspart fill - Filled portion of the progress track.
 *
 * @cssproperty --pg-control-size - Page control inline/block size.
 * @cssproperty --pg-picker-width - Menu trigger and popover width.
 * @cssproperty --pg-picker-max-height - Menu popover max block size.
 *
 * @property {number} totalPages - Total number of pages.
 * @property {number} currentPage - Selected page (1-based).
 * @property {number[]} disabledPages - Page numbers that cannot be selected.
 * @property {boolean} loading - Blocks interaction and shows the overlay spinner.
 * @property {boolean} progress - Renders a progress track under the controls.
 * @property {VuPaginationLayout} layout - `bar` numbered buttons or `menu` page picker.
 * @property {boolean} jump - Shows the jump-to-page field when `true` and `totalPages > 1`.
 * @property {VuPaginationSize} size - Control density (`sm`, `md`, `lg`).
 * @property {VuPaginationRadius} radius - Corner preset (`none`/`sm`/`md`/`lg`/`full`). Default: `md`.
 * @property {number} maxVisiblePages - Max numbered buttons before ellipsis collapse.
 * @property {string} label - Accessible name for the navigation region.
 * @property {string} prevLabel - Accessible name for the previous-page control.
 * @property {string} nextLabel - Accessible name for the next-page control.
 * @property {string} jumpLabel - Visible label for the jump field (`Page` by default).
 * @property {string} jumpGoLabel - Label for the jump submit control (`Go` by default).
 *
 * @method nextPage - Moves to the next enabled page.
 * @method prevPage - Moves to the previous enabled page.
 * @method setPage - Moves to a specific enabled page.
 *
 * @fires {CustomEvent<VuPaginationChangeDetail>} vu-change - When `currentPage` changes.
 */
@localized()
@customElement("vu-pagination")
@withComponentPresets
export class VuPagination extends LitElement {
  static override styles = paginationStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
    "vu-spinner": VuSpinner,
  };

  /** Total number of pages. */
  @property({ type: Number }) totalPages = 5;
  /** Selected page (1-based). */
  @property({ type: Number }) currentPage = 1;
  /** Page numbers that cannot be selected. */
  @property({ type: Array, attribute: false }) disabledPages: number[] = [];
  /** Blocks interaction and shows the overlay spinner. */
  @property({ type: Boolean, reflect: true }) loading = false;
  /** Renders a progress track under the controls. */
  @property({ type: Boolean }) progress = false;
  /** `bar` numbered buttons or `menu` page picker. */
  @property({ type: String, reflect: true }) layout: VuPaginationLayout = "bar";
  /** Control density (`sm`, `md`, `lg`). */
  @property({ type: String, reflect: true }) size: VuPaginationSize = "md";

  /** Explicit corner preset; `full` is capsule ends, `none` is square. */
  @property({ type: String, reflect: true })
  radius: VuPaginationRadius = "md";
  /** Max numbered buttons before ellipsis collapse. */
  @property({ type: Number }) maxVisiblePages = 5;
  /** Shows the jump-to-page field when `true` and `totalPages > 1`. */
  @property({ type: Boolean }) jump = false;
  /** Accessible name for the navigation region. */
  @property({ type: String }) label = "";
  /** Accessible name for the previous-page control. */
  @property({ type: String }) prevLabel = "";
  /** Accessible name for the next-page control. */
  @property({ type: String }) nextLabel = "";
  /** Visible label for the jump field (`Page` by default). */
  @property({ type: String }) jumpLabel = "";
  /** Label for the jump submit control (`Go` by default). */
  @property({ type: String }) jumpGoLabel = "";

  @state() private _jumpInputValue = "";
  @state() private _dropdownOpen = false;

  @query('[part="trigger"]')
  private _pickerTrigger?: HTMLElement;

  @query('[part="menu"]')
  private _pickerMenu?: HTMLElement;

  private readonly _dropdownPop = new PopoverController(this, {
    getAnchor: () => this._pickerTrigger ?? null,
    getPopover: () => this._pickerMenu ?? null,
    cssVarLeft: "--pg-picker-left",
    cssVarTop: "--pg-picker-top",
    cssVarWidth: "--pg-picker-width",
    placement: "bottom",
    align: "center",
    matchAnchorWidth: true,
    maxWidthToViewport: true,
    maxWidthMode: "cap",
    restoreFocusOnClose: true,
    closeOnEscape: true,
    closeOnOutside: true,
    onOpenChange: (open) => {
      this._dropdownOpen = open;
    },
  });

  private get _renderHost(): PaginationRenderHost {
    return this as unknown as PaginationRenderHost;
  }

  private get _progressPercent(): number {
    if (this.totalPages <= 0) return 0;
    return (this.currentPage / this.totalPages) * 100;
  }

  private get _pageNumbers(): number[] {
    return Array.from({ length: Math.max(0, this.totalPages) }, (_, index) => index + 1);
  }

  private get _pages(): PaginationPageToken[] {
    return buildPaginationPages(this.totalPages, this.currentPage, this.maxVisiblePages);
  }

  private get _prevDisabled(): boolean {
    return (
      paginationNextAvailablePage(this.currentPage, this.totalPages, this.disabledPages, -1) ===
        this.currentPage || this.loading
    );
  }

  private get _nextDisabled(): boolean {
    return (
      paginationNextAvailablePage(this.currentPage, this.totalPages, this.disabledPages, 1) ===
        this.currentPage || this.loading
    );
  }

  private get _showJump(): boolean {
    return this.jump && this.totalPages > 1;
  }

  override firstUpdated(): void {
    this._dropdownPop.refreshTargets();
  }

  /** Moves to the next enabled page. */
  nextPage(): void {
    this._goToPage(
      paginationNextAvailablePage(this.currentPage, this.totalPages, this.disabledPages, 1),
    );
  }

  /** Moves to the previous enabled page. */
  prevPage(): void {
    this._goToPage(
      paginationNextAvailablePage(this.currentPage, this.totalPages, this.disabledPages, -1),
    );
  }

  /** Moves to a specific enabled page. */
  setPage(page: number): void {
    this._goToPage(page);
  }

  _isPageDisabled(page: number): boolean {
    if (this.loading) return true;
    return this.disabledPages.includes(page);
  }

  _onArrowClick(direction: number, event?: Event): void {
    if (this.loading) return;
    const nextPage = paginationNextAvailablePage(
      this.currentPage,
      this.totalPages,
      this.disabledPages,
      direction,
    );
    this._goToPage(nextPage, event);
  }

  _onPageClick(page: number, event?: Event): void {
    this._goToPage(page, event);
  }

  _onJumpInput(event: InputEvent): void {
    this._jumpInputValue = (event.target as HTMLInputElement).value;
  }

  _onJumpKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      event.preventDefault();
      this._commitJump();
    }
  }

  _onJumpGo(event: Event): void {
    event.preventDefault();
    this._commitJump();
  }

  _toggleDropdown(event: Event): void {
    if (this.loading) return;
    event.stopPropagation();
    this._dropdownPop.refreshTargets();
    if (this._dropdownPop.open) this._dropdownPop.closePopover("api");
    else this._dropdownPop.openPopover();
    requestAnimationFrame(() => this._dropdownPop.position?.());
  }

  private _goToPage(page: number, event?: Event): void {
    if (this.loading) return;
    event?.stopPropagation();
    if (!paginationCanActivatePage(page, this.totalPages, this.disabledPages)) return;
    if (this.currentPage === page) return;

    this.currentPage = page;
    this._dropdownPop.closePopover("api");
    this._resetJump();
    this._emitChange();
  }

  private _commitJump(): void {
    const page = Number(this._jumpInputValue);
    if (paginationCanActivatePage(page, this.totalPages, this.disabledPages)) {
      this._goToPage(page);
    }
    this._resetJump();
  }

  private _resetJump(): void {
    this._jumpInputValue = "";
  }

  private _emitChange(): void {
    this.dispatchEvent(
      new CustomEvent<VuPaginationChangeDetail>("vu-change", {
        detail: { currentPage: this.currentPage },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    return renderPagination(this._renderHost);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-pagination": VuPagination;
  }
}
