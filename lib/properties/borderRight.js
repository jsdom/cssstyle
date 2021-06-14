'use strict';

const { createShorthandGetter, createShorthandSetter } = require('../parsers.js');

const longhands = {
  'border-right-width': require('./borderRightWidth.js'),
  'border-right-style': require('./borderRightStyle.js'),
  'border-right-color': require('./borderRightColor.js'),
};

module.exports.definition = {
  set: createShorthandSetter(longhands),
  get: createShorthandGetter(longhands),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
