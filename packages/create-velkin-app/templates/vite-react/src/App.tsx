import { useState } from "react";
import { VuAppbar } from "@velkin/react/appbar";
import { VuNavPanel } from "@velkin/react/nav-panel";
import { VuThemeSwitcher } from "@velkin/react/theme-switcher";
import { VuForm } from "@velkin/react/form";
import { VuInput } from "@velkin/react/input";
import { VuCheckbox } from "@velkin/react/checkbox";
import { VuButton } from "@velkin/react/button";
import { VuAlert } from "@velkin/react/alert";
import { VuDialog } from "@velkin/react/dialog";

const navItems = [
  { key: "home", label: "Home", icon: "ion:home-outline" },
  { key: "settings", label: "Settings", icon: "ion:settings-outline" },
];

export function App() {
  const [page, setPage] = useState("home");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <VuAppbar>
        <span slot="start">Velkin starter</span>
        <VuThemeSwitcher slot="end" type="button" variant="ghost" size="sm" />
      </VuAppbar>
      <div className="vu-dashboard">
        <VuNavPanel
          items={navItems}
          value={page}
          onVuChange={(e) => setPage(String(e.detail.value))}
        />
        <main className="vu-dashboard__main">
          <VuForm
            onVuSubmit={(e) => {
              e.preventDefault();
              setError(null);
              setOpen(true);
            }}
          >
            {error ? (
              <VuAlert color="danger" variant="soft" heading="Sign in failed" message={error} />
            ) : null}
            <VuInput label="Email" type="email" name="email" required />
            <VuInput label="Password" type="password" name="password" required />
            <VuCheckbox name="remember">Remember me</VuCheckbox>
            <VuButton type="submit" color="primary">
              Sign in
            </VuButton>
          </VuForm>
          <VuButton variant="ghost" onClick={() => setError("Invalid credentials")}>
            Simulate error
          </VuButton>
        </main>
      </div>
      <VuDialog open={open} onVuClose={() => setOpen(false)}>
        <div slot="header">Welcome</div>
        <div slot="body">You are signed in (demo).</div>
        <div slot="footer">
          <VuButton onClick={() => setOpen(false)}>OK</VuButton>
        </div>
      </VuDialog>
    </>
  );
}
