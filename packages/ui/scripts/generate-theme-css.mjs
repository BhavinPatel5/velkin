#!/usr/bin/env node
/** Writes dist/theme-provider/default.css from the shipped defaultTheme stylesheet. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const distStyles = path.join(root, "dist", "theme-provider", "theme-styles.js");
const outFile = path.join(root, "dist", "theme-provider", "default.css");

if (!fs.existsSync(distStyles)) {
  console.error("Missing theme-styles.js — run rollup build first.");
  process.exit(1);
}

const { defaultThemeCss } = await import(distStyles);
fs.writeFileSync(outFile, `${defaultThemeCss.trim()}\n`);
console.log(`Wrote ${path.relative(root, outFile)}`);
