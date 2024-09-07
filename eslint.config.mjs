import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  {
    ignores: ['lib/implementedProperties.js', 'lib/properties.js'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
  eslintPluginPrettierRecommended,
  {
    files: ['scripts/**/*'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['scripts/**/*', 'tests/**/*'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
