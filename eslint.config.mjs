import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  {
    ignores: ['lib/generated/**'],
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
    files: ['scripts/**/*', 'test/**/*'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
