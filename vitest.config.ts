import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  root: path.resolve(import.meta.dirname),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client/src"),
      "@/_core": path.resolve(import.meta.dirname, "client/src/_core"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts", "server/**/*.test.tsx", "server/**/*.spec.tsx", "client/src/**/*.test.ts", "client/src/**/*.test.tsx", "client/src/**/*.spec.ts", "client/src/**/*.spec.tsx"],
    exclude: ["client/src/hooks/__tests__/useExportUtils.test.ts", "client/src/components/animations/__tests__/**", "client/src/components/__tests__/**", "client/src/__tests__/ChatWindow.test.tsx", "client/src/__tests__/accessibility.test.tsx"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: {
      modules: {
        classNameStrategy: "non-scoped",
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        "client/public/",
        "attached_assets/",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/vitest.setup.ts",
        "**/test-utils.tsx",
        "**/mocks/**",
        "**/__tests__/**",
        "**/types/**",
        "client/src/main.tsx",
        "client/src/vite-env.d.ts",
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
      cleanOnRerun: true,
    },
    reporters: ["verbose", "json", "html"],
    outputFile: {
      json: "./test-results/results.json",
      html: "./test-results/index.html",
    },
    maxConcurrency: 4,
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
