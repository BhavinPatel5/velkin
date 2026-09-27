import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from "lit";
import { localized } from "@lit/localize";
import { str } from "@lit/localize";
import { customElement, property, queryAssignedElements, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { VuIcon } from "../icon/icon.js";
import { VuStepItem } from "../step-item/step-item.js";
import { ICONS } from "../internals/icon.js";
import { isClient } from "../internals/utils/env.js";
import { msg } from "../internals/utils/localize.js";
import { onStepsKeydown } from "./internals/steps-keyboard.js";
import {
  clampStep,
  normalizeStepItems,
  resolveStepStatus,
  stepCanJump,
  stepIsCompleted,
  stepNextIndex,
  stepPrevIndex,
} from "./internals/steps-nav.js";
import { renderStepLabels, renderStepNode } from "./internals/steps-node.js";
import {
  reparentHorizontalStepPanels,
  restorePanelsToStepItems,
} from "./internals/steps-panel.js";
import {
  resolveStepSlotMembers,
  SLOT_MEMBER_SELECTOR,
  stepsFromSlot,
  stepsUsesSlotItems,
  syncStepSlotMembers,
} from "./internals/steps-slot.js";
import { motionDurationMs } from "../internals/utils/motion.js";
import { stepsStyles } from "./steps.style.js";
import type {
  VuStepNormalizedItem,
  VuStepStateItem,
  VuStepsChangeDetail,
  VuStepsLabelPlacement,
  VuStepsLayout,
  VuStepsSize,
  VuStepsVariant,
} from "./steps.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuStepNormalizedItem,
  VuStepStateItem,
  VuStepsChangeDetail,
  VuStepsLabelPlacement,
  VuStepsLayout,
  VuStepsSize,
  VuStepsVariant,
  VuStepStatus,
} from "./steps.types.js";

/**
 * @element vu-steps
 *
 * @summary A steps component with horizontal or vertical multi-step navigation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/steps
 * @dependency vu-icon
 * @dependency vu-step-item
 *
 * @uiVModel currentStep vu-change detail=step
 *
 * @slot before - Content before the step navigator.
 * @slot after - Content after the step navigator.
 * @slot - `<vu-step-item>` steps; when assigned, replaces the `steps` prop.
 *
 * @csspart steps - Horizontal step navigator row.
 * @csspart panels - Panel stack container.
 * @csspart panel - Individual step panel.
 * @csspart base - Step header button (prop mode).
 * @csspart node - Circular step indicator (prop mode).
 * @csspart labels - Label stack (prop mode).
 *
 * @cssproperty --steps-node-size - Diameter of the circular step indicator.
 * @cssproperty --steps-anim-ms - Transition duration for connectors and panels.
 * @cssproperty --steps-anim-ease - Transition easing for connectors and panels.
 *
 * @property {VuStepStateItem[]} steps - Step list when the default slot has no `<vu-step-item>` children.
 * @property {number} currentStep - Active step index (1-based).
 * @property {number} defaultCurrentStep - Initial / reset step for `reset()`.
 * @property {number} lastCompletedStep - Furthest step the user may advance to when `allowStepJump` is false; `0` derives from `currentStep`.
 * @property {VuStepsLayout} layout - `horizontal` (default) or `vertical`.
 * @property {VuStepsLabelPlacement} labelPlacement - `inline` (default) or `below` the node.
 * @property {VuStepsSize} size - `sm`, `md` (default), or `lg`.
 * @property {VuStepsVariant} variant - `default`, `dots`, or `progress`.
 * @property {boolean} allowStepJump - When false, only adjacent / completed steps are reachable.
 * @property {boolean} hideNumbers - Show bullets instead of numbers when no icons are set.
 * @property {boolean} showLabels - Show step labels beside indicators. Default: true.
 * @property {boolean} compact - Tighter spacing between steps.
 * @property {boolean} readonly - Progress display only; steps are not interactive.
 * @property {boolean} expandAll - Keep every vertical step panel open (docs / overview).
 * @property {string} label - Accessible name for the step navigator.
 * @property {number[] | null} completedSteps - Explicit completed indices; overrides auto completion.
 * @property {string} stepIcon - Default inactive icon for all steps.
 * @property {string} checkedIcon - Default completed icon for all steps.
 * @property {string} errorIcon - Default error icon for failed steps.
 *
 * @fires {CustomEvent<VuStepsChangeDetail>} vu-change - User-driven step changes; call `detail.cancel()` to block.
 * @method previous - Moves to the previous enabled step.
 * @method next - Moves to the next enabled step.
 * @method prevStep - Alias for `previous()`.
 * @method nextStep - Alias for `next()`.
 * @method goToStep - Navigates to a target step when allowed.
 * @method getCurrentStep - Returns the current 1-based step index.
 * @method focusStep - Focuses the header for the current step.
 * @method reset - Restores `currentStep` from `defaultCurrentStep`.
 */
@localized()
@customElement("vu-steps")
@withComponentPresets
export class VuSteps extends LitElement {
  static override styles = stepsStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
    "vu-step-item": VuStepItem,
  };

  /** Step list when no `<vu-step-item>` children are assigned. */
  @property({ type: Array, attribute: false })
  steps: VuStepStateItem[] = [];

  /** Active step index (1-based). */
  @property({ type: Number, reflect: true })
  currentStep = 1;

  /** Initial / reset step index. */
  @property({ type: Number, reflect: true })
  defaultCurrentStep = 1;

  /** Furthest completable step when linear; `0` auto-derives. */
  @property({ type: Number, reflect: true })
  lastCompletedStep = 0;

  /** `horizontal` row (default) or `vertical` stack. */
  @property({ type: String, reflect: true })
  layout: VuStepsLayout = "horizontal";

  /** `inline` (default) or `below` the step node. */
  @property({ type: String, reflect: true })
  labelPlacement: VuStepsLabelPlacement = "inline";

  /** `sm`, `md` (default), or `lg`. */
  @property({ type: String, reflect: true })
  size: VuStepsSize = "md";

  /** `default`, `dots`, or `progress`. */
  @property({ type: String, reflect: true })
  variant: VuStepsVariant = "default";

  /** When false, only adjacent / completed steps are reachable. */
  @property({ type: Boolean, reflect: true })
  allowStepJump = true;

  /** Show bullets instead of numbers when no icons are set. */
  @property({ type: Boolean, reflect: true })
  hideNumbers = false;

  /** Show step labels beside indicators. */
  @property({ type: Boolean, reflect: true })
  showLabels = true;

  /** Tighter spacing between steps. */
  @property({ type: Boolean, reflect: true })
  compact = false;

  /** Progress display only — steps are not interactive. */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /** Keep every vertical step panel open at once. */
  @property({ type: Boolean, reflect: true })
  expandAll = false;

  /** Accessible name for the step navigator. */
  @property({ type: String }) label = "";

  /** Explicit completed indices; null means steps before `currentStep` count as completed. */
  @property({ type: Array, attribute: false })
  completedSteps: number[] | null = null;

  /** Default inactive icon for all steps. */
  @property({ type: String })
  stepIcon = "";

  /** Default completed icon for all steps. */
  @property({ type: String })
  checkedIcon = "";

  /** Default error icon for failed steps. */
  @property({ type: String })
  errorIcon = "";

  @state() private _itemsCache: VuStepNormalizedItem[] = [];

  @state() private _panelDir: "fwd" | "back" = "fwd";

  @state() private _leavingStep = 0;

  @queryAssignedElements({ flatten: true, selector: SLOT_MEMBER_SELECTOR })
  private _slotMembers!: VuStepItem[];

  /** True when slotted `<vu-step-item>` children drive the step list. */
  get usesSlotItems(): boolean {
    return stepsUsesSlotItems(this, this._slotMembers ?? []);
  }

  /** Assigned or pending light-DOM slot members. */
  get slotMembers(): VuStepItem[] {
    return resolveStepSlotMembers(this, this._slotMembers ?? []);
  }

  get items(): VuStepNormalizedItem[] {
    return this._itemsCache;
  }

  /** Active 1-based step index. */
  get activeStep(): number {
    return this.currentStep;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._itemsCache = this.#resolveItems();
    this.currentStep = clampStep(this.currentStep, this._itemsCache.length);
    this.addEventListener("click", this.#onTriggerClick, { capture: true });
    this.addEventListener("keydown", this.#onTriggerKey, { capture: true });
  }

  override disconnectedCallback(): void {
    this.removeEventListener("click", this.#onTriggerClick, { capture: true });
    this.removeEventListener("keydown", this.#onTriggerKey, { capture: true });
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues): void {
    this._itemsCache = this.#resolveItems();
    const count = this._itemsCache.length;
    if (count === 0) return;

    if (changed.has("currentStep") || changed.has("steps") || changed.has("_slotMembers")) {
      this.currentStep = clampStep(this.currentStep, count);
    }

    if (changed.has("layout") && changed.get("layout") === "horizontal" && this.layout === "vertical") {
      restorePanelsToStepItems(this, this.slotMembers);
    }

    if (this.usesSlotItems) {
      this.#syncSlotMembers();
    }
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (
      changed.has("currentStep")
      && typeof changed.get("currentStep") === "number"
      && changed.get("currentStep") !== this.currentStep
    ) {
      const previous = changed.get("currentStep") as number;
      this.#applyPanelDirection(previous, this.currentStep);
    }

    if (
      this.usesSlotItems
      && this.layout === "horizontal"
      && (changed.has("currentStep")
        || changed.has("layout")
        || changed.has("_slotMembers")
        || changed.has("steps"))
    ) {
      reparentHorizontalStepPanels(this, this.slotMembers);
    }
  }

  #resolveItems(): VuStepNormalizedItem[] {
    return this.usesSlotItems
      ? stepsFromSlot(this.slotMembers)
      : normalizeStepItems(this.steps);
  }

  #syncSlotMembers(): void {
    syncStepSlotMembers(this.slotMembers, {
      currentStep: this.currentStep,
      completedSteps: this.completedSteps,
      lastCompletedStep: this.lastCompletedStep,
      layout: this.layout,
      hideNumbers: this.hideNumbers,
      showLabels: this.showLabels,
      labelPlacement: this.labelPlacement,
      readonly: this.readonly,
      expandAll: this.expandAll,
      size: this.size,
      variant: this.variant,
      stepIcon: this.stepIcon || undefined,
      checkedIcon: this.checkedIcon || undefined,
      errorIcon: this.errorIcon.trim() || ICONS.stepError,
      items: this.items,
    });
  }

  #onDefaultSlotChange = (): void => {
    void this.#onDefaultSlotChangeAsync();
  };

  async #onDefaultSlotChangeAsync(): Promise<void> {
    this._itemsCache = stepsFromSlot(this.slotMembers);
    this.currentStep = clampStep(this.currentStep, this._itemsCache.length);
    this.#syncSlotMembers();
    if (this.layout === "horizontal") {
      reparentHorizontalStepPanels(this, this.slotMembers);
    }
    await this.updateComplete;
  }

  #onTriggerClick = (event: MouseEvent): void => {
    const el = this.#findNavTrigger(event.composedPath());
    if (!el) return;
    event.preventDefault();
    this.#activateNavTrigger(el);
  };

  #onTriggerKey = (event: KeyboardEvent): void => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const el = this.#findNavTrigger(event.composedPath());
    if (!el) return;
    event.preventDefault();
    this.#activateNavTrigger(el);
  };

  #findNavTrigger(path: EventTarget[]): HTMLElement | null {
    for (const target of path) {
      if (!(target instanceof HTMLElement)) continue;
      const marker = target.getAttribute("data-vu-steps") || target.slot;
      if (marker === "back" || marker === "next") return target;
    }
    return null;
  }

  #activateNavTrigger(el: HTMLElement): void {
    const marker = el.getAttribute("data-vu-steps") || el.slot;
    if (marker === "back") this.previous();
    else if (marker === "next") this.next();
  }

  #stepStatus(index1: number, item: VuStepNormalizedItem) {
    return resolveStepStatus(
      index1,
      this.currentStep,
      item,
      this.completedSteps,
      this.lastCompletedStep,
    );
  }

  #isCompleted(index1: number): boolean {
    return stepIsCompleted(
      index1,
      this.currentStep,
      this.completedSteps,
      this.lastCompletedStep,
    );
  }

  #onWrapClick = (event: MouseEvent): void => {
    if (this.readonly) return;

    const dot = (event.target as HTMLElement).closest?.(".dot-btn") as
      | HTMLButtonElement
      | null;
    if (dot?.id) {
      const index1 = Number.parseInt(dot.id.replace("steps-dot-", ""), 10);
      if (index1 > 0) this.#onStepClick(index1 - 1);
      return;
    }

    if (this.usesSlotItems) {
      const item = event
        .composedPath()
        .find((node): node is VuStepItem => node instanceof VuStepItem);
      if (!item) return;
      const index0 = this.slotMembers.indexOf(item);
      if (index0 < 0) return;
      this.#onStepClick(index0);
      return;
    }

    const button = (event.target as HTMLElement).closest?.(".step-btn") as
      | HTMLButtonElement
      | null;
    if (!button?.id) return;
    const index1 = Number.parseInt(button.id.replace("steps-trigger-", ""), 10);
    if (index1 < 1) return;
    this.#onStepClick(index1 - 1);
  };

  #onKeydown = (event: KeyboardEvent): void => {
    onStepsKeydown(this, event);
  };

  setCurrentStep(next: number, focus = false): void {
    const count = this.items.length;
    if (!count || this.readonly) return;
    const clamped = clampStep(next, count);
    const item = this.items[clamped - 1];
    if (!item || item.disabled) return;
    if (!stepCanJump(
      clamped,
      this.currentStep,
      this.allowStepJump,
      this.lastCompletedStep,
      count,
    )) return;
    if (clamped === this.currentStep) return;

    const previous = this.currentStep;
    let cancelled = false;
    const detail: VuStepsChangeDetail = {
      step: clamped,
      previous,
      cancel: () => {
        cancelled = true;
      },
    };

    const event = new CustomEvent<VuStepsChangeDetail>("vu-change", {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(event);

    if (cancelled || event.defaultPrevented) return;

    if (focus) this.focusStep(clamped);
    this.currentStep = clamped;
  }

  #onStepClick(index0: number): void {
    this.setCurrentStep(index0 + 1);
  }

  /** Restores `currentStep` from `defaultCurrentStep`. */
  reset(): void {
    const next = clampStep(this.defaultCurrentStep, this.items.length);
    this.currentStep = next;
  }

  /** Moves to the previous enabled step. */
  previous(): void {
    const idx = stepPrevIndex(this.items, this.currentStep, this.allowStepJump);
    if (idx && stepCanJump(
      idx,
      this.currentStep,
      this.allowStepJump,
      this.lastCompletedStep,
      this.items.length,
    )) {
      this.setCurrentStep(idx);
    }
  }

  /** Moves to the next enabled step. */
  next(): void {
    const idx = stepNextIndex(
      this.items,
      this.currentStep,
      this.allowStepJump,
      this.lastCompletedStep,
    );
    if (idx && stepCanJump(
      idx,
      this.currentStep,
      this.allowStepJump,
      this.lastCompletedStep,
      this.items.length,
    )) {
      this.setCurrentStep(idx);
    }
  }

  prevStep(): void {
    this.previous();
  }

  nextStep(): void {
    this.next();
  }

  goToStep(step: number): boolean {
    const target = clampStep(step, this.items.length);
    if (!stepCanJump(
      target,
      this.currentStep,
      this.allowStepJump,
      this.lastCompletedStep,
      this.items.length,
    )) return false;
    this.setCurrentStep(target, true);
    return true;
  }

  getCurrentStep(): number {
    return this.currentStep;
  }

  focusStep(step = this.currentStep): void {
    if (this.variant === "dots") {
      this.renderRoot
        ?.querySelector<HTMLButtonElement>(`#steps-dot-${step}`)
        ?.focus();
      return;
    }
    if (this.usesSlotItems && this.variant === "default") {
      this.slotMembers[step - 1]?.focusStep();
      return;
    }
    this.renderRoot
      ?.querySelector<HTMLButtonElement>(`#steps-trigger-${step}`)
      ?.focus();
  }

  #applyPanelDirection(prev: number, next: number): void {
    if (this.layout !== "horizontal" || !this.usesSlotItems) return;

    this._panelDir = next > prev ? "fwd" : "back";
    this._leavingStep = prev;
    const duration = motionDurationMs(280);
    if (!isClient()) return;
    window.setTimeout(() => {
      this._leavingStep = 0;
    }, duration || 260);
  }

  #iconTag = (icon: string) => html`<vu-icon .icon=${icon} aria-hidden="true"></vu-icon>`;

  #stepLabel(index1: number, label: string): string {
    return label.trim() || msg(str`Step ${index1}`, {
      desc: "Fallback label for a step without a custom title.",
    });
  }

  #optionalLabel = () => msg("Optional", {
    desc: "Hint that a step may be skipped.",
  });

  #stepOfLabel(current: number, count: number) {
    return msg(str`Step ${current} of ${count}`, {
      desc: "Progress caption for dots and progress variants.",
    });
  }

  #renderStepButton(index0: number, options?: { withPanel?: boolean }): TemplateResult {
    const index1 = index0 + 1;
    const item = this.items[index0];
    const status = this.#stepStatus(index1, item);
    const isCurrent = this.currentStep === index1;
    const label = this.#stepLabel(index1, item.label);
    const withPanel = options?.withPanel ?? false;
    const panelId = withPanel ? `panel-${index1}-content` : undefined;
    const headerId = withPanel ? `step-${index1}-header` : undefined;
    const below = this.labelPlacement === "below";
    const errorIcon = this.errorIcon.trim() || ICONS.stepError;

    const node = renderStepNode({
      index1,
      status,
      hideNumbers: this.hideNumbers,
      icon: item.icon,
      checkedIcon: item.checkedIcon,
      errorIcon,
      stepIconDefault: this.stepIcon || undefined,
      checkedIconDefault: this.checkedIcon || undefined,
      iconTag: this.#iconTag,
    });

    const labels = this.showLabels
      ? renderStepLabels(label, {
        subtitle: item.subtitle,
        optional: item.optional,
        optionalLabel: this.#optionalLabel(),
        labelPlacement: this.labelPlacement,
      })
      : null;

    return html`<button
      class=${classMap({ "step-btn": true, "step-btn-below": below })}
      part="base"
      type="button"
      id=${`steps-trigger-${index1}`}
      aria-current=${isCurrent ? "step" : "false"}
      aria-disabled=${item.disabled || this.readonly ? "true" : "false"}
      aria-expanded=${withPanel ? String(isCurrent) : nothing}
      aria-controls=${panelId ?? nothing}
      tabindex=${item.disabled || this.readonly ? "-1" : isCurrent ? "0" : "-1"}
    >
      ${node}${labels}
    </button>`;
  }

  #renderPropStep(index0: number): TemplateResult[] {
    const index1 = index0 + 1;
    const btn = this.#renderStepButton(index0);
    const showConnector = index0 < this.items.length - 1;
    const connectorActive =
      this.#isCompleted(index1)
      && (this.#isCompleted(index1 + 1) || this.currentStep > index1);

    return [
      btn,
      when(
        showConnector,
        () => html`<div
          class=${classMap({ connector: true, active: connectorActive })}
          aria-hidden="true"
        ></div>`,
      ),
    ];
  }

  #renderVerticalPropItem(index0: number): TemplateResult {
    const index1 = index0 + 1;
    const completed = this.#isCompleted(index1);

    return html`
      <div class=${classMap({ "v-item": true, completed })}>
        <div class="v-header">
          ${this.#renderStepButton(index0)}
        </div>
      </div>
    `;
  }

  #renderDotsNav(): TemplateResult {
    const count = this.items.length;
    return html`
      <div class="dots-caption" aria-live="polite">
        ${this.#stepOfLabel(this.currentStep, count)}
      </div>
      <div class="dots-nav" part="steps">
        ${this.items.map((item, i) => {
          const index1 = i + 1;
          const isCurrent = index1 === this.currentStep;
          const stepLabel = this.#stepLabel(index1, item.label);
          return html`<button
            class="dot-btn"
            type="button"
            part="base"
            id=${`steps-dot-${index1}`}
            aria-current=${isCurrent ? "step" : "false"}
            aria-label=${stepLabel}
            aria-disabled=${item.disabled || this.readonly ? "true" : "false"}
            ?disabled=${item.disabled || this.readonly}
          ></button>`;
        })}
      </div>
    `;
  }

  #renderProgressNav(): TemplateResult {
    const count = this.items.length;
    const percent = count <= 1
      ? 100
      : ((this.currentStep - 1) / (count - 1)) * 100;
    const active = this.items[this.currentStep - 1];
    const activeLabel = active ? this.#stepLabel(this.currentStep, active.label) : "";

    return html`
      <div class="progress-nav" part="steps">
        <div class="progress-track" aria-hidden="true">
          <div class="progress-fill" style=${styleMap({ width: `${percent}%` })}></div>
        </div>
        <div class="progress-caption" aria-live="polite">
          ${this.#stepOfLabel(this.currentStep, count)}${activeLabel ? ` — ${activeLabel}` : ""}
        </div>
      </div>
    `;
  }

  #renderDefaultNav(slotMode: boolean): TemplateResult {
    return html`
      <div class="h-steps" part="steps">
        ${slotMode ? [] : this.items.flatMap((_, i) => this.#renderPropStep(i))}
        <slot @slotchange=${this.#onDefaultSlotChange} ?hidden=${this.hasUpdated && !slotMode}></slot>
      </div>
    `;
  }

  #renderNav(slotMode: boolean): TemplateResult {
    if (this.variant === "dots") return this.#renderDotsNav();
    if (this.variant === "progress") return this.#renderProgressNav();
    return this.#renderDefaultNav(slotMode);
  }

  #renderPanels(count: number): TemplateResult {
    return html`
      <div
        class=${classMap({
          panels: true,
          "panels--fwd": this._panelDir === "fwd",
          "panels--back": this._panelDir === "back",
        })}
        part="panels"
      >
        ${Array.from({ length: count }, (_, i) => {
          const index = i + 1;
          const active = index === this.currentStep;
          const leaving = index === this._leavingStep;
          return html`
            <div
              id=${`steps-panel-${index}`}
              class=${classMap({
                panel: true,
                "is-active": active,
                "is-leaving": leaving,
              })}
              part="panel"
              ?inert=${!active}
            >
              <div class="panel-content"></div>
            </div>
          `;
        })}
      </div>
    `;
  }

  #showHorizontalPanels(slotMode: boolean): boolean {
    return slotMode && this.layout === "horizontal";
  }

  override render() {
    const count = this.items.length;
    const slotMode = this.usesSlotItems;
    const navLabel = this.label.trim() || msg("Progress", {
      id: "nu.steps.navLabel",
      desc: "Accessible name for the step navigator.",
    });

    if (this.layout === "vertical") {
      return html`
        <slot name="before"></slot>
        <nav class="steps-nav" aria-label=${navLabel} ?hidden=${!count && !slotMode}>
          <div class="v-list" @keydown=${this.#onKeydown} @click=${this.#onWrapClick}>
            ${this.variant === "default"
              ? html`
                  ${slotMode ? [] : this.items.map((_, i) => this.#renderVerticalPropItem(i))}
                  <slot @slotchange=${this.#onDefaultSlotChange} ?hidden=${this.hasUpdated && !slotMode}></slot>
                `
              : this.#renderNav(false)}
          </div>
        </nav>
        <slot name="after"></slot>
      `;
    }

    return html`
      <slot name="before"></slot>
      <nav class="steps-nav" aria-label=${navLabel} ?hidden=${!count && !slotMode}>
        <div class="h-wrap" @keydown=${this.#onKeydown} @click=${this.#onWrapClick}>
          ${this.#renderNav(slotMode)}
        </div>
      </nav>
      <div class="panels-host" ?hidden=${!this.#showHorizontalPanels(slotMode)}>
        ${this.#renderPanels(count)}
      </div>
      <slot name="after"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-steps": VuSteps;
  }
}
