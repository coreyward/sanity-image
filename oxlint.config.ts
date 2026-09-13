import { defineConfig } from "oxlint"

export default defineConfig({
  plugins: [
    "react",
    "unicorn",
    "typescript",
    "oxc",
    "vitest",
    "jsx-a11y",
    "promise",
    "react-perf",
  ],
  categories: {
    correctness: "deny",
    suspicious: "warn",
    perf: "warn",
    pedantic: "warn",
  },
  rules: {
    curly: "error",
    "sort-imports": ["warn", { ignoreCase: true, ignoreDeclarationSort: true }],
    "no-inline-comments": "allow",
    "require-unicode-regexp": "allow",
    "max-lines-per-function": "allow",
    "max-lines": "allow",
    // Sanity documents use `_id`, `_type`, etc.
    "no-underscore-dangle": "allow",
    "unicorn/consistent-function-scoping": "allow",
    // toSorted() requires ES2023; this project targets ES2022 for now
    "unicorn/no-array-sort": "allow",
    "unicorn/prefer-number-coercion": "allow",
    "vitest/no-conditional-in-test": "allow",
    "unicorn/prefer-dom-node-dataset": "allow",
    "react/react-in-jsx-scope": "allow",
    "react/rules-of-hooks": "error",
    "react/exhaustive-effect-dependencies": "allow",
    "react-perf/jsx-no-new-object-as-prop": "allow",
    "react-perf/jsx-no-new-function-as-prop": "allow",
    "vitest/require-to-throw-message": "allow",
    "typescript/no-explicit-any": "error",
    "typescript/no-unnecessary-condition": "error",
    "typescript/prefer-readonly-parameter-types": "allow",
    "typescript/strict-boolean-expressions": "allow",
    "typescript/consistent-type-definitions": ["warn", "type"],
    "typescript/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    "no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
  ignorePatterns: [
    "dist",
    "packages/*/dist",
    "examples",
    "tests/buildTestCases.mjs",
  ],
  overrides: [
    {
      // Runtime guards on JSON fixture data that TS already considers narrowed
      files: ["tests/imageOutput.test.ts"],
      rules: { "typescript/no-unnecessary-condition": "allow" },
    },
  ],
})
