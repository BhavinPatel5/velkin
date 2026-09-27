import { withVelkinMcpMeta } from "./mcp-response-meta.js";
import { McpErrorCode, mcpToolErr } from "./mcp-tool-errors.js";
import { getVelkinComponentDocs } from "./docs.js";

export type A11yGuideRequest = {
  component: string;
};

export type A11yGuide = {
  component: string;
  tag: string;
  role?: string;
  ariaRequired: string[];
  ariaOptional: string[];
  keyboardPatterns: string[];
  focusNotes: string;
  wcag: string[];
  tips: string[];
};

/** Static a11y knowledge base keyed by component slug */
const A11Y_GUIDES: Record<string, Omit<A11yGuide, "component" | "tag">> = {
  button: {
    role: "button",
    ariaRequired: [],
    ariaOptional: [
      "aria-label",
      "aria-describedby",
      "aria-pressed",
      "aria-expanded",
      "aria-controls",
    ],
    keyboardPatterns: ["Enter/Space → activate", "Tab → focus next", "Shift+Tab → focus previous"],
    focusNotes:
      "Receives focus by default. Disabled buttons should use aria-disabled rather than the HTML disabled attribute to remain in focus order.",
    wcag: ["WCAG 2.5.3 Label in Name", "WCAG 4.1.2 Name, Role, Value"],
    tips: [
      "Use aria-label when button text is not descriptive (e.g. icon-only buttons).",
      "Never nest interactive elements inside a button.",
      "Use variant='ghost' or variant='outline' for secondary actions to maintain visual hierarchy.",
    ],
  },
  input: {
    role: "textbox",
    ariaRequired: ["aria-label or label prop"],
    ariaOptional: ["aria-describedby", "aria-invalid", "aria-required", "aria-autocomplete"],
    keyboardPatterns: ["Type → input value", "Tab → move focus", "Enter → submit (if in form)"],
    focusNotes:
      "Always provide a visible label. Use the label prop or an associated <label> element. Avoid placeholder-only labeling.",
    wcag: [
      "WCAG 1.3.1 Info and Relationships",
      "WCAG 3.3.1 Error Identification",
      "WCAG 3.3.2 Labels or Instructions",
    ],
    tips: [
      "Use aria-invalid='true' + aria-describedby pointing to error message on validation failure.",
      "Pair with VuForm for integrated validation feedback.",
      "The label prop renders a visible label — never skip it.",
    ],
  },
  dialog: {
    role: "dialog",
    ariaRequired: ["aria-labelledby (pointing to dialog title)", "aria-modal='true'"],
    ariaOptional: ["aria-describedby"],
    keyboardPatterns: [
      "Escape → close dialog",
      "Tab → cycle through focusable elements within dialog (focus trap)",
      "Shift+Tab → reverse cycle",
    ],
    focusNotes:
      "Focus must be trapped inside the dialog when open. Focus should move to the dialog heading or first focusable element on open, and return to the trigger element on close. VuDialog handles this automatically.",
    wcag: [
      "WCAG 1.3.1 Info and Relationships",
      "WCAG 2.1.2 No Keyboard Trap (escape must work)",
      "WCAG 4.1.2 Name, Role, Value",
    ],
    tips: [
      "Always include a visible title in the dialog heading slot.",
      "Provide an explicit close button — don't rely only on Escape.",
      "For confirmation dialogs, put the destructive action last in tab order.",
    ],
  },
  dropdown: {
    role: "listbox (when open)",
    ariaRequired: ["aria-label or visible trigger label"],
    ariaOptional: ["aria-expanded", "aria-controls", "aria-haspopup"],
    keyboardPatterns: [
      "Enter/Space → open dropdown",
      "Arrow Down/Up → navigate options",
      "Enter → select option",
      "Escape → close",
      "Home/End → first/last option",
    ],
    focusNotes:
      "Focus stays on the trigger button until opened. When open, focus moves to the list. On selection or Escape, focus returns to trigger.",
    wcag: ["WCAG 2.1.1 Keyboard", "WCAG 4.1.2 Name, Role, Value"],
    tips: [
      "Each dropdown item should have meaningful text — avoid icon-only items without aria-label.",
      "Group related items with DropdownItem separators for cognitive clarity.",
    ],
  },
  checkbox: {
    role: "checkbox",
    ariaRequired: ["aria-label or associated label"],
    ariaOptional: ["aria-checked", "aria-required", "aria-describedby"],
    keyboardPatterns: ["Space → toggle checked state", "Tab → move focus"],
    focusNotes:
      "aria-checked is managed automatically by the component. Group related checkboxes with VuCheckboxGroup which adds group role and legend.",
    wcag: [
      "WCAG 1.3.1 Info and Relationships",
      "WCAG 2.1.1 Keyboard",
      "WCAG 4.1.2 Name, Role, Value",
    ],
    tips: [
      "Indeterminate state (aria-checked='mixed') is supported via the indeterminate prop.",
      "For checkbox groups, always provide a group label via VuCheckboxGroup.",
    ],
  },
  "radio-group": {
    role: "radiogroup",
    ariaRequired: ["aria-label or legend for the group"],
    ariaOptional: ["aria-required", "aria-describedby"],
    keyboardPatterns: [
      "Arrow keys → move between radio options",
      "Space → select focused radio",
      "Tab → exit group",
    ],
    focusNotes:
      "Only one radio in the group is in the tab order at a time (roving tabindex). Arrow keys navigate within the group.",
    wcag: ["WCAG 1.3.1 Info and Relationships", "WCAG 2.1.1 Keyboard"],
    tips: [
      "Always provide a visible group label — this is the question/prompt the radios answer.",
      "Pre-select a default option when a choice is required.",
    ],
  },
  tabs: {
    role: "tablist",
    ariaRequired: ["aria-label on the tablist"],
    ariaOptional: ["aria-orientation"],
    keyboardPatterns: [
      "Arrow Left/Right → navigate tabs",
      "Home → first tab",
      "End → last tab",
      "Enter/Space → activate tab (if activation is manual)",
    ],
    focusNotes:
      "Tab key moves focus into the active tab panel content, not between tabs. Arrow keys navigate between tab headers.",
    wcag: ["WCAG 2.1.1 Keyboard", "WCAG 4.1.2 Name, Role, Value"],
    tips: [
      "Avoid too many tabs — consider accordion or navigation instead if > 7 tabs.",
      "Each tab panel must have a unique, descriptive label matching its tab button.",
    ],
  },
  select: {
    role: "combobox (expanded listbox)",
    ariaRequired: ["aria-label or associated label"],
    ariaOptional: ["aria-required", "aria-invalid", "aria-multiselectable"],
    keyboardPatterns: [
      "Enter/Alt+Down → open",
      "Arrow Up/Down → navigate options",
      "Enter → select",
      "Escape → close",
      "Type → jump to matching option",
    ],
    focusNotes:
      "Follows ARIA combobox pattern. Focus stays on the combobox trigger; options are announced via aria-activedescendant.",
    wcag: ["WCAG 1.3.1 Info and Relationships", "WCAG 2.1.1 Keyboard"],
    tips: [
      "For multi-select, announce selection count to screen readers with aria-label update.",
      "Provide a placeholder only as supplementary hint, never as the primary label.",
    ],
  },
  combobox: {
    role: "combobox",
    ariaRequired: ["aria-label or associated label", "aria-expanded", "aria-controls"],
    ariaOptional: ["aria-autocomplete", "aria-activedescendant"],
    keyboardPatterns: [
      "Type → filter options",
      "Arrow Down/Up → navigate filtered list",
      "Enter → select highlighted option",
      "Escape → clear/close",
    ],
    focusNotes:
      "Follows ARIA 1.2 combobox pattern with aria-activedescendant on the input. The popup list is controlled but input retains DOM focus.",
    wcag: [
      "WCAG 1.3.1 Info and Relationships",
      "WCAG 2.1.1 Keyboard",
      "WCAG 4.1.2 Name, Role, Value",
    ],
    tips: [
      "When the combobox is required, surface validation with aria-invalid and an error message.",
    ],
  },
  tooltip: {
    role: "tooltip",
    ariaRequired: ["aria-describedby on the trigger pointing to the tooltip id"],
    ariaOptional: [],
    keyboardPatterns: ["Focus trigger → tooltip appears", "Escape → dismiss tooltip"],
    focusNotes:
      "Tooltip content must NOT contain interactive elements. For interactive popups, use Popover instead.",
    wcag: ["WCAG 1.4.13 Content on Hover or Focus (tooltip must persist on hover)"],
    tips: [
      "Never put essential information only in a tooltip — it must be accessible without hover.",
      "Avoid tooltips on disabled elements; they can't be keyboard-focused.",
    ],
  },
  "date-picker": {
    role: "dialog (calendar popup)",
    ariaRequired: ["aria-label on the trigger button", "aria-label on the calendar grid"],
    ariaOptional: ["aria-describedby for date format hint"],
    keyboardPatterns: [
      "Enter/Space → open calendar",
      "Arrow keys → navigate days",
      "Page Up/Down → previous/next month",
      "Enter → select date",
      "Escape → close",
    ],
    focusNotes:
      "Focus moves into the calendar grid on open. Announce the currently focused date with aria-live or aria-activedescendant.",
    wcag: ["WCAG 2.1.1 Keyboard", "WCAG 1.3.3 Sensory Characteristics"],
    tips: [
      "Always provide a visible date format hint (e.g. MM/DD/YYYY) near the input.",
      "Selected date should be announced: 'Selected, December 25, 2025'.",
    ],
  },
  drawer: {
    role: "dialog",
    ariaRequired: ["aria-labelledby", "aria-modal='true'"],
    ariaOptional: ["aria-describedby"],
    keyboardPatterns: ["Escape → close", "Tab → cycle focusable elements (trapped)"],
    focusNotes:
      "Same as dialog — focus must be trapped. Focus returns to trigger on close. VuDrawer manages this automatically.",
    wcag: ["WCAG 2.1.2 No Keyboard Trap", "WCAG 4.1.2 Name, Role, Value"],
    tips: ["Drawers are dialogs — always include a visible heading and a close button."],
  },
  switch: {
    role: "switch",
    ariaRequired: ["aria-label or visible label"],
    ariaOptional: ["aria-checked", "aria-describedby"],
    keyboardPatterns: ["Space → toggle", "Tab → move focus"],
    focusNotes:
      "aria-checked is updated automatically. Use label prop for a visible associated label.",
    wcag: ["WCAG 4.1.2 Name, Role, Value"],
    tips: [
      "Label should describe the feature being toggled, not its state (e.g. 'Dark mode', not 'Toggle dark mode').",
      "Avoid ambiguous labels — the on/off state is communicated by aria-checked.",
    ],
  },
  accordion: {
    role: "button (per accordion trigger)",
    ariaRequired: ["aria-expanded on each trigger"],
    ariaOptional: ["aria-controls pointing to panel id"],
    keyboardPatterns: ["Enter/Space → toggle section", "Tab → navigate between headers"],
    focusNotes:
      "Each accordion header is a button. Arrow key navigation between headers is optional per ARIA spec.",
    wcag: ["WCAG 2.1.1 Keyboard", "WCAG 4.1.2 Name, Role, Value"],
    tips: ["Don't auto-collapse all sections — keep at least one open when content is critical."],
  },
  pagination: {
    role: "navigation",
    ariaRequired: ["aria-label on the nav element (e.g. 'Pagination')"],
    ariaOptional: ["aria-current='page' on the active page button"],
    keyboardPatterns: ["Tab → navigate between page buttons", "Enter/Space → go to page"],
    focusNotes:
      "Wrap in <nav aria-label='Pagination'>. Mark current page with aria-current='page'.",
    wcag: ["WCAG 1.3.1 Info and Relationships", "WCAG 2.4.8 Location"],
    tips: [
      "Announce page changes to screen readers with an aria-live region outside the component.",
    ],
  },
  slider: {
    role: "slider",
    ariaRequired: [
      "aria-label or visible label",
      "aria-valuenow",
      "aria-valuemin",
      "aria-valuemax",
    ],
    ariaOptional: [
      "aria-valuetext (for non-numeric display)",
      "aria-orientation",
      "aria-describedby",
    ],
    keyboardPatterns: [
      "Arrow Left/Down → decrease value",
      "Arrow Right/Up → increase value",
      "Home → minimum value",
      "End → maximum value",
      "Page Up/Down → large step increment",
    ],
    focusNotes:
      "Each thumb is a separate focusable slider role. For range sliders (two thumbs), both thumbs must be individually keyboard accessible and labeled.",
    wcag: [
      "WCAG 1.3.1 Info and Relationships",
      "WCAG 2.1.1 Keyboard",
      "WCAG 4.1.2 Name, Role, Value",
    ],
    tips: [
      "Use aria-valuetext for values that have semantic meaning (e.g. '$50' or 'Low'.",
      "When the value is a percentage, set aria-valuetext to the descriptive label, not just '50'.",
      "Always show the current value visually near the thumb.",
    ],
  },
  range: {
    role: "slider (two thumbs for range)",
    ariaRequired: ["aria-label for each thumb", "aria-valuenow", "aria-valuemin", "aria-valuemax"],
    ariaOptional: ["aria-valuetext", "aria-orientation"],
    keyboardPatterns: [
      "Tab → focus first thumb, then second",
      "Arrow keys → adjust focused thumb value",
      "Home/End → jump to min/max",
    ],
    focusNotes:
      "Range slider has two independently focusable thumbs. Each thumb must carry its own ARIA label (e.g. 'Minimum price', 'Maximum price').",
    wcag: [
      "WCAG 1.3.1 Info and Relationships",
      "WCAG 2.1.1 Keyboard",
      "WCAG 4.1.2 Name, Role, Value",
    ],
    tips: [
      "Announce the current range value when either thumb changes.",
      "Prevent the min thumb from exceeding the max thumb via aria-valuemax constraints.",
    ],
  },
  otp: {
    role: "group of textbox inputs",
    ariaRequired: ["aria-label on the group wrapper (e.g. 'One-time password')"],
    ariaOptional: ["aria-describedby for hint text about code length"],
    keyboardPatterns: [
      "Type digit → auto-advance to next input",
      "Backspace → clear and move to previous input",
      "Arrow Left/Right → move between inputs",
      "Paste → distribute digits across inputs",
    ],
    focusNotes:
      "Each OTP digit input is an individual textbox. Auto-advance on input is standard UX but must not trap focus. Paste must work on the first input to fill all.",
    wcag: [
      "WCAG 1.3.1 Info and Relationships",
      "WCAG 2.1.1 Keyboard",
      "WCAG 3.3.2 Labels or Instructions",
    ],
    tips: [
      "Announce 'Incorrect code' errors with role='alert' or aria-live='assertive'.",
      "Display a hint for code length and source (e.g. 'Enter the 6-digit code from your email').",
      "Ensure paste works — users should not need to manually type each digit.",
    ],
  },
  tree: {
    role: "tree",
    ariaRequired: [
      "aria-label on the tree element",
      "aria-expanded on expandable nodes",
      "aria-selected on selected nodes",
    ],
    ariaOptional: ["aria-multiselectable", "aria-level", "aria-setsize", "aria-posinset"],
    keyboardPatterns: [
      "Arrow Down/Up → next/previous visible node",
      "Arrow Right → expand collapsed node (or move to first child)",
      "Arrow Left → collapse expanded node (or move to parent)",
      "Enter → select / activate node",
      "Home/End → first/last visible node",
      "Type character → jump to next node starting with that letter",
    ],
    focusNotes:
      "Tree uses roving tabindex — only one node is in the tab order. Arrow keys navigate within the tree. When a node is expanded/collapsed, update aria-expanded immediately.",
    wcag: [
      "WCAG 2.1.1 Keyboard",
      "WCAG 4.1.2 Name, Role, Value",
      "WCAG 1.3.1 Info and Relationships",
    ],
    tips: [
      "Announce node expansion state changes with aria-live or rely on aria-expanded updates.",
      "For drag-and-drop reordering, provide keyboard alternatives (cut/paste with keyboard shortcuts).",
      "Indent levels must be communicated via aria-level, not only visual indentation.",
    ],
  },
};

export function handleGetA11yGuide(req: A11yGuideRequest) {
  try {
    const doc = getVelkinComponentDocs(req.component);
    if (!doc) {
      return mcpToolErr(McpErrorCode.UNKNOWN_COMPONENT, `Unknown component "${req.component}".`, {
        component: req.component,
      });
    }

    const guide = A11Y_GUIDES[doc.slug];
    if (!guide) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              withVelkinMcpMeta(
                {
                  component: doc.slug,
                  tag: doc.tag,
                  found: false,
                  message: `No dedicated a11y guide for "${doc.name}" yet. General rule: provide visible labels, ensure keyboard navigation works, and test with a screen reader.`,
                  generalTips: [
                    "Use semantic HTML structure around Velkin components.",
                    "All interactive elements must be keyboard-reachable.",
                    "Provide text alternatives for icon-only elements via aria-label.",
                    "Test with VoiceOver (macOS), NVDA, or JAWS.",
                  ],
                },
                { truthLayer: "authoritative" },
              ),
              null,
              2,
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            withVelkinMcpMeta(
              { component: doc.slug, tag: doc.tag, found: true, ...guide },
              {
                truthLayer: "authoritative",
                agentMust:
                  "Apply all ariaRequired attributes. Test keyboard patterns before shipping.",
              },
            ),
            null,
            2,
          ),
        },
      ],
    };
  } catch (err) {
    return mcpToolErr(McpErrorCode.A11Y_FAILED, err instanceof Error ? err.message : String(err));
  }
}
