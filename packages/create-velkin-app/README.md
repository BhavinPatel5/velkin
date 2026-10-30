# create-velkin-app

Scaffold a Velkin UI application with theme provider, bundler plugins, example UI, and multi-agent files (`AGENTS.md`, agent playbooks/skills, and MCP configs).

```bash
npx create-velkin-app@latest my-app --template next
npx create-velkin-app@latest my-app --template vite --pm pnpm
npx create-velkin-app@latest my-app --template vue
```

Templates: `next` (App Router + `defineVelkin`), `vite` (`velkin()` + `velkinReact()`), `vue` (`velkin()` + `velkinVue()`). Webpack/Rollup use the same factories from `/webpack` or `/rollup`.

```bash
cd my-app
npm install
npm run dev
```

Generated projects include universal `AGENTS.md`, multi-client MCP configs (Cursor, VS Code, Claude, Antigravity, Windsurf), and agent playbooks/skills. You can also run `npx velkin-mcp init` on an existing application.
