import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default [
  {
    ignores: ["lib/generated/**"]
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs"
    }
  },
  eslintPluginPrettierRecommended,
  {
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "error"
    }
  },
  {
    // FIXME:
    // see https://github.com/jsdom/cssstyle/issues/201
    // see https://github.com/jsdom/cssstyle/issues/202
    files: ["lib/CSSStyleDeclaration.js", "lib/properties/*"],
    rules: {
      "no-var": "off",
      "prefer-template": "off"
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
