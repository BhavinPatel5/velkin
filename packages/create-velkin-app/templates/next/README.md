# Velkin Next.js starter

Created with `npx create-velkin-app --template next`.

```bash
npm install
npm run dev
```

This project uses webpack (`next dev --webpack`), `defineVelkin`, and `VuThemeProvider`. Agent files: `AGENTS.md`, `.cursor/mcp.json`, `.cursor/skills/velkin/SKILL.md`.

Documentation: [velkinui.com](https://velkinui.com)

## Optional Pro license

Install `@velkin/license` with your Pro packages, then initialize it in a small client module before
rendering Pro components:

```ts
import { LicenseInfo } from "@velkin/license";

LicenseInfo.setLicenseKey(process.env.NEXT_PUBLIC_VELKIN_LICENSE_KEY ?? "");
```

`NEXT_PUBLIC_` values are embedded at `next build` time. Domain-scoped keys compare their signed
allow-list with the browser hostname. Revocation checks are background-only and fail open.
