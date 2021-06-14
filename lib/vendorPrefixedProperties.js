'use strict';

// const mozProperties = require('./mozProperties.js')
const webkitProperties = require('./webkitProperties.js');

module.exports = new Set(
  [
    // ...mozProperties,
    ...webkitProperties,
  ].sort()
);
