import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ContextConsumer, ContextProvider } from "@lit/context";
import {
  configContext,
  mergePresetsConfig,
  type ComponentPresetsConfig,
} from "../internals/utils/component-presets.js";
import { configProviderStyles } from "./config-provider.style.js";

export type {
  ComponentPresetKey,
  ComponentPresetsConfig,
  ComponentPropBag,
} from "./config-provider.types.js";

export {
  configContext,
  markUserSetProp,
} from "../internals/utils/component-presets.js";

/**
 * @element vu-config-provider
 *
 * @summary A config provider component for component defaults and presets.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/config-provider
 *
 * @slot - Content that receives merged component preset context.
 *
 * @property {ComponentPresetsConfig} presets - Global `defaults` and named `presets` keyed by tag (`vu-button`) or short alias (`button`).
 *
 * Hosts subscribe via `@lit/context`. Defaults apply with no extra attributes. `preset="name"` selects a named bag and is omitted from the DOM while empty.
 *
 * @csspart - None; this host is a context shell.
 */
@customElement("vu-config-provider")
export class VuConfigProvider extends LitElement {
  static override styles = configProviderStyles;

  @state()
  private _parent: ComponentPresetsConfig | null = null;

  private _presets: ComponentPresetsConfig = {};

  /** Preset bags; setter publishes context in the same turn so descendants upgrade with defaults. */
  @property({ attribute: false })
  get presets(): ComponentPresetsConfig {
    return this._presets;
  }
  set presets(value: ComponentPresetsConfig) {
    const next = value ?? {};
    const prev = this._presets;
    if (next === prev) {
      this._publishMerged();
      return;
    }
    this._presets = next;
    this._publishMerged();
    this.requestUpdate("presets", prev);
  }

  private readonly _parentConsumer = new ContextConsumer(this, {
    context: configContext,
    subscribe: true,
    callback: (value) => {
      this._parent = value ?? null;
      this._publishMerged();
    },
  });

  private readonly _provider = new ContextProvider(this, {
    context: configContext,
    initialValue: null as ComponentPresetsConfig | null,
  });

  /** Current merged config (parent ∩ local). Safe for DOM-walk consumers. */
  get mergedConfig(): ComponentPresetsConfig {
    return this._provider.value ?? mergePresetsConfig(this._parent, this._presets);
  }

  private _publishMerged(): void {
    const merged = mergePresetsConfig(this._parent, this._presets);
    this._provider.setValue(merged);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._publishMerged();
  }

  protected override willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("_parent") || changed.has("presets")) {
      this._publishMerged();
    }
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-config-provider": VuConfigProvider;
  }
}
