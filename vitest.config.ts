import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*-tests.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts", "src/index.ts", "src/query.ts"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      reporter: ["text", "html", "json"],
      reportsDirectory: "./coverage",
    },
  },
});
