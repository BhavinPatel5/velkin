import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["packages/ui/src/**/*.test.ts"],
    exclude: ["**/*.perf.test.ts", "**/*.perf-ssr.test.ts", "**/node_modules/**"],
  },
});
