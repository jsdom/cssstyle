module.exports = {
  "verbose": true,
  "collectCoverage": true,
  "collectCoverageFrom": [
    "lib/**/*.js",
    "!lib/CSSStyleDeclaration.js",
    "!lib/Function.js",
    "!lib/VoidFunction.js",
    "!lib/implementedProperties.js",
    "!lib/properties.js",
    "!lib/utils.js",
  ],
  "coverageDirectory": "coverage",
};
