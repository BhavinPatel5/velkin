export type Recipe = {
  id: string;
  title: string;
  description: string;
  tier: "free" | "pro";
  components: string[];
  toolsToCall: string[];
  agentChecklist: string[];
  react: string;
};

export const RECIPES: Recipe[] = [
  {
    id: "app-shell",
    title: "App shell with theme",
    description: "Root layout with VuThemeProvider and theme persistence.",
    tier: "free",
    components: ["theme-provider", "theme-switcher"],
    toolsToCall: ["get_theme", "get_component_usage", "get_docs"],
    agentChecklist: [
      "Wrap app in VuThemeProvider with persist",
      "Add blocking theme script for Next.js SSR",
      "Import from @velkin/react/theme-provider subpath",
    ],
    react: `import { VuThemeProvider } from "@velkin/react/theme-provider";
import { VuThemeSwitcher } from "@velkin/react/theme-switcher";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <VuThemeProvider persist>
      <header><VuThemeSwitcher type="button" variant="ghost" size="sm" /></header>
      {children}
    </VuThemeProvider>
  );
}`,
  },
  {
    id: "form-field",
    title: "Form field",
    description: "Input with label and validation feedback.",
    tier: "free",
    components: ["input", "alert"],
    toolsToCall: ["get_velkin_component_docs", "get_component_usage"],
    agentChecklist: [
      "Use VuInput label + hint props",
      "Wire onVuChange for controlled value",
      "Show VuAlert for validation errors",
    ],
    react: `import { VuInput } from "@velkin/react/input";
import { VuAlert } from "@velkin/react/alert";

<VuInput label="Email" value={email} onVuChange={(e) => setEmail(String(e.detail.value ?? ""))} />
{error ? <VuAlert color="danger" variant="soft" heading="Error" message={error} /> : null}`,
  },
  {
    id: "confirm-dialog",
    title: "Confirm dialog",
    description: "Modal confirmation with header/body/footer slots.",
    tier: "free",
    components: ["dialog", "button"],
    toolsToCall: ["get_velkin_component_docs", "get_recipes"],
    agentChecklist: [
      "Control open state in React",
      "Use slot=header|body|footer on VuDialog",
      "Handle onVuClose to sync open=false",
    ],
    react: `import { VuDialog } from "@velkin/react/dialog";
import { VuButton } from "@velkin/react/button";

<VuDialog open={open} onVuClose={() => setOpen(false)}>
  <div slot="header">Confirm</div>
  <div slot="body">Are you sure?</div>
  <div slot="footer"><VuButton onClick={() => setOpen(false)}>OK</VuButton></div>
</VuDialog>`,
  },
  {
    id: "data-table-pro",
    title: "Data table (Pro)",
    description: "Enterprise data grid — requires @velkin/ui-pro.",
    tier: "pro",
    components: ["data-table"],
    toolsToCall: ["get_velkin_component_docs", "get_docs"],
    agentChecklist: [
      "Verify @velkin/ui-pro license before shipping",
      "Import from @velkin/ui-pro/data-table",
      "Check column defs API via get_velkin_component_docs",
    ],
    react: `// Pro tier — requires @velkin/ui-pro
import "@velkin/ui-pro/data-table";`,
  },
  {
    id: "dashboard-shell",
    title: "Dashboard shell",
    description: "App bar, collapsible nav panel, and theme controls.",
    tier: "free",
    components: ["appbar", "nav-panel", "theme-provider", "theme-switcher"],
    toolsToCall: ["get_recipes", "get_velkin_component_docs", "get_theme"],
    agentChecklist: [
      "VuThemeProvider at root with persist",
      "VuAppbar for top chrome; slot actions for VuThemeSwitcher",
      "VuNavPanel with items array + value for selection",
      "Import nav-panel-item children only when composing custom rows",
    ],
    react: `import { VuThemeProvider } from "@velkin/react/theme-provider";
import { VuAppbar } from "@velkin/react/appbar";
import { VuNavPanel } from "@velkin/react/nav-panel";
import { VuThemeSwitcher } from "@velkin/react/theme-switcher";

const navItems = [
  { key: "home", label: "Home", icon: "ion:home-outline" },
  { key: "settings", label: "Settings", icon: "ion:settings-outline" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [page, setPage] = React.useState("home");
  return (
    <VuThemeProvider persist>
      <VuAppbar heading="Dashboard">
        <VuThemeSwitcher slot="actions" type="button" variant="ghost" size="sm" />
      </VuAppbar>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <VuNavPanel items={navItems} value={page} onVuChange={(e) => setPage(String(e.detail.value))} />
        <main style={{ flex: 1, padding: "var(--vu-space-4)" }}>{children}</main>
      </div>
    </VuThemeProvider>
  );
}`,
  },
  {
    id: "auth-form",
    title: "Sign-in form",
    description: "Email/password form with remember-me and error alert.",
    tier: "free",
    components: ["form", "input", "checkbox", "button", "alert"],
    toolsToCall: ["get_velkin_component_docs", "get_component_usage"],
    agentChecklist: [
      "Use VuForm for submit handling",
      "VuInput type=password for password field",
      "VuCheckbox for remember-me",
      "VuAlert color=danger for auth errors",
    ],
    react: `import { VuForm } from "@velkin/react/form";
import { VuInput } from "@velkin/react/input";
import { VuCheckbox } from "@velkin/react/checkbox";
import { VuButton } from "@velkin/react/button";
import { VuAlert } from "@velkin/react/alert";

export function SignInForm() {
  const [error, setError] = React.useState<string | null>(null);
  return (
    <VuForm onVuSubmit={(e) => { e.preventDefault(); /* sign in */ }}>
      {error ? <VuAlert color="danger" variant="soft" heading="Sign in failed" message={error} /> : null}
      <VuInput label="Email" type="email" name="email" required />
      <VuInput label="Password" type="password" name="password" required />
      <VuCheckbox name="remember">Remember me</VuCheckbox>
      <VuButton type="submit" color="primary">Sign in</VuButton>
    </VuForm>
  );
}`,
  },
  {
    id: "data-table-filter-pro",
    title: "Data table with filter (Pro)",
    description: "Enterprise grid with advanced filter bar — requires @velkin/ui-pro.",
    tier: "pro",
    components: ["advanced-filter", "data-table"],
    toolsToCall: ["get_velkin_component_docs", "get_docs"],
    agentChecklist: [
      "Install @velkin/ui-pro and validate license",
      "Wire filter state to table data source",
      "Read column defs + filter API from get_velkin_component_docs",
    ],
    react: `// Pro tier — requires @velkin/ui-pro + license
import "@velkin/ui-pro/advanced-filter";
import "@velkin/ui-pro/data-table";

// Compose filter output → table row filter in your data layer`,
  },
  {
    id: "drawer-nav",
    title: "Mobile drawer navigation",
    description: "Responsive layout with drawer + nav panel for small screens.",
    tier: "free",
    components: ["drawer", "nav-panel", "button", "navbar"],
    toolsToCall: ["get_velkin_component_docs", "get_component_usage"],
    agentChecklist: [
      "Control drawer open state in React",
      "VuNavbar with menu button opens drawer on mobile",
      "VuNavPanel inside drawer body for route list",
      "Close drawer on nav selection (onVuChange)",
    ],
    react: `import { VuDrawer } from "@velkin/react/drawer";
import { VuNavPanel } from "@velkin/react/nav-panel";
import { VuButton } from "@velkin/react/button";

export function MobileNav({ items, value, onNavigate }: {
  items: { key: string; label: string; icon?: string }[];
  value: string;
  onNavigate: (key: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <VuButton variant="ghost" onClick={() => setOpen(true)} aria-label="Open menu">Menu</VuButton>
      <VuDrawer open={open} onVuClose={() => setOpen(false)} placement="start">
        <div slot="header">Navigation</div>
        <VuNavPanel
          items={items}
          value={value}
          onVuChange={(e) => { onNavigate(String(e.detail.value)); setOpen(false); }}
        />
      </VuDrawer>
    </>
  );
}`,
  },
  {
    id: "settings-tabs",
    title: "Settings with tabs",
    description: "Tabbed settings page with form fields per section.",
    tier: "free",
    components: ["tab", "tab-item", "form", "input", "switch"],
    toolsToCall: ["get_velkin_component_docs", "get_recipes"],
    agentChecklist: [
      "VuTab controls selected tab value",
      "VuTabItem per section with slot content",
      "VuForm inside each tab for isolated save actions",
      "VuSwitch for boolean preferences",
    ],
    react: `import { VuTab } from "@velkin/react/tab";
import { VuTabItem } from "@velkin/react/tab-item";
import { VuForm } from "@velkin/react/form";
import { VuInput } from "@velkin/react/input";
import { VuSwitch } from "@velkin/react/switch";

export function SettingsPage() {
  const [tab, setTab] = React.useState("profile");
  return (
    <VuTab value={tab} onVuChange={(e) => setTab(String(e.detail.value))}>
      <VuTabItem value="profile" label="Profile">
        <VuForm>
          <VuInput label="Display name" name="name" />
        </VuForm>
      </VuTabItem>
      <VuTabItem value="notifications" label="Notifications">
        <VuSwitch label="Email alerts" />
      </VuTabItem>
    </VuTab>
  );
}`,
  },
  {
    id: "toast-notifications",
    title: "Toast notifications",
    description: "Transient feedback via notification component.",
    tier: "free",
    components: ["notification", "button"],
    toolsToCall: ["get_velkin_component_docs", "get_component_usage"],
    agentChecklist: [
      "Read notification API for open/duration/variant props",
      "Trigger from async action handlers",
      "Use color + heading + message props for status",
    ],
    react: `import { VuNotification } from "@velkin/react/notification";
import { VuButton } from "@velkin/react/button";

export function SaveExample() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <VuButton onClick={() => setOpen(true)}>Save</VuButton>
      <VuNotification
        open={open}
        onVuClose={() => setOpen(false)}
        color="success"
        heading="Saved"
        message="Your changes were saved."
      />
    </>
  );
}`,
  },
];

export function listRecipes() {
  return RECIPES.map(({ id, title, description, tier, components }) => ({
    id,
    title,
    description,
    tier,
    components,
  }));
}

export function getRecipe(id: string): Recipe | null {
  return RECIPES.find((r) => r.id === id) ?? null;
}
