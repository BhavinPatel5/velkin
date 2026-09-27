/**
 * Library icon registry — single source of truth for every Iconify name used
 * inside `vu-*` components.
 *
 * Why this exists
 * ----------------
 * - **Swap an icon set in one place.** Want to move every chevron from `ion:*`
 *   to `material-symbols:*`? Edit this file, done. No project-wide grep.
 * - **Find them all at a glance.** New consumer wants to know which Iconify
 *   sets the library depends on? Open this file.
 * - **Pairs with the offline bundler.** `iconify-offline.ts` extracts icon
 *   names from quoted strings; keeping ours collected here keeps the offline
 *   bundle deterministic.
 *
 * Naming policy
 * --------------
 * Keys are **purpose-named**, not glyph-named. Use `close` (not `xMark`),
 * `intentDanger` (not `alertCircle`). That way the call site reads the
 * intent, and changing the underlying glyph is a non-breaking edit here.
 *
 * Adding a new icon
 * ------------------
 * 1. Pick a purpose-named key (camelCase) — group it semantically near siblings.
 * 2. Add a one-line `/** ... *\/` comment above the entry describing the role.
 * 3. Import via `import { ICONS } from "../../internals/icon.js";` and use
 *    `<vu-icon icon=${ICONS.yourKey}></vu-icon>`.
 *
 * @example
 *   import { ICONS } from "../../internals/icon.js";
 *   html`<vu-icon icon=${ICONS.close}></vu-icon>`;
 */
export const ICONS = {
  /** Generic dismiss affordance (alert, dialog, drawer, chip, snackbar, ...). */
  close: "ion:close",

  /** Direction affordance — collapsed/down (accordion expand, dropdown). */
  chevronDown: "ion:chevron-down",
  /** Direction affordance — expanded/up (accordion collapse, dropdown reverse). */
  chevronUp: "ion:chevron-up",
  /** Direction affordance — start (RTL-aware via icon's flip prop, not the name). */
  chevronLeft: "ion:chevron-back",
  /** Direction affordance — end (RTL-aware via icon's flip prop, not the name). */
  chevronRight: "ion:chevron-forward",

  /** Status / intent — informational (alert/notification "primary" intent). */
  intentInfo: "ion:information-circle",
  /** Status / intent — success / completed. */
  intentSuccess: "ion:checkmark-circle",
  /** Status / intent — warning (assertive but not destructive). */
  intentWarning: "ion:warning",
  /** Status / intent — danger / error / destructive. */
  intentDanger: "ion:alert-circle",

  /** Generic person silhouette — used as the final fallback for avatars without name or image. */
  person: "ion:person",

  /** Horizontal three-dot affordance — overflow / "more" trigger (breadcrumb collapse, menu reveal). */
  ellipsis: "ion:ellipsis-horizontal",

  /** Hamburger affordance — full menu reveal (adaptive-bar full overflow, navbar drawer). */
  menu: "ion:menu",

  /** Reset-to-default affordance (theme generator token rows). */
  reset: "ion:refresh-outline",

  /** Light theme affordance (`vu-theme-switcher`). */
  themeLight: "ion:sunny-outline",
  /** Dark theme affordance (`vu-theme-switcher`). */
  themeDark: "ion:moon-outline",
  /** System theme affordance (`vu-theme-switcher`). */
  themeSystem: "ion:desktop-outline",

  /** Copy-to-clipboard affordance (`vu-code-block`, chat message actions). */
  copy: "ion:copy-outline",

  /** Notification bell affordance (badge anchors, preview samples). */
  notifications: "ion:notifications-outline",

  /** Stepper decrement affordance (`vu-counter`, quantity fields). */
  decrement: "ion:remove",
  /** Stepper increment affordance (`vu-counter`, quantity fields). */
  increment: "ion:add",

  /** Step error node glyph (`vu-steps`, `vu-step-item`). */
  stepError: "lucide:circle-x",

  /** Password visible affordance (`vu-input`). */
  visibility: "ion:eye",
  /** Password hidden affordance (`vu-input`). */
  visibilityOff: "ion:eye-off",

  /** Filter / search affordance (`vu-combobox`). */
  search: "ion:search",

  /** Menu row selected checkmark (`vu-dropdown-item`). */
  check: "ion:checkmark",

  /** Browse / folder pick affordance (`vu-file-picker`). */
  folder: "ion:folder",

  /** Expanded folder row glyph (`vu-tree`). */
  treeFolderOpen: "ion:folder-open",

  /** Default empty dropzone glyph (`vu-file-picker`). */
  cloudUpload: "ion:cloud-upload",

  /** Download action (`vu-file-viewer`). */
  download: "mdi:download",

  /** Full-size / open preview affordance (`vu-file-viewer`). */
  openInNew: "mdi:open-in-new",

  /** Fullscreen preview toggle (`vu-file-viewer`). */
  fullscreen: "mdi:fullscreen",

  /** Remove-from-selection control (`vu-file-viewer`, file list rows). */
  removeCircle: "mdi:close-circle-outline",

  /** Broken or unavailable link preview (`vu-file-viewer`). */
  linkOff: "mdi:link-variant-off",

  /** Inline preview unavailable (`vu-file-viewer`). */
  fileEyeOff: "mdi:file-eye-off-outline",

  /** View / preview available affordance (`vu-file-viewer`). */
  fileEye: "mdi:file-eye-outline",

  /** Image file kind label (`vu-file-viewer`). */
  previewImage: "mdi:image-outline",

  /** PDF file kind label (`vu-file-viewer`). */
  previewPdf: "mdi:file-pdf-box",

  /** Video file kind label (`vu-file-viewer`). */
  previewVideo: "mdi:play-circle-outline",

  /** Audio file kind label (`vu-file-viewer`). */
  previewAudio: "mdi:music-circle-outline",

  /** Text file kind label (`vu-file-viewer`). */
  previewText: "mdi:file-document-outline",

  /** 3D model file kind label (`vu-file-viewer`). */
  previewModel: "mdi:cube-outline",

  /** Unknown file kind label (`vu-file-viewer`). */
  previewOther: "mdi:file-question-outline",

  /** Start playback (`vu-video`). */
  play: "ion:play",
  /** Pause playback (`vu-video`). */
  pause: "ion:pause",
  /** Audible output (`vu-video`). */
  volumeHigh: "ion:volume-high",
  /** Muted output (`vu-video`). */
  volumeMute: "ion:volume-mute",
  /** Exit fullscreen preview (`vu-video`; enter uses `fullscreen`). */
  fullscreenExit: "mdi:fullscreen-exit",

  /** Expression filter field glyph (`vu-advanced-filter`). */
  filter: "mdi:filter-variant",
  /** Visual filter builder toggle (`vu-advanced-filter`). */
  filterBuilder: "mdi:tune-variant",
  /** Expand filter builder into a dialog (`vu-advanced-filter`). */
  filterBuilderExpand: "mdi:fullscreen",
  /** Collapse filter builder dialog back to the popover (`vu-advanced-filter`). */
  filterBuilderCollapse: "mdi:fullscreen-exit",
  /** Drag-to-reorder handle (`vu-advanced-filter` builder rows/groups). */
  dragHandle: "mdi:drag-vertical",
  /** Flatten a nested filter group back into its parent (`vu-advanced-filter`). */
  ungroup: "mdi:unfold-more-horizontal",
  /** Add a filter condition row (`vu-advanced-filter`). */
  addCondition: "mdi:plus",
  /** Add a nested filter group (`vu-advanced-filter`). */
  addGroup: "mdi:folder-plus-outline",
  /** Column-reference suggestion glyph (`vu-advanced-filter`). */
  filterColumn: "mdi:table-column",
  /** Operator suggestion glyph (`vu-advanced-filter`). */
  filterOperator: "mdi:function-variant",
  /** Value suggestion glyph (`vu-advanced-filter`). */
  filterValue: "mdi:format-quote-close",
  /** Logic keyword (AND/OR) suggestion glyph (`vu-advanced-filter`). */
  filterLogic: "mdi:set-merge",
  /** Date/time field trigger (`vu-date-picker`). */
  calendar: "ion:calendar",

  /** Canvas zoom-in control (`vu-flow`). */
  zoomIn: "ion:add-outline",
  /** Canvas zoom-out control (`vu-flow`). */
  zoomOut: "ion:remove-outline",
  /** Fit all nodes in view (`vu-flow`). */
  fitView: "ion:expand-outline",
  /** Lock canvas interaction (`vu-flow`). */
  lockClosed: "ion:lock-closed",
  /** Unlock canvas interaction (`vu-flow`). */
  lockOpen: "ion:lock-open-outline",

  /** Send message affordance (`vu-chat-composer`). */
  send: "ion:send",
  /** Stop generation affordance (`vu-ai-chat`). */
  stop: "ion:stop",
  /** Attach file affordance (`vu-chat-attachment` / composer tools). */
  attach: "ion:attach",
  /** Thumbs-up feedback (`vu-chat-message-actions`). */
  thumbUp: "ion:thumbs-up-outline",
  /** Thumbs-down feedback (`vu-chat-message-actions`). */
  thumbDown: "ion:thumbs-down-outline",
  /** Jump / scroll-to-bottom affordance (`vu-chat`). */
  arrowDown: "ion:arrow-down",
  /** Document / file glyph (`vu-chat-attachment`). */
  document: "ion:document-outline",
} as const;

/** Union of every registry key. */
export type VuLibraryIconKey = keyof typeof ICONS;

/** Union of every Iconify name registered in the library. */
export type VuLibraryIconName = (typeof ICONS)[VuLibraryIconKey];
