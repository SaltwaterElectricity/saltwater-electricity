import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import security from "eslint-plugin-security";
import prettierConfig from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "node_modules", "coverage"]),
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      security,
    },
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      ...security.configs.recommended.rules,
      "react/prop-types": "off",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      "security/detect-object-injection": "off",
      // Strict React rules
      "react/no-array-index-key": "error",
      "react/no-danger": "error",
      "react/self-closing-comp": "error",
      "react/jsx-no-useless-fragment": "error",
      "react-hooks/exhaustive-deps": "error",
      "react/display-name": "warn", // Set to warn as many components are missing it
      // Security: Prevent hardcoding sensitive keys
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/AIza[0-9A-Za-z-_]{35}/]",
          message:
            "Do not hardcode Firebase API keys. Use environment variables (VITE_FIREBASE_API_KEY).",
        },
        {
          selector: "Literal[value=/SG\\.[0-9A-Za-z-_]{22}\\.[0-9A-Za-z-_]{43}/]",
          message:
            "Do not hardcode SendGrid API keys. Use environment variables (VITE_SENDGRID_API_KEY).",
        },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
    },
  },
  {
    files: ["api/**/*.js", "vite.config.js", "eslint.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["src/utils/logger.js"],
    rules: {
      "no-console": "off",
    },
  },
  prettierConfig,
]);
