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
      sourceType: "commonjs",
      globals: globals.node
    }
  },
  ...domenicConfig,
  prettierRecommended,
  {
    rules: {
      "consistent-return": "off",
      "require-unicode-regexp": "off"
    }
  }
];
