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
