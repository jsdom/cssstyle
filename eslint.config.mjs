import domenicConfig from "@domenic/eslint-config";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default [
  {
    ignores: ["lib/generated/*"]
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs"
    }
  },
  ...domenicConfig,
  prettierRecommended,
  {
    rules: {
      "array-element-newline": "off",
      "consistent-return": "off",
      "new-cap": ["error", { capIsNewExceptions: ["ByteString", "USVString", "DOMString"] }],
      "no-implied-eval": "off",
      "no-invalid-this": "off",
      "prefer-template": "off",
      "require-unicode-regexp": "off"
    }
  },
  {
    files: ["scripts/**/*"],
    languageOptions: {
      globals: globals.node
    },
    rules: {
      "no-console": "off"
    }
  },
  {
    files: ["test/**/*"],
    languageOptions: {
      globals: globals.node
    },
    rules: {
      "func-style": "off"
    }
  }
];
