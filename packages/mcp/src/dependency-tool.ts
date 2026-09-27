import { getVelkinComponentDocs } from "./docs.js";
import { loadVelkinComponentsCached } from "./catalog.js";
import { withVelkinMcpMeta } from "./mcp-response-meta.js";
import { McpErrorCode, mcpToolErr } from "./mcp-tool-errors.js";

export type DependencyRequest = {
  component: string;
  direction?: "uses" | "usedBy" | "both" | null;
};

export type ComponentDependencyGraph = {
  component: string;
  tag: string;
  uses: Array<{ slug: string; tag: string; name: string; reason: string }>;
  usedBy: Array<{ slug: string; tag: string; name: string; reason: string }>;
};

/**
 * Static dependency map: which components are commonly composed together.
 * Format: "slug" -> array of slugs it uses/requires
 */
const COMPONENT_USES: Record<string, Array<{ slug: string; reason: string }>> = {
  accordion: [
    {
      slug: "accordion-item",
      reason: "Accordion requires AccordionItem children to define each section.",
    },
  ],
  "accordion-item": [
    { slug: "accordion", reason: "AccordionItem must be used inside an Accordion parent." },
  ],
  "adaptive-bar": [
    {
      slug: "adaptive-item",
      reason: "AdaptiveBar uses AdaptiveItem children for responsive overflow.",
    },
  ],
  breadcrumb: [
    { slug: "breadcrumb-item", reason: "Breadcrumb is composed of BreadcrumbItem children." },
  ],
  "button-group": [
    {
      slug: "button",
      reason: "ButtonGroup wraps multiple Button children to group related actions.",
    },
  ],
  "checkbox-group": [
    {
      slug: "checkbox",
      reason: "CheckboxGroup manages a set of Checkbox children with shared state.",
    },
  ],
  combobox: [
    { slug: "input", reason: "Combobox internally uses an Input-like field for typed search." },
    { slug: "dropdown", reason: "Combobox shows a filterable dropdown list." },
  ],
  "data-table": [
    { slug: "pagination", reason: "DataTable often pairs with Pagination for large datasets." },
    { slug: "checkbox", reason: "DataTable uses Checkbox for row selection." },
  ],
  "date-picker": [
    { slug: "date-calendar", reason: "DatePicker embeds a DateCalendar popup." },
    { slug: "date-field", reason: "DatePicker uses DateField for the text input." },
    {
      slug: "date-picker-layout",
      reason: "DatePicker uses DatePickerLayout to compose the panel structure.",
    },
  ],
  "date-calendar": [
    {
      slug: "date-month-year-view",
      reason: "DateCalendar uses DateMonthYearView for month/year header navigation.",
    },
    { slug: "date-time-view", reason: "DateCalendar may use DateTimeView for time selection." },
  ],
  dialog: [
    { slug: "overlay", reason: "Dialog uses Overlay for the backdrop layer." },
    { slug: "button", reason: "Dialog should include a Button for its close/confirm actions." },
  ],
  drawer: [{ slug: "overlay", reason: "Drawer uses Overlay for the backdrop scrim." }],
  dropdown: [{ slug: "dropdown-item", reason: "Dropdown is composed of DropdownItem children." }],
  flow: [
    { slug: "flow-node", reason: "Flow renders FlowNode components as graph nodes." },
    { slug: "flow-edge-overlay", reason: "Flow uses FlowEdgeOverlay for edge labels and actions." },
    {
      slug: "flow-toolbar",
      reason: "Flow is typically paired with FlowToolbar for zoom/pan controls.",
    },
    { slug: "flow-context-menu", reason: "Flow supports FlowContextMenu for right-click actions." },
  ],
  form: [
    { slug: "input", reason: "VuForm wraps Input components and provides validation context." },
    { slug: "button", reason: "VuForm should contain a submit Button." },
    { slug: "checkbox", reason: "VuForm can wrap Checkbox fields." },
    { slug: "select", reason: "VuForm can wrap Select fields." },
  ],
  kanban: [
    { slug: "kanban-column", reason: "Kanban is composed of KanbanColumn children." },
    { slug: "kanban-card", reason: "KanbanColumn holds KanbanCard children." },
  ],
  list: [{ slug: "listitem", reason: "List renders Listitem children." }],
  menubar: [{ slug: "dropdown", reason: "Menubar items open Dropdown menus." }],
  "notification-provider": [
    { slug: "notification", reason: "NotificationProvider renders Notification toasts." },
  ],
  "nav-panel": [
    { slug: "navbar", reason: "NavPanel typically pairs with Navbar for app-level navigation." },
  ],
  "skeleton-loader": [
    { slug: "skeleton", reason: "SkeletonLoader composes multiple Skeleton elements." },
  ],
  steps: [{ slug: "step-item", reason: "Steps renders StepItem children for each step." }],
  tab: [{ slug: "tab-item", reason: "Tab component renders TabItem children as the tab panels." }],
  "theme-provider": [
    {
      slug: "theme-switcher",
      reason: "ThemeProvider is commonly paired with ThemeSwitcher for user theme control.",
    },
  ],
  "color-picker": [
    {
      slug: "color-area",
      reason: "ColorPicker contains a ColorArea for 2D hue/saturation selection.",
    },
    { slug: "color-slider", reason: "ColorPicker contains ColorSlider for hue/alpha channels." },
    { slug: "color-swatch", reason: "ColorPicker may render ColorSwatch for preset colors." },
    {
      slug: "color-swatch-picker",
      reason: "ColorPicker may use ColorSwatchPicker for preset palette.",
    },
  ],
};

export function handleGetComponentDependencies(req: DependencyRequest) {
  try {
    const doc = getVelkinComponentDocs(req.component);
    if (!doc) {
      return mcpToolErr(McpErrorCode.UNKNOWN_COMPONENT, `Unknown component "${req.component}".`, {
        component: req.component,
      });
    }

    const direction = req.direction ?? "both";
    const allComponents = loadVelkinComponentsCached();
    const compMap = new Map(allComponents.map((c) => [c.slug, c]));

    // What does this component use?
    const uses =
      direction !== "usedBy"
        ? (COMPONENT_USES[doc.slug] ?? []).map(({ slug, reason }) => {
            const dep = compMap.get(slug);
            return dep
              ? { slug: dep.slug, tag: dep.tag, name: dep.name, reason }
              : { slug, tag: `vu-${slug}`, name: slug, reason };
          })
        : [];

    // What uses this component?
    const usedBy =
      direction !== "uses"
        ? Object.entries(COMPONENT_USES)
            .filter(([, deps]) => deps.some((d) => d.slug === doc.slug))
            .map(([parentSlug, deps]) => {
              const parent = compMap.get(parentSlug);
              const dep = deps.find((d) => d.slug === doc.slug)!;
              return parent
                ? { slug: parent.slug, tag: parent.tag, name: parent.name, reason: dep.reason }
                : {
                    slug: parentSlug,
                    tag: `vu-${parentSlug}`,
                    name: parentSlug,
                    reason: dep.reason,
                  };
            })
        : [];

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            withVelkinMcpMeta(
              {
                component: doc.slug,
                tag: doc.tag,
                name: doc.name,
                direction,
                uses,
                usedBy,
                summary: `${doc.name} uses ${uses.length} component(s) and is used by ${usedBy.length} component(s).`,
              },
              {
                truthLayer: "authoritative",
                agentMust:
                  "Import all 'uses' dependencies when building a composition. Check tier for each dependency.",
              },
            ),
            null,
            2,
          ),
        },
      ],
    };
  } catch (err) {
    return mcpToolErr(
      McpErrorCode.DEPENDENCY_FAILED,
      err instanceof Error ? err.message : String(err),
    );
  }
}
