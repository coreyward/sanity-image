// @ts-check
import path from "node:path"
import { fileURLToPath } from "node:url"
import eslint from "@eslint/js"
import { FlatCompat } from "@eslint/eslintrc"
import tseslint from "typescript-eslint"
import globals from "globals"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylisticTypeChecked,
  ...compat.plugins("react", "react-hooks"),
  {
    languageOptions: {
      globals: {
        ...globals.jest,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "scripts/build.mjs",
            "packages/*/scripts/build.mjs",
            "eslint.config.mjs",
          ],
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
    },
  }
)
