# Velkin Vite + Vue starter

Created with `npx create-velkin-app --template vue`.

```bash
npm install
npm run dev
```

This project uses `velkin()` and `velkinVue()`. Pre-wired agent files: `AGENTS.md`, multi-client MCP configs (Cursor, VS Code, Claude, Antigravity, Windsurf), and agent playbooks/skills.

Documentation: [velkinui.com](https://velkinui.com)

## Optional Pro license

Initialize `@velkin/license` before mounting Vue when using Pro packages:

```ts
import { LicenseInfo } from "@velkin/license";

LicenseInfo.setLicenseKey(import.meta.env.VITE_VELKIN_LICENSE_KEY ?? "");
```

Domain-scoped keys compare their signed allow-list with the browser hostname. Revocation checks are
background-only and fail open.
