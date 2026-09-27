import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["packages/ui/src/**/*.test.ts"],
    exclude: ["**/*.perf.test.ts", "**/*.perf-ssr.test.ts", "**/node_modules/**"],
  },
});
