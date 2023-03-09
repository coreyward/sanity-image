module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "standard",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["react", "react-hooks", "prettier", "@typescript-eslint"],
  rules: {
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
