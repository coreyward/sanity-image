import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}", "packages/*/src/**/*.ts"],
      exclude: ["**/*.test.{ts,tsx}", "**/index.ts"],
    },
  },
})
