module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  extends: [
    "eslint:recommended",
    "standard",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["react", "react-hooks", "prettier", "@typescript-eslint"],
  rules: {
    "prettier/prettier": "warn",
    "no-use-before-define": "off",
    "no-unused-vars": "warn",
    "react/prop-types": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/consistent-type-imports": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    jest: true,
  },
}
