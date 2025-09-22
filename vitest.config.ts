import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    exclude: [".bak"],
    includeSource: ["src/**/*.ts"],
    setupFiles: ["vitest.setup.ts"],
  },
});
