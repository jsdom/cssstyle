module.exports = {
  "verbose": true,
  "collectCoverage": true,
  "collectCoverageFrom": [
    "lib/**/*.js",
    "!lib/CSSStyleDeclaration.js",
    "!lib/implementedProperties.js",
    "!lib/utils.js",
  ],
  "coverageDirectory": "coverage",
};
