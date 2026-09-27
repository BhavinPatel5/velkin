/**
 * Regenerates dist/<component>/index.js barrels after Rollup.
 * Rollup with `preserveModules` tree-shakes the pure re-export `index.ts` barrels
 * (they contain only `export *` / `export { X as default }`), so `@velkin/react/<name>`
 * (mapped to ./dist/<name>/index.js) would 404. This rebuilds each barrel from the
 * authoritative `src/<name>/index.ts`, dropping type-only lines and adding `.js`
 * specifiers, keeping only barrels whose target module survived in dist.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'src');
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) process.exit(0);

const entries = fs
  .readdirSync(srcDir, { withFileTypes: true })
  .filter((d) => d.isDirectory());

let written = 0;

for (const dir of entries) {
  const name = dir.name;
  const srcIndex = path.join(srcDir, name, 'index.ts');
  const distDir = path.join(dist, name);
  if (!fs.existsSync(srcIndex) || !fs.existsSync(distDir)) continue;

  const out = [];
  for (const raw of fs.readFileSync(srcIndex, 'utf-8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('export type') || line.startsWith('import type')) continue;
    // Only keep relative re-exports; rewrite `from "./x"` → `from "./x.js"`.
    const m = line.match(/from\s+["'](\.\/[^"']+)["']/);
    if (!m) continue;
    const rel = m[1].endsWith('.js') ? m[1] : `${m[1]}.js`;
    if (!fs.existsSync(path.join(distDir, rel))) continue;
    out.push(line.replace(/from\s+["']\.\/[^"']+["']/, `from "${rel}"`));
  }

  if (out.length > 0) {
    fs.writeFileSync(path.join(distDir, 'index.js'), out.join('\n') + '\n');
    written++;
  }
}

console.log(`Generated ${written} dist/<component>/index.js barrels`);
