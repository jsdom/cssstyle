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
      "consistent-return": "off",
      "func-style": "off",
      "prefer-destructuring": "off",
      "require-unicode-regexp": "off"
    }
  },
  {
    // FIXME:
    // see https://github.com/jsdom/cssstyle/issues/201
    // see https://github.com/jsdom/cssstyle/issues/202
    files: ["lib/parsers.js", "lib/properties/*.js"],
    rules: {
      "no-invalid-this": "off",
      "no-var": "off"
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
    }
  }
];
