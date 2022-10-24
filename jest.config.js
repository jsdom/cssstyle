const path = require("path");
module.exports = {
  "verbose": true,
  "collectCoverage": true,
  "collectCoverageFrom": [
    "lib/**/*.js",
    "!lib/implementedProperties.js",
    "!lib/properties.js",
  ],
  "coverageDirectory": "coverage",
  "transform": {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: path.resolve(__dirname, './tsconfig.spec.json')
      },
    ],
  }
};
