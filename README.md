# Velkin UI

Velkin is an accessible component library built with Lit. Use the custom elements directly, or through the official React and Vue wrappers.

**Documentation:** [velkinui.com](https://velkinui.com)  
**Agents:** [AGENTS.md](https://velkinui.com/AGENTS.md) · **MCP:** [mcp.velkinui.com/mcp](https://mcp.velkinui.com/mcp)

To use Velkin in an application, install from npm and follow the documentation. This repository is the MIT source for contributors and custom builds.

## Installation

```bash
npm install @velkin/ui @velkin/react lit @lit/react
```

```tsx
import { VuThemeProvider } from "@velkin/react/theme-provider";
import { VuButton } from "@velkin/react/button";
```

## Packages

| Package | Description |
| --- | --- |
| `@velkin/ui` | Lit custom elements (`vu-*`) |
| `@velkin/react` | React wrappers |
| `@velkin/vue` | Vue wrappers |
| `@velkin/mcp` | MCP server for coding agents |
| `create-velkin-app` | Project scaffold (Next.js, Vite React, Vite Vue) |

Commercial Pro packages (`@velkin/ui-pro`, `@velkin/react-pro`) are distributed separately. See [pricing](https://velkinui.com/pricing).

## Repository layout

This is an npm workspaces monorepo. Published MIT source lives under `packages/`.

## Development

Requires Node.js 18 or later.

```bash
git clone https://github.com/BhavinPatel5/velkin.git
cd velkin
npm install
npm run build
npm test
```

| Script | Description |
| --- | --- |
| `npm run build` | Build ui, react, vue, and mcp |
| `npm run build:ui` | Build Lit components only |
| `npm test` | Smoke tests (element registration + render) |
| `npm run format` | Format with Prettier |

Preview components in the documentation: [velkinui.com/docs/components](https://velkinui.com/docs/components).

### Adding a component

Add a folder under `packages/ui/src/<kebab>/` (`vu-<kebab>` tag, `Vu<Pascal>` class). React and Vue wrappers are generated upstream — change them only for wrapper-specific bugs. Do not add commercial Pro components to this repository.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT. Pro packages use a separate commercial license — [velkinui.com/license](https://velkinui.com/license).
