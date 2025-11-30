import globals from "globals";
import pluginJs from "@eslint/js";
import stylisticJs from '@stylistic/eslint-plugin-js'


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    plugins: {
      '@stylistic/js': stylisticJs
    },
    languageOptions: { 
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
      }
     },
    rules: {
        "no-console": ["warn"],
        "eqeqeq": ["error", "always"],
        "prefer-const": "error",
        "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
        "camelcase": ["error", {"properties": "never"}],
        "indent": ["error", 2],
        "semi": ["error", "always"],
        "max-len": ["error", { "code": 130 }],
        "no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 1 }],
        "@stylistic/js/padding-line-between-statements": [
          "error",
          { blankLine: "always", prev: "cjs-import", next: "*" },
          { blankLine: "any",    prev: "cjs-import", next: "cjs-import" },
          { blankLine: "always", prev: "function", next: "*"},
          { blankLine: "always", prev: "*", next: "function"},
          { blankLine: "always", prev: "*", next: "export"},
        ]
    }
  },
  pluginJs.configs.recommended,
  {
    ignores: [
      "node_modules/**", // Ignore dependencies
    ],
  },
];
