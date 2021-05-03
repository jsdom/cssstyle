'use strict';

module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2018,
  },
  env: {
    es6: true,
    node: true,
  },
  globals: {
    exports: true,
    module: true,
    require: true,
    describe: true,
    it: true,
    test: true,
    expect: true,
  },
  plugins: ['prettier'],
  rules: {
    'no-prototype-builtins': 'off',
    'prettier/prettier': [
      'warn',
      {
        printWidth: 100,
        singleQuote: true,
        trailingComma: 'es5',
      },
    ],
    strict: ['warn', 'global'],
  },
  overrides: [
    {
      files: ['lib/implementedProperties.js', 'lib/properties.js'],
      rules: {
        'prettier/prettier': 'off',
      },
    },
    {
      files: 'scripts/**/*',
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
